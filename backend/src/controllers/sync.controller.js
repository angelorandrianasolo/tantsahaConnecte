const SyncService = require('../services/sync.service');

// Contrôleur (couche HTTP) — synchro offline
const { wrap } = require('../middlewares/http');

const SyncController = {
  envoyer: wrap(async (req, res) => {
    res.json(await SyncService.envoyer(req.body));
  }),

  telecharger: wrap(async (req, res) => {
    res.json(await SyncService.telecharger());
  }),
};

module.exports = SyncController;
