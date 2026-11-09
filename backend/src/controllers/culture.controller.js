const CultureService = require('../services/culture.service');

// Contrôleur (couche HTTP) — cultures
const { wrap } = require('../middlewares/http');

const CultureController = {
  lister: wrap(async (req, res) => {
    res.json(await CultureService.lister());
  }),

  obtenir: wrap(async (req, res) => {
    res.json(await CultureService.obtenir(Number(req.params.id)));
  }),

  creer: wrap(async (req, res) => {
    res.status(201).json(await CultureService.creer(req.body));
  }),

  modifier: wrap(async (req, res) => {
    res.json(await CultureService.modifier(Number(req.params.id), req.body));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await CultureService.supprimer(Number(req.params.id)));
  }),

  dateRecolte: wrap(async (req, res) => {
    res.json(await CultureService.dateRecolteEstimee(
      Number(req.params.id),
      req.query.plantation || req.body.plantation
    ));
  }),
};

module.exports = CultureController;
