const UtilisateurModel = require('../models/utilisateur.model');

// Service (logique métier) — utilisateurs
const UtilisateurService = {
  lister: () => UtilisateurModel.findAll(),

  obtenir: async (id) => {
    const u = await UtilisateurModel.findById(id);
    if (!u) throw { status: 404, message: 'Tsy misy mpampiasa' };
    return u;
  },

  creer: async (data) => {
    if (!data.nom || !data.nom.trim()) {
      throw { status: 400, message: 'Ilaina ny anarana' };
    }
    return UtilisateurModel.create({ nom: data.nom.trim(), langue: data.langue });
  },

  modifier: async (id, data) => {
    if (!data.nom || !data.nom.trim()) {
      throw { status: 400, message: 'Ilaina ny anarana' };
    }
    const u = await UtilisateurModel.update(id, {
      nom: data.nom.trim(),
      langue: data.langue || 'MG',
    });
    if (!u) throw { status: 404, message: 'Tsy misy mpampiasa' };
    return u;
  },

  supprimer: async (id) => {
    const ok = await UtilisateurModel.remove(id);
    if (!ok) throw { status: 404, message: 'Tsy misy mpampiasa' };
    return { message: 'Voafafana ny mpampiasa' };
  },
};

module.exports = UtilisateurService;
