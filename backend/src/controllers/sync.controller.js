const SyncService = require('../services/sync.service');

// Contrôleur (couche HTTP) — synchro offline
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || "Tsy fahazotoana eo amin'ny solosaina" });
});

const SyncController = {
  envoyer: wrap(async (req, res) => {
    res.json(await SyncService.envoyer(req.body));
  }),

  telecharger: wrap(async (req, res) => {
    res.json(await SyncService.telecharger());
  }),
};

module.exports = SyncController;
