const SessionService = require('../services/session.service');

// Contrôleur (couche HTTP) — session
const { wrap } = require('../middlewares/http');
const { tokenRequete } = require('../middlewares/session');

const SessionController = {
  ouvrir: wrap(async (req, res) => {
    res.status(201).json(await SessionService.ouvrir(req.body));
  }),

  identifier: wrap(async (req, res) => {
    const s = await SessionService.identifier(tokenRequete(req));
    if (!s) throw { status: 401, message: 'Tsy misy feo token' };
    res.json(s);
  }),

  fermer: wrap(async (req, res) => {
    res.json(await SessionService.fermer(tokenRequete(req)));
  }),
};

module.exports = SessionController;
