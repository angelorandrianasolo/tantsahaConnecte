const pool = require('../config/db');

// Modèle (accès aux données) — table conseils
const ConseilModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT id, theme, titre, contenu, fichier_audio
       FROM conseils
       ORDER BY id`
    );
    return rows;
  },

  // Conseils d'un thème (filtrage depuis l'app : parasites, irrigation, semis...)
  findByTheme: async (theme) => {
    const { rows } = await pool.query(
      `SELECT id, theme, titre, contenu, fichier_audio
       FROM conseils
       WHERE theme = $1
       ORDER BY id`,
      [theme]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT id, theme, titre, contenu, fichier_audio
       FROM conseils
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ theme, titre, contenu, fichier_audio }) => {
    const { rows } = await pool.query(
      `INSERT INTO conseils (theme, titre, contenu, fichier_audio)
       VALUES ($1, $2, $3, $4)
       RETURNING id, theme, titre, contenu, fichier_audio`,
      [theme, titre, contenu, fichier_audio || null]
    );
    return rows[0];
  },

  update: async (id, { theme, titre, contenu, fichier_audio }) => {
    const { rows } = await pool.query(
      `UPDATE conseils
       SET theme = $1, titre = $2, contenu = $3, fichier_audio = $4
       WHERE id = $5
       RETURNING id, theme, titre, contenu, fichier_audio`,
      [theme, titre, contenu, fichier_audio || null, id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM conseils WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = ConseilModel;
