const SessionService = require('../services/session.service');

// Lecture du token : Authorization: Bearer xxx  ou  ?token=xxx
const tokenRequete = (req) => {
  const h = req.get && req.get('Authorization');
  if (h && h.startsWith('Bearer ')) return h.slice(7).trim();
  return (req.query && req.query.token) || (req.body && req.body.token) || null;
};

// optionnel : attache req.utilisateur si le token est valide (aucune erreur sinon)
const optionnel = async (req, res, next) => {
  try {
    const s = await SessionService.identifier(tokenRequete(req));
    req.utilisateur = s ? s.utilisateur : null;
    req.token = s ? s.token : null;
  } catch {
    req.utilisateur = null;
    req.token = null;
  }
  next();
};

// requis : 401 s'il n'y a pas de session valide
const requis = async (req, res, next) => {
  await optionnel(req, res, () => {
    if (!req.utilisateur) {
      return res.status(401).json({ error: 'Tsy misy feo token' });
    }
    next();
  });
};

module.exports = { optionnel, requis, tokenRequete };
