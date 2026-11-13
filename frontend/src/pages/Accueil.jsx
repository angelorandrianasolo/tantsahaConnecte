import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t, remplir } from '../i18n/textes.js';
import { parler } from '../api/voix.js';

/* Étape 1 : l'écran d'accueil — bandeau géré par App, 4 boutons géants,
   + parcelles et tableau de bord, session en un clic. */
export default function Accueil() {
  const lg = api.langue;
  const naviguer = useNavigate();
  const [utilisateur, setUtilisateur] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [nbAlertes, setNbAlertes] = useState(0);
  const [nomNouveau, setNomNouveau] = useState('');
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      if (api.token) {
        const s = await api.get('/session');
        setUtilisateur(s.utilisateur);
      } else {
        setUtilisateur(null);
      }
      const u = await api.get('/utilisateurs');
      setUtilisateurs(u);
      const nonLues = await api.get('/alertes/non-lues');
      setNbAlertes(nonLues.length);
      setEtat('pret');
    } catch (e) {
      setErreur(e.message);
      setEtat('erreur');
    }
  };

  useEffect(() => { charger(); }, []);

  const connecter = async (id) => {
    try {
      const r = await api.post('/session', { utilisateur_id: id });
      api.setToken(r.token);
      charger();
    } catch (e) { setErreur(e.message); }
  };

  const creerEtConnecter = async (e) => {
    e.preventDefault();
    if (!nomNouveau.trim()) return;
    try {
      const u = await api.post('/utilisateurs', { nom: nomNouveau.trim() });
      setNomNouveau('');
      await connecter(u.id);
    } catch (err) { setErreur(err.message); }
  };

  const deconnecter = async () => {
    try { await api.delete('/session'); } catch { /* token déjà invalide */ }
    api.setToken(null);
    charger();
  };

  if (etat === 'chargement') {
    return <Page titre={t('accueil.titre', lg)} retour={false}>
      <p className="chargement">{t('chargement', lg)}</p>
    </Page>;
  }

  /* ---------- Pas de session : choix de l'utilisateur ---------- */
  if (!utilisateur) {
    return (
      <Page titre={t('accueil.titre', lg)} retour={false}>
        {erreur && <p className="erreur">{erreur} <button className="mini-bouton" onClick={charger}>{t('reessayer', lg)}</button></p>}
        <div className="carte">
          <h2>{t('connexion.titre', lg)}</h2>
          {utilisateurs.length === 0 && <p className="liste-vide">{t('connexion.aucun', lg)}</p>}
          <div className="grille-boutons" style={{ padding: 0 }}>
            {utilisateurs.map((u) => (
              <button key={u.id} className="bouton-geant vert" onClick={() => connecter(u.id)}>
                <span className="icone">👤</span>
                <span>{u.nom}</span>
                <span style={{ fontWeight: 400, fontSize: 15 }}>{u.region}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="carte">
          <h3>{t('connexion.nouveau', lg)}</h3>
          <form className="ligne-form" onSubmit={creerEtConnecter}>
            <div>
              <label htmlFor="nom-nouveau">{t('connexion.anarana', lg)}</label>
              <input id="nom-nouveau" value={nomNouveau} onChange={(e) => setNomNouveau(e.target.value)} />
            </div>
            <button className="action" type="submit">{t('connexion.creer', lg)}</button>
          </form>
        </div>
      </Page>
    );
  }

  /* ---------- Connecté : les boutons géants ---------- */
  const salama = remplir(t('accueil.salama', lg), { nom: utilisateur.nom });
  return (
    <Page titre={t('accueil.titre', lg)} retour={false}>
      {erreur && <p className="erreur">{erreur}</p>}

      <div className="carte vert">
        <div className="jour-tete">
          <div>
            <strong style={{ fontSize: 22 }}>{salama}</strong>
            <div className="meta-ligne">
              <span className="puce">📍 {utilisateur.region}</span>
              <span className="puce">👤 {utilisateur.nom}</span>
            </div>
          </div>
          <button className="voix" aria-label={t('voix.btn', lg)} onClick={() => parler(salama)}>🔊</button>
        </div>
      </div>

      <div className="grille-boutons">
        <button className="bouton-geant vert" onClick={() => naviguer('/meteo')}>
          <span className="icone">🌦️</span>
          <span>{t('accueil.meteo', lg)}</span>
        </button>

        <button
          className={`bouton-geant ${nbAlertes > 0 ? 'rouge' : ''}`}
          onClick={() => naviguer('/alertes')}
        >
          <span className="icone">🔔</span>
          <span>
            {t('accueil.alertes', lg)}
            {nbAlertes > 0 && <span className="badge" style={{ marginLeft: 8 }}>{nbAlertes}</span>}
          </span>
        </button>

        <button className="bouton-geant" onClick={() => naviguer('/journal')}>
          <span className="icone">📓</span>
          <span>{t('accueil.journal', lg)}</span>
        </button>

        <button className="bouton-geant jaune" onClick={() => naviguer('/conseils')}>
          <span className="icone">💡</span>
          <span>{t('accueil.conseils', lg)}</span>
        </button>

        <button className="bouton-geant" onClick={() => naviguer('/parcelles')}>
          <span className="icone">🌾</span>
          <span>{t('accueil.parcelles', lg)}</span>
        </button>

        <button className="bouton-geant" onClick={() => naviguer('/tableau-de-bord')}>
          <span className="icone">📊</span>
          <span>{t('accueil.tableau', lg)}</span>
        </button>
      </div>

      <div style={{ padding: '0 14px 24px' }}>
        <button className="action rouge" style={{ width: '100%' }} onClick={deconnecter}>
          🚪 {t('session.fermer', lg)}
        </button>
      </div>
    </Page>
  );
}
