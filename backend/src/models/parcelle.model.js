const pool = require('../config/db');

// Modèle (accès aux données) — table parcelles
const ParcelleModel = {
  findAll: async () => {
    const { rows } = await pool.query(
      `SELECT p.id, p.nom, p.region, p.utilisateur_id, p.culture_id,
              u.nom AS proprietaire, c.nom_mg AS culture, c.pictogramme AS culture_picto
       FROM parcelles p
       LEFT JOIN utilisateurs u ON u.id = p.utilisateur_id
       LEFT JOIN cultures c ON c.id = p.culture_id
       ORDER BY p.id`
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT p.id, p.nom, p.region, p.utilisateur_id, p.culture_id,
              u.nom AS proprietaire, c.nom_mg AS culture, c.pictogramme AS culture_picto
       FROM parcelles p
       LEFT JOIN utilisateurs u ON u.id = p.utilisateur_id
       LEFT JOIN cultures c ON c.id = p.culture_id
       WHERE p.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  create: async ({ nom, region, utilisateur_id, culture_id }) => {
    const { rows } = await pool.query(
      `INSERT INTO parcelles (nom, region, utilisateur_id, culture_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nom, region, utilisateur_id, culture_id`,
      [nom, region || null, utilisateur_id || null, culture_id || null]
    );
    return rows[0];
  },

  update: async (id, { nom, region, utilisateur_id, culture_id }) => {
    const { rows } = await pool.query(
      `UPDATE parcelles SET nom = $1, region = $2, utilisateur_id = $3, culture_id = $4
       WHERE id = $5
       RETURNING id, nom, region, utilisateur_id, culture_id`,
      [nom, region || null, utilisateur_id || null, culture_id || null, id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM parcelles WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = ParcelleModel;
