const ConseilModel = require('../models/conseil.model');

const THEMES_VALIDES = ['PARASITES', 'IRRIGATION', 'SEMIS', 'RECOLTE', 'MALADIES'];

// Service (logique métier) — conseils agricoles
const ConseilService = {
  THEMES: THEMES_VALIDES,

  lister: () => ConseilModel.findAll(),

  listerTheme: async (theme) => {
    const t = String(theme).toUpperCase();
    if (!THEMES_VALIDES.includes(t)) {
      throw { status: 400, message: `Thème invalide. Valeurs admises : ${THEMES_VALIDES.join(', ')}` };
    }
    return ConseilModel.findByTheme(t);
  },

  obtenir: async (id) => {
    const c = await ConseilModel.findById(id);
    if (!c) throw { status: 404, message: 'Conseil introuvable' };
    return c;
  },

  creer: async (data) => {
    ConseilService.valider(data);
    return ConseilModel.create({
      ...data,
      theme: data.theme.toUpperCase(),
    });
  },

  modifier: async (id, data) => {
    ConseilService.valider(data);
    const c = await ConseilModel.update(id, {
      ...data,
      theme: data.theme.toUpperCase(),
    });
    if (!c) throw { status: 404, message: 'Conseil introuvable' };
    return c;
  },

  supprimer: async (id) => {
    const ok = await ConseilModel.remove(id);
    if (!ok) throw { status: 404, message: 'Conseil introuvable' };
    return { message: 'Conseil supprimé' };
  },

  // Version vocale : renvoie le texte prêt à être lu en malagasy
  versionVocale: async (id) => {
    const c = await ConseilService.obtenir(id);
    return {
      id: c.id,
      fichierAudio: c.fichier_audio,   // si dispo en cache local
      texteAVoix: `${c.titre}. ${c.contenu}`,
    };
  },

  valider: (data) => {
    if (!data.theme || !THEMES_VALIDES.includes(String(data.theme).toUpperCase())) {
      throw { status: 400, message: `Thème invalide. Valeurs admises : ${THEMES_VALIDES.join(', ')}` };
    }
    if (!data.titre || !data.titre.trim()) {
      throw { status: 400, message: 'Le champ "titre" est obligatoire' };
    }
    if (!data.contenu || !data.contenu.trim()) {
      throw { status: 400, message: 'Le champ "contenu" est obligatoire' };
    }
    // règle du cahier des charges : pas de longs textes (concision)
    if (data.contenu.length > 300) {
      throw { status: 400, message: 'Contenu trop long : 300 caractères maximum (version courte)' };
    }
  },
};

module.exports = ConseilService;
