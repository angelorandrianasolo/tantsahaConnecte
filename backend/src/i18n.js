/* i18n — messages bilingues
   Source = malagasy (langue du projet) ; traduction automatique vers le français
   quand la requête porte ?lang=fr  (ou un Accept-Language français). */

const FR = {
  // Générique
  'Tsy hita': 'Introuvable',
  "Tsy fahazotoana eo amin'ny solosaina": 'Erreur serveur',

  // Utilisateurs
  'Tsy misy mpampiasa': 'Utilisateur introuvable',
  'Voafafana ny mpampiasa': 'Utilisateur supprimé',
  'Tsy misy mpampiasa tompony': "Propriétaire introuvable",
  'Ilaina ny anarana': 'Le champ "nom" est obligatoire',
  'Diso ny latitude (eo anelanelan-90 sy 90)': 'Latitude invalide (entre -90 et 90)',
  'Diso ny longitude (eo anelanelan-180 sy 180)': 'Longitude invalide (entre -180 et 180)',
  'Lany be loatra ny anaran-toko (100 litera farany)': 'Région trop longue (100 caractères max)',

  // Parcelles
  'Tsy misy tanimbary': 'Parcelle introuvable',
  'Voafafana ny tanimbary': 'Parcelle supprimée',

  // Cultures
  'Tsy misy karazana voambarana': 'Culture introuvable',
  'Voafafana ny karazana voambarana': 'Culture supprimée',
  'Ilaina ny anarana malagasy': 'Le champ "nom_mg" est obligatoire',
  'Diso ny elanelan-andro (isa ambony noho ny 0)': 'Durée de cycle invalide (entier > 0)',
  'Diso ny endrika daty (AAAA-MM-JJ)': 'Format de date invalide (AAAA-MM-JJ)',

  // Observations
  'Tsy misy tatitra': 'Observation introuvable',
  'Voafafana ny tatitra': 'Observation supprimée',
  'Tsy mety ny tatitra': 'Observation invalide',
  'Ilaina ny id-ilay tanimbary': 'Le champ "parcelle_id" est obligatoire',
  'Ilaina ny andro nitranga': 'Le champ "date_obs" est obligatoire',
  'Tsy mety ny andro ho avy': 'Impossible de saisir une observation datée dans le futur',

  // Alertes
  'Tsy misy fampitandremana': 'Alerte introuvable',
  'Voafafana ny fampitandremana': 'Alerte supprimée',
  'Tsy mety ny fampitandremana': 'Alerte invalide',
  'Ilaina ny fehezanteny': 'Le champ "message" est obligatoire',

  // Conseils
  'Tsy misy torolalana': 'Conseil introuvable',
  'Voafafana ny torolalana': 'Conseil supprimé',
  'Ilaina ny lohahevitra': 'Le champ "titre" est obligatoire',
  'Ilaina ny atiny': 'Le champ "contenu" est obligatoire',
  'Lany be loatra: 300 litera farany': 'Contenu trop long : 300 caractères maximum',
  "Tsy misy feo ho an'ity torolalana ity": 'Aucun fichier audio pour ce conseil',

  // Météo
  "Tsy misy fotoana masoandro amin'ity andro ity": 'Prévision introuvable pour cette date',
  'Tsy misy fotoana masoandro': 'Prévision introuvable',
  'Voafafana ny fotoana': 'Prévision supprimée',
  'Ilaina ny daty (AAAA-MM-JJ)': 'Le champ "date_prev" est obligatoire',
  '"proba_pluie" tokony ho eo anelanelan-0 sy 100': '"proba_pluie" doit être entre 0 et 100',
  '"temp_min" sy "temp_max" tokony ho isa': '"temp_min" et "temp_max" doivent être numériques',
  'Tsy mety ny temp_min ambony noho ny temp_max': '"temp_min" ne peut pas dépasser "temp_max"',
  'Tsy afaka mijery ny masoandro ankehitriny': 'Impossible de récupérer la météo actuelle',
  'Tsy mety ny tanterahan-dalana masoandro': 'Le service météo a renvoyé une erreur',
  'Format tsy eo anilan-dalana': 'Format de réponse météo invalide',

  // Synchro
  'Diso ny angona nomena': 'Corps de requête invalide',

  // Audio
  'Ilaina ny hoe horesahina': 'Le champ "texte" est obligatoire',
  'Diso ny fitsipika hafatra': 'Langue non prise en charge (mg ou fr)',
  'Diso ny hafainganam-piresaka': 'Vitesse invalide (entre 0.5 et 1.5)',
};

// Préfixes (messages dynamiques : on ne traduit que le début)
const PREFIXES = [
  ['Diso ny karazana. Adino: ', 'Type invalide. Valeurs admises : '],
  ['Diso ny lahateny. Adino: ', 'Priorité invalide. Valeurs admises : '],
  ['Diso ny lohahevitra. Adino: ', 'Thème invalide. Valeurs admises : '],
  ['Diso endrika. Adino: ', 'Icône invalide. Valeurs admises : '],
  ['Be loatra: ', 'Lot trop grand : '],
  [' zavatra azo amarina', ' éléments maximum'],
];

const estFrancais = (lang) => String(lang || '').toLowerCase().startsWith('fr');

function traduire(message, lang) {
  if (!estFrancais(lang) || !message) return message;
  if (FR[message]) return FR[message];
  for (const [mg, fr] of PREFIXES) {
    if (message.startsWith(mg)) return fr + message.slice(mg.length);
  }
  return message;   // message déjà en français ou inconnu : on ne casse rien
}

module.exports = { traduire, estFrancais, FR };
