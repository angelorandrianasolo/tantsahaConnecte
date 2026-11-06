const pool = require('../config/db');

// Modèle (accès aux données) — table alertes
const AlerteModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT id, type, priorite, message, lue, created_at
       FROM alertes
       ORDER BY lue ASC,
                CASE priorite WHEN 'URGENTE' THEN 0 ELSE 1 END,
                created_at DESC`
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT id, type, priorite, message, lue, created_at FROM alertes WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  // Alertes non lues (ce qui s'affiche en premier dans l'app)
  findNonLues: async () => {
    const { rows } = await pool.query(
      `SELECT id, type, priorite, message, lue, created_at
       FROM alertes
       WHERE lue = FALSE
       ORDER BY CASE priorite WHEN 'URGENTE' THEN 0 ELSE 1 END,
                created_at DESC`
    );
    return rows;
  },

  create: async ({ type, priorite, message }) => {
    const { rows } = await pool.query(
      `INSERT INTO alertes (type, priorite, message)
       VALUES ($1, $2, $3)
       RETURNING id, type, priorite, message, lue, created_at`,
      [type, priorite || 'NORMALE', message]
    );
    return rows[0];
  },

  update: async (id, { type, priorite, message }) => {
    const { rows } = await pool.query(
      `UPDATE alertes SET type = $1, priorite = $2, message = $3
       WHERE id = $4
       RETURNING id, type, priorite, message, lue, created_at`,
      [type, priorite, message, id]
    );
    return rows[0] || null;
  },

  marquerLue: async (id) => {
    const { rows } = await pool.query(
      'UPDATE alertes SET lue = TRUE WHERE id = $1 RETURNING id, type, priorite, message, lue, created_at',
      [id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM alertes WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = AlerteModel;
