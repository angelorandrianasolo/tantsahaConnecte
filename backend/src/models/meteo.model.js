const pool = require('../config/db');

// Modèle (accès aux données) — table previsions_meteo
const MeteoModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT id, TO_CHAR(date_prev, 'YYYY-MM-DD') AS date_prev, icone, proba_pluie, temp_min, temp_max
       FROM previsions_meteo
       ORDER BY date_prev ASC`
    );
    return rows;
  },

  // Prochains N jours (l'app affiche 3 jours maximum — concision)
  findProchainsJours: async (nbJours) => {
    const { rows } = await pool.query(
      `SELECT id, TO_CHAR(date_prev, 'YYYY-MM-DD') AS date_prev, icone, proba_pluie, temp_min, temp_max
       FROM previsions_meteo
       WHERE date_prev >= CURRENT_DATE
       ORDER BY date_prev ASC
       LIMIT $1`,
      [nbJours]
    );
    return rows;
  },

  findByDate: async (date) => {
    const { rows } = await pool.query(
      `SELECT id, TO_CHAR(date_prev, 'YYYY-MM-DD') AS date_prev, icone, proba_pluie, temp_min, temp_max
       FROM previsions_meteo
       WHERE date_prev = $1`,
      [date]
    );
    return rows[0] || null;
  },

  // Upsert : la météo se remplace à chaque synchro
  upsert: async ({ date_prev, icone, proba_pluie, temp_min, temp_max }) => {
    const { rows } = await pool.query(
      `INSERT INTO previsions_meteo (date_prev, icone, proba_pluie, temp_min, temp_max)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (date_prev) DO UPDATE
       SET icone = EXCLUDED.icone,
           proba_pluie = EXCLUDED.proba_pluie,
           temp_min = EXCLUDED.temp_min,
           temp_max = EXCLUDED.temp_max
       RETURNING id, TO_CHAR(date_prev, 'YYYY-MM-DD') AS date_prev, icone, proba_pluie, temp_min, temp_max`,
      [date_prev, icone, proba_pluie, temp_min, temp_max]
    );
    return rows[0];
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM previsions_meteo WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = MeteoModel;
