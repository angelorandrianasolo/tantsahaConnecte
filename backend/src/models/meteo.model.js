const pool = require('../config/db');

const COLS = `TO_CHAR(date_prev, 'YYYY-MM-DD') AS date_prev, lieu, icone, proba_pluie, temp_min, temp_max`;

// Modèle (accès aux données) — table previsions_meteo (multilieu)
const MeteoModel = {
  findAll: async (lieu) => {
    const { rows } = await pool.query(
      `SELECT id, ${COLS}
       FROM previsions_meteo
       ${lieu ? 'WHERE lieu = $1' : ''}
       ORDER BY date_prev ASC${lieu ? '' : ', lieu ASC'}`,
      lieu ? [lieu] : []
    );
    return rows;
  },

  // Prochains N jours d'un lieu (l'app affiche 3 jours maximum — concision)
  findProchainsJours: async (nbJours, lieu) => {
    const { rows } = await pool.query(
      `SELECT id, ${COLS}
       FROM previsions_meteo
       WHERE date_prev >= CURRENT_DATE${lieu ? ' AND lieu = $2' : ''}
       ORDER BY date_prev ASC
       LIMIT $1`,
      lieu ? [nbJours, lieu] : [nbJours]
    );
    return rows;
  },

  findByDate: async (date, lieu) => {
    const { rows } = await pool.query(
      `SELECT id, ${COLS}
       FROM previsions_meteo
       WHERE date_prev = $1${lieu ? ' AND lieu = $2' : ''}
       ORDER BY lieu ASC
       LIMIT 1`,
      lieu ? [date, lieu] : [date]
    );
    return rows[0] || null;
  },

  // Lieux déjà renseignés (pour les alertes multi-régions)
  findLieux: async () => {
    const { rows } = await pool.query(
      'SELECT DISTINCT lieu FROM previsions_meteo ORDER BY lieu'
    );
    return rows.map((r) => r.lieu);
  },

  // Upsert : la météo se remplace à chaque synchro, par lieu
  upsert: async ({ date_prev, icone, proba_pluie, temp_min, temp_max, lieu }) => {
    const { rows } = await pool.query(
      `INSERT INTO previsions_meteo (date_prev, icone, proba_pluie, temp_min, temp_max, lieu)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (date_prev, lieu) DO UPDATE
       SET icone = EXCLUDED.icone,
           proba_pluie = EXCLUDED.proba_pluie,
           temp_min = EXCLUDED.temp_min,
           temp_max = EXCLUDED.temp_max
       RETURNING id, ${COLS}`,
      [date_prev, icone, proba_pluie, temp_min, temp_max, lieu || 'Antsirabe']
    );
    return rows[0];
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM previsions_meteo WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = MeteoModel;
