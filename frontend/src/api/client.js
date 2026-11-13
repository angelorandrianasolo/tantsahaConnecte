/* ============================================================
   Client AJAX unique — Tantsaha Connect (web)
   RÈGLE DU PROJET : aucun bouton ne recharge jamais la page.
   Tout passe par fetch() via ce client :
     api.get('/meteo/prochains-jours')
     api.post('/session', { utilisateur_id: 1 })
   - envoie automatiquement le token de session (si connecté)
   - envoie automatiquement la langue (mg/fr) -> ?lang=
   - HORS LIGNE : toute écriture (POST/PUT/PATCH/DELETE) qui échoue
     faute de réseau est mise dans une file d'attente (localStorage)
     puis rejouée automatiquement au retour du réseau.
   ============================================================ */
import { t } from '../i18n/textes.js';

let token = localStorage.getItem('token') || null;
let langue = (() => {
  const p = new URLSearchParams(window.location.search).get('lang');
  if (p === 'fr' || p === 'mg') {
    localStorage.setItem('langue', p);
    return p;
  }
  return localStorage.getItem('langue') || 'mg';
})();

const entetes = () => {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const avecLangue = (chemin) =>
  `${chemin}${chemin.includes('?') ? '&' : '?'}lang=${langue}`;

/* ---------- File d'attente hors-ligne ---------- */
const CLE_FILE = 'fileAttente';
const lireFile = () => {
  try { return JSON.parse(localStorage.getItem(CLE_FILE)) || []; } catch { return []; }
};
const ecrireFile = (f) => {
  localStorage.setItem(CLE_FILE, JSON.stringify(f));
  window.dispatchEvent(new Event('file-attente'));
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
    // Pas de réseau :
    if (methode === 'GET') {
      const err = new Error(t('erreur.reseau', langue));
      err.horsLigne = true;
      throw err;
    }
    // Écriture -> file d'attente, elle sera rejouée au retour du réseau
    const file = lireFile();
    file.push({ chemin, methode, corps, tentatives: 0, le: new Date().toISOString() });
    ecrireFile(file);
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

/* Rejoue la file d'attente (appelé automatiquement au retour du réseau) */
export async function rejouerFile() {
  const file = lireFile();
  if (!file.length) return 0;
  const restants = [];
  for (const item of file) {
    try {
      const r = await fetch(avecLangue(item.chemin), {
        method: item.methode,
        headers: entetes(),
        body: item.corps === undefined ? undefined : JSON.stringify(item.corps),
      });
      if (r.ok) continue;                 // envoyé
      if (r.status >= 500) {               // serveur indisponible -> on réessaiera
        item.tentatives += 1;
        if (item.tentatives < 5) restants.push(item);
      }
      // 4xx : la demande est invalide, on la retire pour ne pas boucler
    } catch {
      item.tentatives += 1;
      if (item.tentatives < 5) restants.push(item);
    }
  }
  ecrireFile(restants);
  return file.length - restants.length;
}

export const nombreFile = () => lireFile().length;

/* ---------- API ---------- */
export const api = {
  // --- état ---
  get token() { return token; },
  get langue() { return langue; },
  setToken(t2) {
    token = t2;
    if (t2) localStorage.setItem('token', t2);
    else localStorage.removeItem('token');
  },
  setLangue(l) {
    langue = l;
    localStorage.setItem('langue', l);
  },

  // --- verbes ---
  get: (chemin) => requete(chemin),
  post: (chemin, corps) => requete(chemin, { methode: 'POST', corps }),
  put: (chemin, corps) => requete(chemin, { methode: 'PUT', corps }),
  patch: (chemin) => requete(chemin, { methode: 'PATCH' }),
  delete: (chemin) => requete(chemin, { methode: 'DELETE' }),
};

/* Rejeu automatique dès que le réseau revient */
window.addEventListener('online', () => { rejouerFile(); });
