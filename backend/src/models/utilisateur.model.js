const pool = require('../config/db');

// Modèle (couche d'accès aux données) — table utilisateurs
const UtilisateurModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      'SELECT id, nom, langue, created_at FROM utilisateurs ORDER BY id'
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT id, nom, langue, created_at FROM utilisateurs WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ nom, langue }) => {
    const { rows } = await pool.query(
      'INSERT INTO utilisateurs (nom, langue) VALUES ($1, $2) RETURNING id, nom, langue, created_at',
      [nom, langue || 'MG']
    );
    return rows[0];
  },

  update: async (id, { nom, langue }) => {
    const { rows } = await pool.query(
      'UPDATE utilisateurs SET nom = $1, langue = $2 WHERE id = $3 RETURNING id, nom, langue, created_at',
      [nom, langue, id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM utilisateurs WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = UtilisateurModel;
