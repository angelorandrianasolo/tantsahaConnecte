const pool = require('../config/db');

// Modèle (accès aux données) — table cultures
const CultureModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT id, nom_mg, pictogramme, duree_cycle_jours
       FROM cultures ORDER BY id`
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT id, nom_mg, pictogramme, duree_cycle_jours
       FROM cultures WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ nom_mg, pictogramme, duree_cycle_jours }) => {
    const { rows } = await pool.query(
      `INSERT INTO cultures (nom_mg, pictogramme, duree_cycle_jours)
       VALUES ($1, $2, $3)
       RETURNING id, nom_mg, pictogramme, duree_cycle_jours`,
      [nom_mg, pictogramme || '🌱', duree_cycle_jours]
    );
    return rows[0];
  },

  update: async (id, { nom_mg, pictogramme, duree_cycle_jours }) => {
    const { rows } = await pool.query(
      `UPDATE cultures
       SET nom_mg = $1, pictogramme = $2, duree_cycle_jours = $3
       WHERE id = $4
       RETURNING id, nom_mg, pictogramme, duree_cycle_jours`,
      [nom_mg, pictogramme, duree_cycle_jours, id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM cultures WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = CultureModel;
