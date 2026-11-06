const AlerteModel = require('../models/alerte.model');

// Types et priorités admis (rouge = danger pour URGENTE, conforme au cahier des charges)
const TYPES_VALIDES = ['SEMIS', 'RECOLTE', 'METEO', 'RAVAGEUR'];
const PRIORITES_VALIDES = ['NORMALE', 'URGENTE'];

// Service (logique métier) — alertes
const AlerteService = {
  TYPES: TYPES_VALIDES,
  PRIORITES: PRIORITES_VALIDES,

  lister: () => AlerteModel.findAll(),

  listerNonLues: () => AlerteModel.findNonLues(),

  obtenir: async (id) => {
    const a = await AlerteModel.findById(id);
    if (!a) throw { status: 404, message: 'Alerte introuvable' };
    return a;
  },

  creer: async (data) => {
    AlerteService.valider(data);
    return AlerteModel.create(data);
  },

  modifier: async (id, data) => {
    AlerteService.valider(data);
    const a = await AlerteModel.update(id, data);
    if (!a) throw { status: 404, message: 'Alerte introuvable' };
    return a;
  },

  // Retour d'action dans l'app : "j'ai traité" / "non lue"
  marquerLue: async (id) => {
    const a = await AlerteModel.marquerLue(id);
    if (!a) throw { status: 404, message: 'Alerte introuvable' };
    return a;
  },

  supprimer: async (id) => {
    const ok = await AlerteModel.remove(id);
    if (!ok) throw { status: 404, message: 'Alerte introuvable' };
    return { message: 'Alerte supprimée' };
  },

  valider: (data) => {
    if (!data.type || !TYPES_VALIDES.includes(data.type)) {
      throw { status: 400, message: `Type invalide. Valeurs admises : ${TYPES_VALIDES.join(', ')}` };
    }
    if (data.priorite && !PRIORITES_VALIDES.includes(data.priorite)) {
      throw { status: 400, message: `Priorité invalide. Valeurs admises : ${PRIORITES_VALIDES.join(', ')}` };
    }
    if (!data.message || !data.message.trim()) {
      throw { status: 400, message: 'Le champ "message" est obligatoire' };
    }
  },
};

module.exports = AlerteService;
