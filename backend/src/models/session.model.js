const pool = require('../config/db');

// Modèle (accès aux données) — table sessions
const SessionModel = {
  create: async (token, utilisateur_id) => {
    const { rows } = await pool.query(
      `INSERT INTO sessions (token, utilisateur_id) VALUES ($1, $2)
       RETURNING token, utilisateur_id, created_at`,
      [token, utilisateur_id]
    );
    return rows[0];
  },

  findByToken: async (token) => {
    const { rows } = await pool.query(
      `SELECT s.token, s.created_at,
              u.id, u.nom, u.langue, u.region, u.latitude, u.longitude
       FROM sessions s
       JOIN utilisateurs u ON u.id = s.utilisateur_id
       WHERE s.token = $1`,
      [token]
    );
    return rows[0] || null;
  },

  remove: async (token) => {
    const { rowCount } = await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    return rowCount > 0;
  },
};

module.exports = SessionModel;
