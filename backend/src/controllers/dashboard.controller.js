const DashboardService = require('../services/dashboard.service');

// Contrôleur (couche HTTP) — tableau de bord
const { wrap } = require('../middlewares/http');

const DashboardController = {
  obtenir: wrap(async (req, res) => {
    res.json(await DashboardService.obtenir());
  }),
};

module.exports = DashboardController;
