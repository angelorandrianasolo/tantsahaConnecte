const MeteoModel = require('../models/meteo.model');

// Icônes en malagasy
const ICONE_VALIDE = ['masoandro', 'mandravona', 'orana', 'oram-baratra', 'varatra', 'rivotra'];

// Libellés malagasy (anciennes valeurs acceptées par compatibilité)
const ICONE_LABELS = {
  masoandro: 'Masoandro',   // soleil
  mandravona: 'Mandravona', // nuageux
  orana: 'Orana',           // pluie
  'oram-baratra': 'Oram-baratra', // orage avec bruit
  varatra: 'Varatra',       // foudre
  rivotra: 'Rivotra',       // vent
  soleil: 'Masoandro',
  nuage: 'Mandravona',
  pluie: 'Orana',
  orage: 'Oram-baratra',
  vent: 'Rivotra',
};

// Conditions défavorables au semis
const ICONES_DEFAVORABLES = ['oram-baratra', 'orage', 'varatra', 'rivotra', 'vent'];

const SEUIL_PROBA_PLUIE_FAVORABLE = 70; // % → orana suffisante pour le semis

const MeteoService = {
  ICONES: ICONE_VALIDE,

  lister: () => MeteoModel.findAll(),

  prochainsJours: (nb) => {
    const n = Math.min(Math.max(Number(nb) || 3, 1), 7);
    return MeteoModel.findProchainsJours(n);
  },

  obtenirParDate: async (date) => {
    const m = await MeteoModel.findByDate(date);
    if (!m) throw { status: 404, message: "Tsy misy fotoana masoandro amin'ity andro ity" };
    return m;
  },

  ajouter: async (data) => {
    MeteoService.valider(data);
    return MeteoModel.upsert(data);
  },

  supprimer: async (id) => {
    const ok = await MeteoModel.remove(id);
    if (!ok) throw { status: 404, message: 'Tsy misy fotoana masoandro' };
    return { message: 'Voafafana ny fotoana' };
  },

  // --- Règles métier du modèle UML ---

  estFavorableSemis: async (date) => {
    const m = await MeteoModel.findByDate(date);
    if (!m) throw { status: 404, message: "Tsy misy fotoana masoandro amin'ity andro ity" };
    return { ...m, favorableSemis: MeteoService.estFavorable(m) };
  },

  // Version vocale malagasy (prête à être lue à voix haute)
  resumeVocal: async (date) => {
    const m = await MeteoModel.findByDate(date);
    if (!m) throw { status: 404, message: "Tsy misy fotoana masoandro amin'ity andro ity" };
    const favorable = MeteoService.estFavorable(m);
    const icone = ICONE_LABELS[m.icone] || m.icone;
    return {
      date: m.date_prev,
      resume:
        `${icone}. Orana ${m.proba_pluie} kalitiana. ` +
        `${Math.round(m.temp_min)} hatramin'ny ${Math.round(m.temp_max)} digera Celsius. ` +
        (favorable
          ? 'Mety hamono ny hatsy ity andro ity.'
          : 'Tsy mety hamono ny hatsy ity andro ity.'),
      favorableSemis: favorable,
    };
  },

  // --- Actualisation depuis Open-Meteo (source réelle, gratuite, sans clé) ---
  // Le serveur va chercher la météo : le téléphone, lui, reste hors ligne.
  actualiser: async (latitude, longitude) => {
    const lat = Number(latitude) || -19.8583;   // Antsirabe par défaut
    const lon = Number(longitude) || 47.5567;
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lon}` +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=auto&forecast_days=7';

    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), 20000);   // 20 s max (open-meteo peut être lent)

    let r;
    try {
      r = await fetch(url, { signal: ctrl.signal });
    } catch {
      throw { status: 503, message: 'Tsy afaka mijery ny masoandro ankehitriny' }; // hors ligne : on garde l'ancien cache
    } finally {
      clearTimeout(minuteur);
    }
    if (!r.ok) throw { status: 502, message: 'Tsy mety ny tanterahan-dalana masoandro' };

    const d = await r.json();
    const daily = d && d.daily;
    if (!daily || !daily.time) {
      throw { status: 502, message: 'Format tsy eo anilan-dalana' };
    }

    let enregistrees = 0;
    for (let i = 0; i < daily.time.length; i++) {
      await MeteoModel.upsert({
        date_prev: daily.time[i],                                  // AAAA-MM-JJ
        icone: MeteoService.iconeOpenMeteo(daily.weather_code[i]),
        proba_pluie: daily.precipitation_probability_max[i] ?? 0,
        temp_min: daily.temperature_2m_min[i],
        temp_max: daily.temperature_2m_max[i],
      });
      enregistrees++;
    }

    return {
      lieux: `${lat}, ${lon}`,
      miseAJour: enregistrees,
      source: 'open-meteo',
      horodatage: new Date().toISOString(),
    };
  },

  // Codes WMO -> icônes malagasy
  iconeOpenMeteo: (code) => {
    const c = Number(code);
    if (c === 0) return 'masoandro';                     // ciel dégagé
    if ([1, 2, 3, 45, 48].includes(c)) return 'mandravona'; // nuageux / brouillard
    if (c >= 95) return 'oram-baratra';                  // orage (foudre = varatra)
    if ([71, 73, 75, 77, 85, 86].includes(c)) return 'orana'; // neige (rare à MG)
    if (c >= 51) return 'orana';                         // pluie, bruine, averses
    return 'mandravona';
  },

  estFavorable: (m) =>
    Number(m.proba_pluie) >= SEUIL_PROBA_PLUIE_FAVORABLE &&
    !ICONES_DEFAVORABLES.includes(m.icone),

  valider: (data) => {
    if (!data.date_prev) {
      throw { status: 400, message: 'Ilaina ny daty (AAAA-MM-JJ)' };
    }
    if (Number.isNaN(new Date(data.date_prev).getTime())) {
      throw { status: 400, message: 'Diso ny endrika daty (AAAA-MM-JJ)' };
    }
    if (!data.icone || !ICONE_VALIDE.includes(data.icone)) {
      throw { status: 400, message: `Diso endrika. Adino: ${ICONE_VALIDE.join(', ')}` };
    }
    const p = Number(data.proba_pluie);
    if (Number.isNaN(p) || p < 0 || p > 100) {
      throw { status: 400, message: '"proba_pluie" tokony ho eo anelanelan-0 sy 100' };
    }
    const min = Number(data.temp_min);
    const max = Number(data.temp_max);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      throw { status: 400, message: '"temp_min" sy "temp_max" tokony ho isa' };
    }
    if (min > max) {
      throw { status: 400, message: 'Tsy mety ny temp_min ambony noho ny temp_max' };
    }
  },
};

module.exports = MeteoService;
