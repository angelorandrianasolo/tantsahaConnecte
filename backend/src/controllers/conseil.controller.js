const ConseilService = require('../services/conseil.service');

// Contrôleur (couche HTTP) — conseils
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || "Tsy fahazotoana eo amin'ny solosaina" });
});

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
    res.json(await ConseilService.versionVocale(Number(req.params.id)));
  }),

  themes: wrap(async (req, res) => {
    res.json(ConseilService.THEMES);
  }),
};

module.exports = ConseilController;
