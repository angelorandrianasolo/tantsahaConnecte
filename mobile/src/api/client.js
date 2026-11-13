/* ============================================================
   Client AJAX unique — Tantsaha Connect (mobile / React Native)
   MÊME logique que la version web (src/api/client.js) :
   - aucun rechargement, tout passe par fetch()
   - token de session + langue envoyés automatiquement
   - stockage via AsyncStorage (l'équivalent du localStorage web)
   ============================================================ */
import AsyncStorage from '@react-native-async-storage/async-storage';

let token = null;
let langue = 'mg';

const entetes = () => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const avecLangue = (chemin) =>
  `${chemin}${chemin.includes('?') ? '&' : '?'}lang=${langue}`;

async function requete(chemin, { methode = 'GET', corps } = {}) {
  const reponse = await fetch(avecLangue(chemin), {
    method: methode,
    headers: entetes(),
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });

  const donnees = await reponse.json().catch(() => null);
  if (!reponse.ok) {
    const err = new Error((donnees && donnees.error) || `HTTP ${reponse.status}`);
    err.statut = reponse.status;
    throw err;
  }
  return donnees;
}

export const api = {
  // --- état ---
  get token() { return token; },
  get langue() { return langue; },

  // À appeler une fois au démarrage de l'app
  async charger() {
    try {
      token = (await AsyncStorage.getItem('token')) || null;
      langue = (await AsyncStorage.getItem('langue')) || 'mg';
    } catch { /* stockage indisponible : on garde les valeurs par défaut */ }
  },

  async setToken(t) {
    token = t;
    try {
      if (t) await AsyncStorage.setItem('token', t);
      else await AsyncStorage.removeItem('token');
    } catch { /* ignore */ }
  },

  async setLangue(l) {
    langue = l;
    try { await AsyncStorage.setItem('langue', l); } catch { /* ignore */ }
  },

  // --- verbes ---
  get: (chemin) => requete(chemin),
  post: (chemin, corps) => requete(chemin, { methode: 'POST', corps }),
  put: (chemin, corps) => requete(chemin, { methode: 'PUT', corps }),
  patch: (chemin) => requete(chemin, { methode: 'PATCH' }),
  delete: (chemin) => requete(chemin, { methode: 'DELETE' }),
};
