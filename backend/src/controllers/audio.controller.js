const AudioService = require('../services/audio.service');

// Contrôleur (couche HTTP) — audio
const { wrap } = require('../middlewares/http');

const AudioController = {
  // GET /audio?texte=...&lang=mg|fr&rapidite=0.9
  // -> les paramètres que la fonction JS de voix doit lire
  lire: wrap(async (req, res) => {
    res.json(AudioService.lire({
      texte: req.query.texte,
      langue: req.query.lang,
      rapidite: req.query.rapidite,
      tonalite: req.query.tonalite,
      volume: req.query.volume,
    }));
  }),

  // POST /audio { texte, langue, rapidite } (texte long)
  lirePost: wrap(async (req, res) => {
    res.json(AudioService.lire(req.body || {}));
  }),

  langues: wrap(async (req, res) => {
    res.json(AudioService.LANGUES);
  }),
};

module.exports = AudioController;
