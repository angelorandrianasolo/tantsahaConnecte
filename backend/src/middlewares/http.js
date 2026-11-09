const { traduire } = require('../i18n');

/* Gestionnaire HTTP unique :
   - wrap() protège chaque contrôleur et renvoie l'erreur traduite
   - la langue suit ?lang= (mg par défaut) ou l'en-tête Accept-Language */
const langueRequete = (req) =>
  (req.query && req.query.lang) ||
  (req.get && req.get('Accept-Language')) ||
  'mg';

const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    const lang = langueRequete(req);
    res.status(err.status || 500).json({
      error: traduire(err.message || "Tsy fahazotoana eo amin'ny solosaina", lang),
    });
  });

module.exports = { wrap, langueRequete };
