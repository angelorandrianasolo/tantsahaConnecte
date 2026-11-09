const pool = require('../config/db');
const MeteoModel = require('../models/meteo.model');
const AlerteModel = require('../models/alerte.model');
const ObservationModel = require('../models/observation.model');

// Service (logique métier) — tableau de bord de l'accueil
// Regroupe en 1 appel ce que l'écran d'accueil doit afficher (1 requête = 1 appel réseau)
const DashboardService = {
  obtenir: async () => {
    const [meteo, alertes, derniereObs, totalParcelles] = await Promise.all([
      MeteoModel.findProchainsJours(3, require('./meteo.service').LIEU_DEFAUT), // bandeau météo
      AlerteModel.findNonLues(),                 // badge d'alertes
      pool.query(
        `SELECT o.id, o.type, TO_CHAR(o.date_obs, 'YYYY-MM-DD') AS date_obs, o.valeur, p.nom AS parcelle
         FROM observations o
         LEFT JOIN parcelles p ON p.id = o.parcelle_id
         ORDER BY o.date_obs DESC, o.id DESC
         LIMIT 1`
      ),
      pool.query('SELECT count(*) AS total FROM parcelles'),
    ]);

    const alertesUrgentes = alertes.filter((a) => a.priorite === 'URGENTE');

    return {
      meteo,
      alertes: {
        total: alertes.length,
        urgentes: alertesUrgentes.length,
        liste: alertes,
      },
      derniereObservation: derniereObs.rows[0] || null,
      parcelles: Number(totalParcelles.rows[0].total),
      horodatage: new Date().toISOString(),
    };
  },
};

module.exports = DashboardService;
