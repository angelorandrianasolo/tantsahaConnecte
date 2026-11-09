const UtilisateurService = require('../services/utilisateur.service');

// Contrôleur (couche HTTP) — utilisateurs
const { wrap } = require('../middlewares/http');

const UtilisateurController = {
  lister: wrap(async (req, res) => {
    res.json(await UtilisateurService.lister());
  }),

  obtenir: wrap(async (req, res) => {
    res.json(await UtilisateurService.obtenir(Number(req.params.id)));
  }),

  creer: wrap(async (req, res) => {
    const u = await UtilisateurService.creer(req.body);
    res.status(201).json(u);
  }),

  modifier: wrap(async (req, res) => {
    res.json(await UtilisateurService.modifier(Number(req.params.id), req.body));
  }),

  supprimer: wrap(async (req, res) => {
    res.json(await UtilisateurService.supprimer(Number(req.params.id)));
  }),

  preferences: wrap(async (req, res) => {
    res.json(await UtilisateurService.preferences(Number(req.params.id), req.body));
  }),
};

module.exports = UtilisateurController;
