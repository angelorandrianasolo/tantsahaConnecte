const ParcelleModel = require('../models/parcelle.model');
const UtilisateurModel = require('../models/utilisateur.model');

// Service (logique métier) — parcelles
const ParcelleService = {
  lister: () => ParcelleModel.findAll(),

  obtenir: async (id) => {
    const p = await ParcelleModel.findById(id);
    if (!p) throw { status: 404, message: 'Tsy misy tanimbary' };
    return p;
  },

  creer: async (data) => {
    if (!data.nom || !data.nom.trim()) {
      throw { status: 400, message: 'Ilaina ny anarana' };
    }
    // contrôle d'intégrité : le propriétaire doit exister
    if (data.utilisateur_id) {
      const u = await UtilisateurModel.findById(data.utilisateur_id);
      if (!u) throw { status: 400, message: 'Tsy misy mpampiasa tompony' };
    }
    return ParcelleModel.create({
      nom: data.nom.trim(),
      region: data.region,
      utilisateur_id: data.utilisateur_id,
    });
  },

  modifier: async (id, data) => {
    if (!data.nom || !data.nom.trim()) {
      throw { status: 400, message: 'Ilaina ny anarana' };
    }
    if (data.utilisateur_id) {
      const u = await UtilisateurModel.findById(data.utilisateur_id);
      if (!u) throw { status: 400, message: 'Tsy misy mpampiasa tompony' };
    }
    const p = await ParcelleModel.update(id, {
      nom: data.nom.trim(),
      region: data.region,
      utilisateur_id: data.utilisateur_id,
    });
    if (!p) throw { status: 404, message: 'Tsy misy tanimbary' };
    return p;
  },

  supprimer: async (id) => {
    const ok = await ParcelleModel.remove(id);
    if (!ok) throw { status: 404, message: 'Tsy misy tanimbary' };
    return { message: 'Voafafana ny tanimbary' };
  },
};

module.exports = ParcelleService;
