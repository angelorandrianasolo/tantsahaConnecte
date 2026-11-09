const MeteoModel = require('../models/meteo.model');
const pool = require('../config/db');
const https = require('https');

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
  LIEU_DEFAUT: 'Antsirabe',

  // Libellés français de l'icône (site multilingue)
  iconeFrancais: (code) => ({
    masoandro: 'Soleil',
    mandravona: 'Nuageux',
    orana: 'Pluie',
    'oram-baratra': 'Orage',
    varatra: 'Foudre',
    rivotra: 'Vent',
  }[code] || code),

  lister: (lieu) => MeteoModel.findAll(lieu),

  prochainsJours: (nb, lieu) => {
    const n = Math.min(Math.max(Number(nb) || 3, 1), 7);
    return MeteoModel.findProchainsJours(n, lieu || MeteoService.LIEU_DEFAUT);
  },

  obtenirParDate: async (date, lieu) => {
    const m = await MeteoModel.findByDate(date, lieu || MeteoService.LIEU_DEFAUT);
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

  estFavorableSemis: async (date, lieu) => {
    const m = await MeteoModel.findByDate(date, lieu || MeteoService.LIEU_DEFAUT);
    if (!m) throw { status: 404, message: "Tsy misy fotoana masoandro amin'ity andro ity" };
    return { ...m, favorableSemis: MeteoService.estFavorable(m) };
  },

  // Version vocale bilingue (prête à être lue à voix haute) — ?lang=mg|fr
  resumeVocal: async (date, lieu, langue) => {
    const m = await MeteoModel.findByDate(date, lieu || MeteoService.LIEU_DEFAUT);
    if (!m) throw { status: 404, message: "Tsy misy fotoana masoandro amin'ity andro ity" };
    const favorable = MeteoService.estFavorable(m);
    const fr = String(langue || '').toLowerCase().startsWith('fr');
    const min = Math.round(m.temp_min);
    const max = Math.round(m.temp_max);

    const resume = fr
      ? `À ${m.lieu} : ${MeteoService.iconeFrancais(m.icone)}. Pluie à ${m.proba_pluie} %. ` +
        `De ${min} à ${max} degrés Celsius. ` +
        (favorable ? 'Favorable pour semer.' : 'Pas favorable pour semer.')
      : `Amin'ny ${m.lieu}: ${ICONE_LABELS[m.icone] || m.icone}. Orana ${m.proba_pluie} kalitiana. ` +
        `${min} hatramin'ny ${max} digera Celsius. ` +
        (favorable
          ? 'Mety hamono ny hatsy ity andro ity.'
          : 'Tsy mety hamono ny hatsy ity andro ity.');

    return {
      date: m.date_prev,
      lieu: m.lieu,
      langue: fr ? 'fr' : 'mg',
      resume,
      favorableSemis: favorable,
    };
  },

  // --- Actualisation depuis Open-Meteo (source réelle, gratuite, sans clé) ---
  // Le serveur va chercher la météo : le téléphone, lui, reste hors ligne.
  actualiser: async (latitude, longitude, lieu) => {
    const lat = Number(latitude) || -19.8583;   // Antsirabe par défaut
    const lon = Number(longitude) || 47.5567;
    const estDefaut = !latitude && !longitude;
    const label = lieu || (estDefaut ? 'Antsirabe' : `${lat},${lon}`);
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lon}` +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=auto&forecast_days=7';

    // Requête robuste (2 tentatives) : le réseau malgache est parfois lent
    let brut;
    try {
      brut = await MeteoService._requeter(url);
    } catch (e) {
      // hors ligne : on garde l'ancien cache
      throw e.status ? e : { status: 503, message: 'Tsy afaka mijery ny masoandro ankehitriny' };
    }

    let d;
    try {
      d = JSON.parse(brut);
    } catch {
      throw { status: 502, message: 'Format tsy eo anilan-dalana' };
    }
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
        lieu: label,
      });
      enregistrees++;
    }

    return {
      lieu: label,
      miseAJour: enregistrees,
      source: 'open-meteo',
      horodatage: new Date().toISOString(),
    };
  },

  // --- Requête HTTPS sortante : IPv4 + timeout + 2 tentatives ---
  // (l'IPv6 et le réseau capricieux font échouer fetch() ici)
  _essaiHTTPS: (url) => new Promise((resolve, reject) => {
    let fini = false;
    const req = https.get(url, { family: 4, timeout: 25000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        fini = true;
        return reject({ status: 502, message: 'Tsy mety ny tanterahan-dalana masoandro' });
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (data += c));
      res.on('end', () => { if (!fini) { fini = true; resolve(data); } });
    });
    req.on('timeout', () => req.destroy(new Error('lany andro')));
    req.on('error', () => {
      if (!fini) { fini = true; reject({ status: 503, message: 'Tsy afaka mijery ny masoandro ankehitriny' }); }
    });
  }),

  _requeter: async (url) => {
    let dernier = null;
    for (let tentative = 0; tentative < 2; tentative++) {
      try {
        return await MeteoService._essaiHTTPS(url);
      } catch (e) {
        dernier = e;
        if (tentative === 0) await new Promise((r) => setTimeout(r, 1500));
      }
    }
    throw dernier;
  },

  // --- Actualisation de TOUTES les régions des utilisateurs ---
  actualiserTous: async () => {
    const { rows } = await pool.query(
      `SELECT DISTINCT region, latitude, longitude
       FROM utilisateurs
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
       ORDER BY region
       LIMIT 5`
    );

    // aucun lieu déclaré -> Antsirabe par défaut
    if (!rows.length) {
      const r = await MeteoService.actualiser();
      return { lieux: 1, jours: r.miseAJour, source: r.source, horodatage: r.horodatage };
    }

    let jours = 0;
    let lieux = 0;
    for (const l of rows) {
      try {
        const r = await MeteoService.actualiser(
          l.latitude, l.longitude,
          l.region || `${l.latitude},${l.longitude}`
        );
        jours += r.miseAJour;
        lieux++;
      } catch {
        // région injoignable : on garde son ancien cache (jamais de perte)
      }
    }
    return { lieux, jours, source: 'open-meteo', horodatage: new Date().toISOString() };
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
