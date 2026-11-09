const AlerteModel = require('../models/alerte.model');
const MeteoModel = require('../models/meteo.model');
const ConseilModel = require('../models/conseil.model');
const ObservationService = require('./observation.service');
const AlerteService = require('./alerte.service');

const TAILLE_MAX_LOT = 50; // lot maximal envoyé par le téléphone

// Service (logique métier) — synchro hors ligne
// Téléphone → serveur : POST /sync/envoi   (file d'attente locale)
// Téléphone ← serveur : GET  /sync/telechargement (rafraîchir le cache)
const SyncService = {
  // --- Envoi (le terminal vide sa file d'attente) ---
  envoyer: async (lot) => {
    if (!lot || typeof lot !== 'object') {
      throw { status: 400, message: 'Diso ny angona nomena' };
    }

    const observations = Array.isArray(lot.observations) ? lot.observations : [];
    const alertesLues = Array.isArray(lot.alertesLues) ? lot.alertesLues : [];

    if (observations.length > TAILLE_MAX_LOT || alertesLues.length > TAILLE_MAX_LOT) {
      throw { status: 400, message: `Be loatra: ${TAILLE_MAX_LOT} zavatra azo amarina` };
    }

    const importees = [];
    const correspondances = [];   // { idTemporaire -> id définitif } pour le téléphone
    const erreurs = [];

    // 1) Observations : chacune validée individuellement,
    //    un échec n'annule pas les autres (jamais de perte de saisie)
    for (let i = 0; i < observations.length; i++) {
      const o = observations[i];
      // id négatif = id temporaire du cache local
      const temp = o.idTemporaire != null ? o.idTemporaire
        : (Number(o.id) < 0 ? Number(o.id) : null);
      try {
        const cree = await ObservationService.creer(o);
        importees.push(cree);
        if (temp != null) correspondances.push({ idTemporaire: temp, id: cree.id });
      } catch (e) {
        erreurs.push({ index: i, message: e.message || 'Tsy mety ny tatitra' });
      }
    }

    // 2) Alertes marquées comme traitées (état AL1 → AL2 du diagramme d'états)
    let alertesMarquees = 0;
    for (const id of alertesLues) {
      try {
        await AlerteService.marquerLue(Number(id));
        alertesMarquees++;
      } catch (e) {
        erreurs.push({ alerteId: id, message: e.message || 'Tsy mety ny fampitandremana' });
      }
    }

    return {
      importees: importees.length,
      correspondances,               // le terminal remplace ses ids locaux
      alertesMarquees,
      erreurs,
      synchroAt: new Date().toISOString(),
    };
  },

  // --- Téléchargement (rafraîchir le cache pour le mode hors ligne) ---
  // bundle COMPLET : identité, parcelles, cultures, journal, alertes, météo, conseils
  telecharger: async (utilisateur) => {
    const lieu = utilisateur && utilisateur.region
      ? utilisateur.region
      : require('./meteo.service').LIEU_DEFAUT;

    const [parcelles, cultures, observations, alertes, previsions, conseils] =
      await Promise.all([
        require('../models/parcelle.model').findAll(),
        require('../models/culture.model').findAll(),
        require('../models/observation.model').findAll({ limit: 500 }),
        AlerteModel.findNonLues(utilisateur ? utilisateur.id : null),
        MeteoModel.findProchainsJours(3, lieu),
        ConseilModel.findAll(),   // fiches + paramètres audio à mettre en cache
      ]);

    return {
      utilisateur: utilisateur || null,
      lieu,
      parcelles,
      cultures,
      observations,
      alertes,
      previsions,
      conseils,
      synchroAt: new Date().toISOString(),
    };
  },
};

module.exports = SyncService;
