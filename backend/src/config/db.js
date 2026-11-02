const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'root',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tantsaha_connect',
  // mode trust : aucun mot de passe
});

module.exports = pool;
