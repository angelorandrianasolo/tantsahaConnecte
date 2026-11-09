const { estFrancais } = require('../i18n');

/* ============================================================
   Service AUDIO — la fonction centrale : lire()
   Elle reçoit des paramètres et renvoie TOUS les paramètres
   nécessaires à une fonction JS de synthèse vocale :
     texte, langue (BCP-47), rapidite, tonalite, volume
   Usage côté client :
     const p = await fetch('/audio?texte=...&lang=fr').then(r => r.json());
     const u = new SpeechSynthesisUtterance(p.texte);
     u.lang = p.langue; u.rate = p.rapidite; u.pitch = p.tonalite; u.volume = p.volume;
     speechSynthesis.speak(u);
   ============================================================ */

const LANGUES = {
  mg: 'mg-MG',   // malagasy
  fr: 'fr-FR',   // français
};

const AudioService = {
  LANGUES,

  // --- La fonction qui LIT les paramètres qu'on lui met dedans ---
  lire: ({ texte, langue = 'mg', rapidite = 0.9, tonalite = 1, volume = 1 } = {}) => {
    const clean = String(texte == null ? '' : texte).trim();
    if (!clean) {
      throw { status: 400, message: 'Ilaina ny hoe horesahina' };
    }

    const code = String(langue).toLowerCase().slice(0, 2);
    if (!LANGUES[code]) {
      throw { status: 400, message: 'Diso ny fitsipika hafatra' };
    }

    const r = Number(rapidite);
    if (Number.isNaN(r) || r < 0.5 || r > 1.5) {
      throw { status: 400, message: 'Diso ny hafainganam-piresaka' };
    }

    const mots = clean.split(/\s+/).length;
    return {
      texte: clean,
      langue: LANGUES[code],        // ex. "mg-MG" pour SpeechSynthesisUtterance
      langueCode: code,             // "mg" | "fr"
      rapidite: r,                  // SpeechSynthesisUtterance.rate
      tonalite: Number(tonalite) || 1,   // .pitch
      volume: Math.min(Math.max(Number(volume) || 1, 0), 1), // .volume
      dureeEstimeeSec: Math.max(1, Math.round(mots / (2.5 * r))),
      horodatage: new Date().toISOString(),
    };
  },

  // Raccourci : construit directement les paramètres d'un texte donné
  pour: (texte, langue, rapidite) =>
    AudioService.lire({ texte, langue, rapidite }),
};

module.exports = AudioService;
