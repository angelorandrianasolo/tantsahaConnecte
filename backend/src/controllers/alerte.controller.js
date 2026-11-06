const AlerteService = require('../services/alerte.service');

// Contrôleur (couche HTTP) — alertes
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || "Tsy fahazotoana eo amin'ny solosaina" });
});

const AlerteController = {
  lister: wrap(async (req, res) => {
    res.json(await AlerteService.lister());
  }),

  listerNonLues: wrap(async (req, res) => {
    res.json(await AlerteService.listerNonLues());
  }),

  obtenir: wrap(async (req, res) => {
    res.json(await AlerteService.obtenir(Number(req.params.id)));
  }),

  creer: wrap(async (req, res) => {
    res.status(201).json(await AlerteService.creer(req.body));
  }),

  modifier: wrap(async (req, res) => {
    res.json(await AlerteService.modifier(Number(req.params.id), req.body));
  }),

  marquerLue: wrap(async (req, res) => {
    res.json(await AlerteService.marquerLue(Number(req.params.id)));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await AlerteService.supprimer(Number(req.params.id)));
  }),

  metadonnees: wrap(async (req, res) => {
    res.json({ types: AlerteService.TYPES, priorites: AlerteService.PRIORITES });
  }),
};

module.exports = AlerteController;
