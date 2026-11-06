const ObservationModel = require('../models/observation.model');
const ParcelleModel = require('../models/parcelle.model');

// Types admis (choix par icônes dans l'app)
const TYPES_VALIDES = ['PLUIE', 'RAVAGEUR', 'PLANTATION', 'RECOLTE', 'MALADIE'];

// Service (logique métier) — observations
const ObservationService = {
  TYPES: TYPES_VALIDES,

  lister: () => ObservationModel.findAll(),

  listerParcelle: async (parcelleId) => {
    const p = await ParcelleModel.findById(parcelleId);
    if (!p) throw { status: 404, message: 'Parcelle introuvable' };
    return ObservationModel.findByParcelle(parcelleId);
  },

  obtenir: async (id) => {
    const o = await ObservationModel.findById(id);
    if (!o) throw { status: 404, message: 'Observation introuvable' };
    return o;
  },

  creer: async (data) => {
    await ObservationService.valider(data);
    return ObservationModel.create(data);
  },

  modifier: async (id, data) => {
    await ObservationService.valider(data);
    const o = await ObservationModel.update(id, data);
    if (!o) throw { status: 404, message: 'Observation introuvable' };
    return o;
  },

  supprimer: async (id) => {
    const ok = await ObservationModel.remove(id);
    if (!ok) throw { status: 404, message: 'Observation introuvable' };
    return { message: 'Observation supprimée' };
  },

  // Validations métier
  valider: async (data) => {
    if (!data.parcelle_id) {
      throw { status: 400, message: 'Le champ "parcelle_id" est obligatoire' };
    }
    const p = await ParcelleModel.findById(data.parcelle_id);
    if (!p) throw { status: 400, message: 'Parcelle introuvable' };

    if (!data.type || !TYPES_VALIDES.includes(data.type)) {
      throw { status: 400, message: `Type invalide. Valeurs admises : ${TYPES_VALIDES.join(', ')}` };
    }

    if (!data.date_obs) {
      throw { status: 400, message: 'Le champ "date_obs" est obligatoire' };
    }
    // règle métier UML : date de saisie <= aujourd'hui
    const dateSaisie = new Date(data.date_obs);
    if (Number.isNaN(dateSaisie.getTime())) {
      throw { status: 400, message: 'Format de date invalide (AAAA-MM-JJ)' };
    }
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    if (dateSaisie > aujourdhui) {
      throw { status: 400, message: 'Impossible de saisir une observation datée dans le futur' };
    }
  },
};

module.exports = ObservationService;
