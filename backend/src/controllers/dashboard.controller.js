const DashboardService = require('../services/dashboard.service');

// Contrôleur (couche HTTP) — tableau de bord
const wrap = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((err) => {
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

const DashboardController = {
  obtenir: wrap(async (req, res) => {
    res.json(await DashboardService.obtenir());
  }),
};

module.exports = DashboardController;
