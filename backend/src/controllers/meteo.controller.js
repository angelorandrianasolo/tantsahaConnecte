const MeteoService = require('../services/meteo.service');

// Contrôleur (couche HTTP) — météo
const { wrap } = require('../middlewares/http');

const MeteoController = {
  lister: wrap(async (req, res) => {
    res.json(await MeteoService.lister(req.query.lieu));
  }),

  prochainsJours: wrap(async (req, res) => {
    res.json(await MeteoService.prochainsJours(req.query.nb, req.query.lieu));
  }),

  obtenirParDate: wrap(async (req, res) => {
    res.json(await MeteoService.obtenirParDate(req.params.date, req.query.lieu));
  }),

  ajouter: wrap(async (req, res) => {
    res.status(201).json(await MeteoService.ajouter(req.body));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await MeteoService.supprimer(Number(req.params.id)));
  }),

  estFavorable: wrap(async (req, res) => {
    res.json(await MeteoService.estFavorableSemis(req.params.date, req.query.lieu));
  }),

  resumeVocal: wrap(async (req, res) => {
    res.json(await MeteoService.resumeVocal(req.params.date, req.query.lieu, req.query.lang));
  }),

  icones: wrap(async (req, res) => {
    res.json(MeteoService.ICONES);
  }),

  actualiser: wrap(async (req, res) => {
    res.json(await MeteoService.actualiser(
      req.body ? req.body.latitude : null,
      req.body ? req.body.longitude : null,
      req.body ? req.body.lieu : null
    ));
  }),
};

module.exports = MeteoController;
