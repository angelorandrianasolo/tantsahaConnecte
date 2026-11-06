const ObservationService = require('../services/observation.service');

// Contrôleur (couche HTTP) — observations
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

const ObservationController = {
  lister: wrap(async (req, res) => {
    res.json(await ObservationService.lister());
  }),

  listerParcelle: wrap(async (req, res) => {
    res.json(await ObservationService.listerParcelle(Number(req.params.id)));
  }),

  obtenir: wrap(async (req, res) => {
    res.json(await ObservationService.obtenir(Number(req.params.id)));
  }),

  creer: wrap(async (req, res) => {
    res.status(201).json(await ObservationService.creer(req.body));
  }),

  modifier: wrap(async (req, res) => {
    res.json(await ObservationService.modifier(Number(req.params.id), req.body));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await ObservationService.supprimer(Number(req.params.id)));
  }),

  types: wrap(async (req, res) => {
    res.json(ObservationService.TYPES);
  }),
};

module.exports = ObservationController;
