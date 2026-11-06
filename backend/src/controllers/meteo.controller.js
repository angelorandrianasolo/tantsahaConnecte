const MeteoService = require('../services/meteo.service');

// Contrôleur (couche HTTP) — météo
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || "Tsy fahazotoana eo amin'ny solosaina" });
});

const MeteoController = {
  lister: wrap(async (req, res) => {
    res.json(await MeteoService.lister());
  }),

  prochainsJours: wrap(async (req, res) => {
    res.json(await MeteoService.prochainsJours(req.query.nb || 3));
  }),

  obtenirParDate: wrap(async (req, res) => {
    res.json(await MeteoService.obtenirParDate(req.params.date));
  }),

  ajouter: wrap(async (req, res) => {
    res.status(201).json(await MeteoService.ajouter(req.body));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await MeteoService.supprimer(Number(req.params.id)));
  }),

  estFavorable: wrap(async (req, res) => {
    res.json(await MeteoService.estFavorableSemis(req.params.date));
  }),

  resumeVocal: wrap(async (req, res) => {
    res.json(await MeteoService.resumeVocal(req.params.date));
  }),

  icones: wrap(async (req, res) => {
    res.json(MeteoService.ICONES);
  }),

  actualiser: wrap(async (req, res) => {
    res.json(await MeteoService.actualiser(
      req.body ? req.body.latitude : null,
      req.body ? req.body.longitude : null
    ));
  }),
};

module.exports = MeteoController;
