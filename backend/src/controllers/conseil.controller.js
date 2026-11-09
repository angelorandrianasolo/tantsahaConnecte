const ConseilService = require('../services/conseil.service');
const AudioService = require('../services/audio.service');
const fs = require('fs');
const path = require('path');

// Contrôleur (couche HTTP) — conseils
const { wrap } = require('../middlewares/http');

const ConseilController = {
  lister: wrap(async (req, res) => {
    res.json(await ConseilService.lister());
  }),

  listerTheme: wrap(async (req, res) => {
    res.json(await ConseilService.listerTheme(req.params.theme));
  }),

  obtenir: wrap(async (req, res) => {
    res.json(await ConseilService.obtenir(Number(req.params.id)));
  }),

  creer: wrap(async (req, res) => {
    res.status(201).json(await ConseilService.creer(req.body));
  }),

  modifier: wrap(async (req, res) => {
    res.json(await ConseilService.modifier(Number(req.params.id), req.body));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await ConseilService.supprimer(Number(req.params.id)));
  }),

  versionVocale: wrap(async (req, res) => {
    res.json(await ConseilService.versionVocale(Number(req.params.id), req.query.lang));
  }),

  themes: wrap(async (req, res) => {
    res.json(ConseilService.THEMES);
  }),

  // --- AUDIO : renvoie les paramètres lus par la fonction JS de voix ---
  // GET /conseils/:id/audio?lang=mg|fr&rapidite=0.9
  //   -> { texte, langue, rapidite, tonalite, volume, dureeEstimeeSec, fichier }
  // La fonction côté client fait :
  //   const u = new SpeechSynthesisUtterance(p.texte);
  //   u.lang = p.langue; u.rate = p.rapidite; u.pitch = p.tonalite; speechSynthesis.speak(u);
  audio: wrap(async (req, res) => {
    const id = Number(req.params.id);
    const v = await ConseilService.versionVocale(id, req.query.lang); // 404 si inexistant
    const parametres = AudioService.lire({
      texte: v.texteAVoix,
      langue: req.query.lang,
      rapidite: req.query.rapidite || 0.9,
    });
    res.json({ ...parametres, id, fichier: ConseilController._fichierAudio(id) });
  }),

  // Fichier wav/mp3 pré-enregistré (optionnel) — 404 si absent
  fichierAudio: wrap(async (req, res) => {
    const id = Number(req.params.id);
    await ConseilService.obtenir(id);
    const fichier = ConseilController._fichierAudio(id);
    if (!fichier) {
      throw { status: 404, message: "Tsy misy feo ho an'ity torolalana ity" };
    }
    res.type(fichier.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav');
    res.sendFile(path.join(__dirname, '..', '..', 'audio', fichier));
  }),

  _fichierAudio: (id) => {
    const dossier = path.join(__dirname, '..', '..', 'audio');
    for (const ext of ['wav', 'mp3']) {
      if (fs.existsSync(path.join(dossier, `conseil-${id}.${ext}`))) return `conseil-${id}.${ext}`;
    }
    return null;
  },
};

module.exports = ConseilController;
