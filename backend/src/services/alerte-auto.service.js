const pool = require('../config/db');
const MeteoService = require('./meteo.service');

// Service (logique métier) — génération AUTOMATIQUE d'alertes
// Correspond au CalendrierAgricole.alertesJour() du diagramme UML :
//   1) plantation + cycle culture  -> alerte RÉCOLTE proche
//   2) météo favorable au semis   -> alerte SEMIS
//   3) oram-baratra / forte pluie  -> alerte MÉTÉO urgente (rouge = danger)
const AlerteAutoService = {
  // Anti-doublon : une alerte non lue au même intitulé suffit
  existeDeja: async (type, message) => {
    const { rows } = await pool.query(
      'SELECT 1 FROM alertes WHERE type = $1 AND message = $2 AND lue = FALSE LIMIT 1',
      [type, message]
    );
    return rows.length > 0;
  },

  creerSiAbsent: async (type, priorite, message, dejaCreees) => {
    const existe = await AlerteAutoService.existeDeja(type, message);
    if (existe) return false;
    await pool.query(
      'INSERT INTO alertes (type, priorite, message) VALUES ($1, $2, $3)',
      [type, priorite, message]
    );
    dejaCreees.push({ type, priorite, message });
    return true;
  },

  generer: async () => {
    const creees = [];

    // --- 1) Récolte proche : plantation + durée du cycle de la culture ---
    const plantations = await pool.query(
      `SELECT o.date_obs, c.nom_mg, c.duree_cycle_jours, p.nom AS parcelle
       FROM observations o
       JOIN parcelles p ON p.id = o.parcelle_id
       JOIN cultures c ON c.id = p.culture_id
       WHERE o.type = 'PLANTATION'`
    );

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    for (const row of plantations.rows) {
      const recolte = new Date(row.date_obs);
      recolte.setDate(recolte.getDate() + Number(row.duree_cycle_jours));
      const jours = Math.round((recolte - aujourdhui) / 86400000);

      if (jours >= 0 && jours <= 3) {
        const quand = jours === 0 ? 'androany' : `amin'ny ${jours} andro`;
        await AlerteAutoService.creerSiAbsent(
          'RECOLTE',
          jours === 0 ? 'URGENTE' : 'NORMALE',
          `Famokarana ${row.nom_mg} ao amin'ny ${row.parcelle}: ${quand}`,
          creees
        );
      }
    }

    // --- 2) & 3) Alertes issues de la météo réelle (par lieu) ---
    const previsions = await pool.query(
      `SELECT date_prev, lieu, icone, proba_pluie
       FROM previsions_meteo
       WHERE date_prev >= CURRENT_DATE
       ORDER BY lieu, date_prev ASC`
    );

    for (const j of previsions.rows) {
      const date = new Date(j.date_prev).toISOString().slice(0, 10);
      const favorable = MeteoService.estFavorable(j);
      const dangeureux =
        j.icone === 'oram-baratra' || j.icone === 'orage' || Number(j.proba_pluie) >= 85;
      const ici = ` ao amin'ny ${j.lieu}`;

      if (favorable) {
        await AlerteAutoService.creerSiAbsent(
          'SEMIS', 'NORMALE',
          `Orana mety hamono ny hatsy amin'ny ${date}${ici}`,
          creees
        );
      }
      if (dangeureux) {
        await AlerteAutoService.creerSiAbsent(
          'METEO', 'URGENTE',
          `${j.icone === 'oram-baratra' || j.icone === 'orage' ? 'Oram-baratra' : 'Orana mafy'} amin'ny ${date}${ici}: tsy miasa an-tanety`,
          creees
        );
      }
    }

    return {
      creees: creees.length,
      alertes: creees,
      horodatage: new Date().toISOString(),
    };
  },
};

module.exports = AlerteAutoService;
