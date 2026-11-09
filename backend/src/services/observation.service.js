const ObservationModel = require('../models/observation.model');
const ParcelleModel = require('../models/parcelle.model');

// Types admis (choix par icônes dans l'app)
const TYPES_VALIDES = ['PLUIE', 'RAVAGEUR', 'PLANTATION', 'RECOLTE', 'MALADIE'];

// Service (logique métier) — observations
const ObservationService = {
  TYPES: TYPES_VALIDES,

  lister: (filtres = {}) => ObservationModel.findAll({
    parcelle_id: filtres.parcelle_id || null,
    type: filtres.type || null,
    du: filtres.du || null,
    au: filtres.au || null,
    limit: Math.min(Math.max(Number(filtres.limit) || 100, 1), 500),
    offset: Math.max(Number(filtres.offset) || 0, 0),
  }),

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
    const saisie = String(data.date_obs).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(saisie) || Number.isNaN(new Date(saisie).getTime())) {
      throw { status: 400, message: 'Diso ny endrika daty (AAAA-MM-JJ)' };
    }
    // comparaison des chaînes AAAA-MM-JJ en heure LOCALE (le parse JS part en UTC)
    const d = new Date();
    const aujourdhui = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (saisie > aujourdhui) {
      throw { status: 400, message: 'Tsy mety ny andro ho avy' };
    }

    // Photo facultative : image base64 (data:image/...) de 500 Ko maximum
    if (data.photo != null && data.photo !== '') {
      if (typeof data.photo !== 'string' || !data.photo.startsWith('data:image/')) {
        throw { status: 400, message: "Diso ny endrik'ny sary: data:image no ilaina" };
      }
      if (data.photo.length > 700000) {   // ~500 Ko en base64
        throw { status: 400, message: 'Lany be loatra ny sary: 500 ko farany' };
      }
    }
  },
};

module.exports = ObservationService;
