const pool = require('../config/db');

const COLS = 'id, type, priorite, message, lue, created_at';
const ORDRE = `ORDER BY lue ASC,
                 CASE priorite WHEN 'URGENTE' THEN 0 ELSE 1 END,
                 created_at DESC`;

// Construit le WHERE à partir des filtres de la requête
const whereFiltres = (f) => {
  const cond = [];
  const params = [];
  if (f.type) { params.push(f.type); cond.push(`type = $${params.length}`); }
  if (f.priorite) { params.push(f.priorite); cond.push(`priorite = $${params.length}`); }
  if (f.lue === 'true' || f.lue === true) cond.push('lue = TRUE');
  if (f.lue === 'false' || f.lue === false) cond.push('lue = FALSE');
  return { sql: cond.length ? `WHERE ${cond.join(' AND ')}` : '', params };
};

// Modèle (accès aux données) — table alertes
const AlerteModel = {
  // filtres : type, priorite, lue, limit (max 500), offset
  findAll: async (f = {}) => {
    const { sql, params } = whereFiltres(f);
    const limit = Number(f.limit) || 100;
    const offset = Number(f.offset) || 0;
    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT ${COLS} FROM alertes
       ${sql}
       ORDER BY CASE priorite WHEN 'URGENTE' THEN 0 ELSE 1 END, created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT ${COLS} FROM alertes WHERE id = $1`, [id]
    );
    return rows[0] || null;
  },

  // Non lues : sans utilisateur = "pas traitée" ; avec = "pas vue par MOI"
  findNonLues: async (utilisateurId) => {
    if (utilisateurId) {
      const { rows } = await pool.query(
        `SELECT ${COLS}
         FROM alertes
         WHERE lue = FALSE
           AND NOT EXISTS (
             SELECT 1 FROM alertes_lues al
             WHERE al.alerte_id = alertes.id AND al.utilisateur_id = $1)
         ORDER BY CASE priorite WHEN 'URGENTE' THEN 0 ELSE 1 END, created_at DESC
         LIMIT 200`,
        [utilisateurId]
      );
      return rows;
    }
    const { rows } = await pool.query(
      `SELECT ${COLS} FROM alertes WHERE lue = FALSE
       ORDER BY CASE priorite WHEN 'URGENTE' THEN 0 ELSE 1 END, created_at DESC`
    );
    return rows;
  },

  create: async ({ type, priorite, message }) => {
    const { rows } = await pool.query(
      `INSERT INTO alertes (type, priorite, message)
       VALUES ($1, $2, $3)
       RETURNING ${COLS}`,
      [type, priorite || 'NORMALE', message]
    );
    return rows[0];
  },

  update: async (id, { type, priorite, message }) => {
    const { rows } = await pool.query(
      `UPDATE alertes SET type = $1, priorite = $2, message = $3
       WHERE id = $4
       RETURNING ${COLS}`,
      [type, priorite, message, id]
    );
    return rows[0] || null;
  },

  // "Traité" (sans utilisateur) : état global AL2
  marquerLue: async (id) => {
    const { rows } = await pool.query(
      `UPDATE alertes SET lue = TRUE WHERE id = $1 RETURNING ${COLS}`, [id]
    );
    return rows[0] || null;
  },

  // "Vue par moi" : ne bloque pas les autres utilisateurs
  marquerVue: async (id, utilisateurId) => {
    await pool.query(
      `INSERT INTO alertes_lues (alerte_id, utilisateur_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, utilisateurId]
    );
    const { rows } = await pool.query(`SELECT ${COLS} FROM alertes WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM alertes WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = AlerteModel;
