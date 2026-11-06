const ParcelleService = require('../services/parcelle.service');

// Contrôleur (couche HTTP) — parcelles
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || "Tsy fahazotoana eo amin'ny solosaina" });
});

const ParcelleController = {
  lister: wrap(async (req, res) => {
    res.json(await ParcelleService.lister());
  }),

  obtenir: wrap(async (req, res) => {
    res.json(await ParcelleService.obtenir(Number(req.params.id)));
  }),

  creer: wrap(async (req, res) => {
    res.status(201).json(await ParcelleService.creer(req.body));
  }),

  modifier: wrap(async (req, res) => {
    res.json(await ParcelleService.modifier(Number(req.params.id), req.body));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await ParcelleService.supprimer(Number(req.params.id)));
  }),
};

module.exports = ParcelleController;
