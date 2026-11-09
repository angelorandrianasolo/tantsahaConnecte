/* Limitateur de débit simple (en mémoire) : 200 requêtes / minute / IP.
   Protège les endpoints ouverts pendant une démonstration. */
const fenetreMs = 60 * 1000;
const MAX = Number(process.env.LIMIT_REQUETES) || 200;

const compteurs = new Map();   // ip -> { debut, n }

setInterval(() => {
  const maintenant = Date.now();
  for (const [ip, c] of compteurs) {
    if (maintenant - c.debut > fenetreMs) compteurs.delete(ip);
  }
}, fenetreMs).unref();

const limitateur = (req, res, next) => {
  if (process.env.SANS_LIMIT === '1') return next();

  const ip = req.ip || req.connection.remoteAddress || 'inconnu';
  const maintenant = Date.now();
  let c = compteurs.get(ip);
  if (!c || maintenant - c.debut > fenetreMs) {
    c = { debut: maintenant, n: 0 };
    compteurs.set(ip, c);
  }
  c.n++;

  if (c.n > MAX) {
    const { traduire } = require('../i18n');
    return res.status(429).json({
      error: traduire('Be loatra ny fangatahana', req.query.lang || req.get('Accept-Language')),
    });
  }
  next();
};

module.exports = { limitateur };
