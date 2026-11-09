const CultureModel = require('../models/culture.model');

// Service (logique métier) — cultures
// Règle UML : dateRecolteEstimee = dateSemis + dureeCycleJours
const CultureService = {
  lister: () => CultureModel.findAll(),

  obtenir: async (id) => {
    const c = await CultureModel.findById(id);
    if (!c) throw { status: 404, message: 'Tsy misy karazana voambarana' };
    return c;
  },

  creer: async (data) => {
    CultureService.valider(data);
    return CultureModel.create(data);
  },

  modifier: async (id, data) => {
    CultureService.valider(data);
    const c = await CultureModel.update(id, data);
    if (!c) throw { status: 404, message: 'Tsy misy karazana voambarana' };
    return c;
  },

  supprimer: async (id) => {
    const ok = await CultureModel.remove(id);
    if (!ok) throw { status: 404, message: 'Tsy misy karazana voambarana' };
    return { message: 'Voafafana ny karazana voambarana' };
  },

  // Date de récolte estimée à partir d'une date de plantation
  dateRecolteEstimee: async (id, datePlantation) => {
    const c = await CultureService.obtenir(id);
    const d = new Date(datePlantation);
    if (Number.isNaN(d.getTime())) {
      throw { status: 400, message: 'Diso ny endrika daty (AAAA-MM-JJ)' };
    }
    d.setDate(d.getDate() + Number(c.duree_cycle_jours));
    return {
      culture: c.nom_mg,
      datePlantation: String(datePlantation).slice(0, 10),
      dateRecolte: d.toISOString().slice(0, 10),
      dureeCycleJours: c.duree_cycle_jours,
    };
  },

  valider: (data) => {
    if (!data.nom_mg || !data.nom_mg.trim()) {
      throw { status: 400, message: 'Ilaina ny anarana malagasy' };
    }
    const duree = Number(data.duree_cycle_jours);
    if (!Number.isInteger(duree) || duree <= 0) {
      throw { status: 400, message: 'Diso ny elanelan-andro (isa ambony noho ny 0)' };
    }
  },
};

module.exports = CultureService;
