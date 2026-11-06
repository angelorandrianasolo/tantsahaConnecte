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
    if (!p) throw { status: 404, message: 'Tsy misy tanimbary' };
    return ObservationModel.findByParcelle(parcelleId);
  },

  obtenir: async (id) => {
    const o = await ObservationModel.findById(id);
    if (!o) throw { status: 404, message: 'Tsy misy tatitra' };
    return o;
  },

  creer: async (data) => {
    await ObservationService.valider(data);
    return ObservationModel.create(data);
  },

  modifier: async (id, data) => {
    await ObservationService.valider(data);
    const o = await ObservationModel.update(id, data);
    if (!o) throw { status: 404, message: 'Tsy misy tatitra' };
    return o;
  },

  supprimer: async (id) => {
    const ok = await ObservationModel.remove(id);
    if (!ok) throw { status: 404, message: 'Tsy misy tatitra' };
    return { message: 'Voafafana ny tatitra' };
  },

  // Validations métier
  valider: async (data) => {
    if (!data.parcelle_id) {
      throw { status: 400, message: 'Ilaina ny id-ilay tanimbary' };
    }
    const p = await ParcelleModel.findById(data.parcelle_id);
    if (!p) throw { status: 400, message: 'Tsy misy tanimbary' };

    if (!data.type || !TYPES_VALIDES.includes(data.type)) {
      throw { status: 400, message: `Diso ny karazana. Adino: ${TYPES_VALIDES.join(', ')}` };
    }

    if (!data.date_obs) {
      throw { status: 400, message: 'Ilaina ny andro nitranga' };
    }
    // règle métier UML : date de saisie <= aujourd'hui
    const dateSaisie = new Date(data.date_obs);
    if (Number.isNaN(dateSaisie.getTime())) {
      throw { status: 400, message: 'Diso ny endrika daty (AAAA-MM-JJ)' };
    }
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    if (dateSaisie > aujourdhui) {
      throw { status: 400, message: 'Tsy mety ny andro ho avy' };
    }
  },
};

module.exports = ObservationService;
