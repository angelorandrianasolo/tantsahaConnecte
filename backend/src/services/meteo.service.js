const MeteoModel = require('../models/meteo.model');

const ICONE_VALIDE = ['soleil', 'nuage', 'pluie', 'orage', 'vent'];

// Seuils métier (décision semis)
const SEUIL_PROBA_PLUIE_FAVORABLE = 70; // % → pluie suffisante pour le semis

// Service (logique métier) — météo
const MeteoService = {
  ICONES: ICONE_VALIDE,

  lister: () => MeteoModel.findAll(),

  prochainsJours: (nb) => {
    const n = Math.min(Math.max(Number(nb) || 3, 1), 7); // l'app n'affiche jamais plus de 7 j
    return MeteoModel.findProchainsJours(n);
  },

  obtenirParDate: async (date) => {
    const m = await MeteoModel.findByDate(date);
    if (!m) throw { status: 404, message: 'Prévision introuvable pour cette date' };
    return m;
  },

  ajouter: async (data) => {
    MeteoService.valider(data);
    return MeteoModel.upsert(data);
  },

  supprimer: async (id) => {
    const ok = await MeteoModel.remove(id);
    if (!ok) throw { status: 404, message: 'Prévision introuvable' };
    return { message: 'Prévision supprimée' };
  },

  // --- Règles métier du modèle UML ---

  // PrevisionMeteo.estFavorableSemis()
  estFavorableSemis: async (date) => {
    const m = await MeteoModel.findByDate(date);
    if (!m) throw { status: 404, message: 'Prévision introuvable pour cette date' };
    const favorable =
      Number(m.proba_pluie) >= SEUIL_PROBA_PLUIE_FAVORABLE &&
      m.icone !== 'orage' &&
      m.icone !== 'vent';
    return { ...m, favorableSemis: favorable };
  },

  // PrevisionMeteo.resumeVocal() → texte malagasy prêt à lire (version texte de l'audio)
  resumeVocal: async (date) => {
    const m = await MeteoModel.findByDate(date);
    if (!m) throw { status: 404, message: 'Prévision introuvable pour cette date' };
    const favorable =
      Number(m.proba_pluie) >= SEUIL_PROBA_PLUIE_FAVORABLE &&
      m.icone !== 'orage' &&
      m.icone !== 'vent';
    return {
      date: m.date_prev,
      resume: `${m.icone}, ${m.proba_pluie}% feo, ${m.temp_min}°C-${m.temp_max}°C. ${
        favorable ? 'Tena mety hamono ny hatsy.' : 'Tsy mety hamono ny hatsy ity andro ity.'
      }`,
      favorableSemis: favorable,
    };
  },

  valider: (data) => {
    if (!data.date_prev) {
      throw { status: 400, message: 'Le champ "date_prev" est obligatoire (AAAA-MM-JJ)' };
    }
    if (Number.isNaN(new Date(data.date_prev).getTime())) {
      throw { status: 400, message: 'Format de date invalide (AAAA-MM-JJ)' };
    }
    if (!data.icone || !ICONE_VALIDE.includes(data.icone)) {
      throw { status: 400, message: `Icône invalide. Valeurs admises : ${ICONE_VALIDE.join(', ')}` };
    }
    const p = Number(data.proba_pluie);
    if (Number.isNaN(p) || p < 0 || p > 100) {
      throw { status: 400, message: '"proba_pluie" doit être entre 0 et 100' };
    }
    const min = Number(data.temp_min);
    const max = Number(data.temp_max);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      throw { status: 400, message: '"temp_min" et "temp_max" doivent être numériques' };
    }
    if (min > max) {
      throw { status: 400, message: '"temp_min" ne peut pas dépasser "temp_max"' };
    }
  },
};

module.exports = MeteoService;
