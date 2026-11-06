const pool = require('../config/db');

// Modèle (accès aux données) — table observations
const ObservationModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT o.id, o.parcelle_id, o.type, TO_CHAR(o.date_obs, 'YYYY-MM-DD') AS date_obs, o.valeur, o.created_at,
              p.nom AS parcelle
       FROM observations o
       LEFT JOIN parcelles p ON p.id = o.parcelle_id
       ORDER BY o.date_obs DESC, o.id DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT o.id, o.parcelle_id, o.type, TO_CHAR(o.date_obs, 'YYYY-MM-DD') AS date_obs, o.valeur, o.created_at,
              p.nom AS parcelle
       FROM observations o
       LEFT JOIN parcelles p ON p.id = o.parcelle_id
       WHERE o.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  // Observations d'une parcelle (timeline du journal de culture)
  findByParcelle: async (parcelleId) => {
    const { rows } = await pool.query(
      `SELECT id, parcelle_id, type, TO_CHAR(date_obs, 'YYYY-MM-DD') AS date_obs, valeur, created_at
       FROM observations
       WHERE parcelle_id = $1
       ORDER BY date_obs DESC, id DESC`,
      [parcelleId]
    );
    return rows;
  },

  create: async ({ parcelle_id, type, date_obs, valeur }) => {
    const { rows } = await pool.query(
      `INSERT INTO observations (parcelle_id, type, date_obs, valeur)
       VALUES ($1, $2, $3, $4)
       RETURNING id, parcelle_id, type, TO_CHAR(date_obs, 'YYYY-MM-DD') AS date_obs, valeur, created_at`,
      [parcelle_id, type, date_obs, valeur || null]
    );
    return rows[0];
  },

  update: async (id, { parcelle_id, type, date_obs, valeur }) => {
    const { rows } = await pool.query(
      `UPDATE observations
       SET parcelle_id = $1, type = $2, date_obs = $3, valeur = $4
       WHERE id = $5
       RETURNING id, parcelle_id, type, TO_CHAR(date_obs, 'YYYY-MM-DD') AS date_obs, valeur, created_at`,
      [parcelle_id, type, date_obs, valeur || null, id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM observations WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = ObservationModel;
