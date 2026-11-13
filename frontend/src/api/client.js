/* ============================================================
   Client AJAX unique — Tantsaha Connect (web)
   RÈGLE DU PROJET : aucun bouton ne recharge jamais la page.
   Tout passe par fetch() via ce client :
     api.get('/meteo/prochains-jours')
     api.post('/session', { utilisateur_id: 1 })
   - envoie automatiquement le token de session (si connecté)
   - envoie automatiquement la langue (mg/fr) -> ?lang=
   - traduit les statuts d'erreur en objet Error lisible
   ============================================================ */

let token = localStorage.getItem('token') || null;
let langue = localStorage.getItem('langue') || 'mg';

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
  setToken(t) {
    token = t;
    if (t) localStorage.setItem('token', t);
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
