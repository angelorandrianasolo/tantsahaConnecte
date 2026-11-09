const pool = require('../config/db');

const COLS = `o.id, o.parcelle_id, o.type, TO_CHAR(o.date_obs, 'YYYY-MM-DD') AS date_obs,
              o.valeur, o.photo, o.created_at`;
const JOINTURE = 'LEFT JOIN parcelles p ON p.id = o.parcelle_id';

// Modèle (accès aux données) — table observations
const ObservationModel = {
  // filtres : parcelle_id, type, du, au (dates AAAA-MM-JJ), limit (max 500), offset
  findAll: async (f = {}) => {
    const cond = [];
    const params = [];
    if (f.parcelle_id) { params.push(Number(f.parcelle_id)); cond.push(`o.parcelle_id = $${params.length}`); }
    if (f.type) { params.push(f.type); cond.push(`o.type = $${params.length}`); }
    if (f.du) { params.push(f.du); cond.push(`o.date_obs >= $${params.length}`); }
    if (f.au) { params.push(f.au); cond.push(`o.date_obs <= $${params.length}`); }

    const limit = Number(f.limit) || 100;
    const offset = Number(f.offset) || 0;
    params.push(limit, offset);

    const { rows } = await pool.query(
      `SELECT ${COLS}, p.nom AS parcelle
       FROM observations o
       ${JOINTURE}
       ${cond.length ? `WHERE ${cond.join(' AND ')}` : ''}
       ORDER BY o.date_obs DESC, o.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT ${COLS}, p.nom AS parcelle
       FROM observations o
       ${JOINTURE}
       WHERE o.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  // Observations d'une parcelle (timeline du journal de culture)
  findByParcelle: async (parcelleId) => {
    const { rows } = await pool.query(
      `SELECT ${COLS}
       FROM observations o
       WHERE parcelle_id = $1
       ORDER BY date_obs DESC, id DESC`,
      [parcelleId]
    );
    return rows;
  },

  create: async ({ parcelle_id, type, date_obs, valeur, photo }) => {
    const { rows } = await pool.query(
      `INSERT INTO observations (parcelle_id, type, date_obs, valeur, photo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, parcelle_id, type, TO_CHAR(date_obs, 'YYYY-MM-DD') AS date_obs,
                 valeur, photo, created_at`,
      [parcelle_id, type, date_obs, valeur || null, photo || null]
    );
    return rows[0];
  },

  update: async (id, { parcelle_id, type, date_obs, valeur, photo }) => {
    const { rows } = await pool.query(
      `UPDATE observations
       SET parcelle_id = $1, type = $2, date_obs = $3, valeur = $4, photo = $5
       WHERE id = $6
       RETURNING id, parcelle_id, type, TO_CHAR(date_obs, 'YYYY-MM-DD') AS date_obs,
                 valeur, photo, created_at`,
      [parcelle_id, type, date_obs, valeur || null, photo || null, id]
    );
    return rows[0] || null;
  },

  remove: async (id) => {
    const { rowCount } = await pool.query('DELETE FROM observations WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = ObservationModel;
