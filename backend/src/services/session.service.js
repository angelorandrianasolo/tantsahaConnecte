const crypto = require('crypto');
const SessionModel = require('../models/session.model');
const UtilisateurModel = require('../models/utilisateur.model');

// Service (logique métier) — session = "qui suis-je ?" côté app
const SessionService = {
  // POST /session { utilisateur_id } -> { token, utilisateur }
  ouvrir: async (data) => {
    const id = Number(data && data.utilisateur_id);
    if (!id) throw { status: 400, message: 'Ilaina ny mpampiasa' };
    const u = await UtilisateurModel.findById(id);
    if (!u) throw { status: 404, message: 'Tsy misy mpampiasa' };

    const token = crypto.randomBytes(24).toString('hex');   // 48 caractères
    await SessionModel.create(token, id);
    return { token, utilisateur: u };
  },

  // GET /session (token en ?token= ou Authorization: Bearer)
  identifier: async (token) => {
    if (!token) return null;
    const s = await SessionModel.findByToken(String(token));
    if (!s) return null;
    return {
      token: s.token,
      utilisateur: {
        id: s.id, nom: s.nom, langue: s.langue,
        region: s.region, latitude: s.latitude, longitude: s.longitude,
      },
    };
  },

  // DELETE /session
  fermer: async (token) => {
    const ok = await SessionModel.remove(String(token || ''));
    if (!ok) throw { status: 401, message: 'Tsy misy feo token' };
    return { message: 'Voafarana ny feo token' };
  },
};

module.exports = SessionService;
