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

  // Préférences de lieu (région du paysan -> météo ciblée)
  preferences: async (id, data) => {
    const u = await UtilisateurModel.findById(id);
    if (!u) throw { status: 404, message: 'Tsy misy mpampiasa' };

    if (data.latitude != null) {
      const lat = Number(data.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        throw { status: 400, message: 'Diso ny latitude (eo anelanelan-90 sy 90)' };
      }
    }
    if (data.longitude != null) {
      const lon = Number(data.longitude);
      if (Number.isNaN(lon) || lon < -180 || lon > 180) {
        throw { status: 400, message: 'Diso ny longitude (eo anelanelan-180 sy 180)' };
      }
    }
    if (data.region != null && String(data.region).length > 100) {
      throw { status: 400, message: 'Lany be loatra ny anaran-toko (100 litera farany)' };
    }

    return UtilisateurModel.updatePreferences(id, {
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
    });
  },
};

module.exports = UtilisateurService;
