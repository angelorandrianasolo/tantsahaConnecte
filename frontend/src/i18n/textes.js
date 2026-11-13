/* Textes de l'INTERFACE (pas les données) — malagasy par défaut, français en option.
   Accès : t('accueil.titre')  ->  "Fandraisana" ; avec langue='fr' -> "Accueil" */

export const textes = {
  mg: {
    'app.nom': 'Tantsaha Connect',
    'accueil.titre': 'Fandraisana',
    'accueil.meteo': 'Voipetra masoandro',
    'accueil.alertes': 'Fampitandremana',
    'accueil.journal': 'Tatitra',
    'accueil.conseils': 'Torolalana',
    'accueil.parcelles': 'Tanimbary',
    'accueil.tableau': 'Topimbaratra',
    'etat.enLigne': 'Mifandray',
    'etat.horsLigne': 'Tsy mifandray',
    'etat.aEnvoyer': 'tokony halefa',
    'retour': 'Hiverina',
    'connexion.titre': 'Ianao no mampiasa?',
    'connexion.kirakira': 'Misokatra',
    'chargement': 'Mametraka...',
    'erreur': 'Tsy fahazotoana',
  },
  fr: {
    'app.nom': 'Tantsaha Connect',
    'accueil.titre': 'Accueil',
    'accueil.meteo': 'Météo',
    'accueil.alertes': 'Alertes',
    'accueil.journal': 'Journal',
    'accueil.conseils': 'Conseils',
    'accueil.parcelles': 'Parcelles',
    'accueil.tableau': 'Tableau de bord',
    'etat.enLigne': 'En ligne',
    'etat.horsLigne': 'Hors ligne',
    'etat.aEnvoyer': 'à envoyer',
    'retour': 'Retour',
    'connexion.titre': 'Qui utilise l’app ?',
    'connexion.kirakira': 'Se connecter',
    'chargement': 'Chargement...',
    'erreur': 'Erreur',
  },
};

export const t = (cle, langue = 'mg') =>
  (textes[langue] && textes[langue][cle]) || textes.mg[cle] || cle;
