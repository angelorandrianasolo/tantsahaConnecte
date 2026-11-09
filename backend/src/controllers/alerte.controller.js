const AlerteService = require('../services/alerte.service');

// Contrôleur (couche HTTP) — alertes
const { wrap } = require('../middlewares/http');

const AlerteController = {
  lister: wrap(async (req, res) => {
    res.json(await AlerteService.lister(req.query));
  }),

  listerNonLues: wrap(async (req, res) => {
    res.json(await AlerteService.listerNonLues(req.utilisateur));
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
    res.json(await AlerteService.marquerLue(Number(req.params.id), req.utilisateur));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await AlerteService.supprimer(Number(req.params.id)));
  }),

  metadonnees: wrap(async (req, res) => {
    res.json({ types: AlerteService.TYPES, priorites: AlerteService.PRIORITES });
  }),

  // Génération automatique (plantation + météo)
  actualisation: wrap(async (req, res) => {
    const AlerteAutoService = require('../services/alerte-auto.service');
    res.json(await AlerteAutoService.generer());
  }),
};

module.exports = AlerteController;
