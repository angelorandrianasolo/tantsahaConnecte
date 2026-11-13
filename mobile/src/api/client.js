/* ============================================================
   Client AJAX unique — Tantsaha Connect (mobile / React Native)
   MÊME logique que la version web (src/api/client.js) :
   - aucun rechargement, tout passe par fetch()
   - token de session + langue envoyés automatiquement
   - stockage via AsyncStorage (l'équivalent du localStorage web)
   - HORS LIGNE : les écritures échouées partent dans une file
     d'attente puis sont rejouées au retour du réseau
   ============================================================ */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from '../i18n/textes.js';

// URL du backend : EXPO_PUBLIC_API_URL=http://192.168.1.50:3000 npx expo start
const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let token = null;
let langue = 'mg';
let abonneLangue = null;      // App s'abonne pour changer d'écran de langue

const entetes = () => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const avecLangue = (chemin) =>
  `${BASE}${chemin}${chemin.includes('?') ? '&' : '?'}lang=${langue}`;

/* ---------- File d'attente hors-ligne ---------- */
const CLE_FILE = 'fileAttente';
const lireFile = async () => {
  try { return JSON.parse(await AsyncStorage.getItem(CLE_FILE)) || []; } catch { return []; }
};
const ecrireFile = async (f) => {
  try { await AsyncStorage.setItem(CLE_FILE, JSON.stringify(f)); } catch { /* ignore */ }
};

async function requete(chemin, { methode = 'GET', corps } = {}) {
  let reponse;
  try {
    reponse = await fetch(avecLangue(chemin), {
      method: methode,
      headers: entetes(),
      body: corps === undefined ? undefined : JSON.stringify(corps),
    });
  } catch {
    if (methode === 'GET') {
      const err = new Error(t('erreur.reseau', langue));
      err.horsLigne = true;
      throw err;
    }
    const file = await lireFile();
    file.push({ chemin, methode, corps, tentatives: 0, le: new Date().toISOString() });
    await ecrireFile(file);
    return { _enFile: true };
  }

  const donnees = await reponse.json().catch(() => null);
  if (!reponse.ok) {
    const err = new Error((donnees && donnees.error) || `HTTP ${reponse.status}`);
    err.statut = reponse.status;
    throw err;
  }
  return donnees;
}

/* Rejoue la file d'attente (revenir au réseau = on renvoie tout) */
export async function rejouerFile() {
  const file = await lireFile();
  if (!file.length) return 0;
  const restants = [];
  for (const item of file) {
    try {
      const r = await fetch(avecLangue(item.chemin), {
        method: item.methode,
        headers: entetes(),
        body: item.corps === undefined ? undefined : JSON.stringify(item.corps),
      });
      if (r.ok) continue;
      if (r.status >= 500) {
        item.tentatives += 1;
        if (item.tentatives < 5) restants.push(item);
      }
    } catch {
      item.tentatives += 1;
      if (item.tentatives < 5) restants.push(item);
    }
  }
  await ecrireFile(restants);
  return file.length - restants.length;
}

export const nombreFile = async () => (await lireFile()).length;

/* ---------- API ---------- */
export const api = {
  get token() { return token; },
  get langue() { return langue; },

  // À appeler une fois au démarrage de l'app
  async charger() {
    try {
      token = (await AsyncStorage.getItem('token')) || null;
      langue = (await AsyncStorage.getItem('langue')) || 'mg';
    } catch { /* stockage indisponible : valeurs par défaut */ }
  },

  async setToken(t2) {
    token = t2;
    try {
      if (t2) await AsyncStorage.setItem('token', t2);
      else await AsyncStorage.removeItem('token');
    } catch { /* ignore */ }
  },

  async setLangue(l) {
    langue = l;
    try { await AsyncStorage.setItem('langue', l); } catch { /* ignore */ }
    if (abonneLangue) abonneLangue(l);      // -> App redessine tout
  },

  abonnerLangue(fn) { abonneLangue = fn; },

  // --- verbes ---
  get: (chemin) => requete(chemin),
  post: (chemin, corps) => requete(chemin, { methode: 'POST', corps }),
  put: (chemin, corps) => requete(chemin, { methode: 'PUT', corps }),
  patch: (chemin) => requete(chemin, { methode: 'PATCH' }),
  delete: (chemin) => requete(chemin, { methode: 'DELETE' }),
};
