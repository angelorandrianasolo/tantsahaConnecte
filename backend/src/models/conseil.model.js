const pool = require('../config/db');

// Modèle (accès aux données) — table conseils
const ConseilModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT id, theme, titre, titre_fr, contenu, contenu_fr, fichier_audio
       FROM conseils
       ORDER BY id`
    );
    return rows;
  },

  // Conseils d'un thème (filtrage depuis l'app : parasites, irrigation, semis...)
  findByTheme: async (theme) => {
    const { rows } = await pool.query(
      `SELECT id, theme, titre, titre_fr, contenu, contenu_fr, fichier_audio
       FROM conseils
       WHERE theme = $1
       ORDER BY id`,
      [theme]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT id, theme, titre, titre_fr, contenu, contenu_fr, fichier_audio
       FROM conseils
       WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ theme, titre, titre_fr, contenu, contenu_fr, fichier_audio }) => {
    const { rows } = await pool.query(
      `INSERT INTO conseils (theme, titre, titre_fr, contenu, contenu_fr, fichier_audio)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, theme, titre, titre_fr, contenu, contenu_fr, fichier_audio`,
      [theme, titre, titre_fr || null, contenu, contenu_fr || null, fichier_audio || null]
    );
    return rows[0];
  },

  update: async (id, { theme, titre, titre_fr, contenu, contenu_fr, fichier_audio }) => {
    const { rows } = await pool.query(
      `UPDATE conseils
       SET theme = $1, titre = $2, titre_fr = $3, contenu = $4, contenu_fr = $5, fichier_audio = $6
       WHERE id = $7
       RETURNING id, theme, titre, titre_fr, contenu, contenu_fr, fichier_audio`,
      [theme, titre, titre_fr || null, contenu, contenu_fr || null, fichier_audio || null, id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM conseils WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = ConseilModel;
