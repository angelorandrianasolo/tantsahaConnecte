import { useState, useEffect } from 'react';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t, remplir } from '../i18n/textes.js';
import { parler } from '../api/voix.js';

/* Étape 3 : météo RÉELLE (déjà récupérée par le serveur), multilieux,
   couleurs 🟢 favorable / 🔴 danger / 🟡 prudence. */
const ICONES = {
  masoandro: '☀️', mandravona: '⛅', orana: '🌧️',
  'oram-baratra': '⛈️', varatra: '🌩️', rivotra: '🌪️',
};
const DANGEREUSES = ['oram-baratra', 'orage', 'varatra', 'rivotra', 'vent'];

// Règle métier du serveur : orana ≥ 70 % ET pas d'icône dangereuse
const favorable = (j) =>
  Number(j.proba_pluie) >= 70 && !DANGEREUSES.includes(j.icone);

const VILLES = [
  { nom: 'Antsirabe', latitude: -19.8583, longitude: 47.5567 },
  { nom: 'Antananarivo', latitude: -18.8792, longitude: 47.5079 },
  { nom: 'Toamasina', latitude: -18.15, longitude: 49.4 },
  { nom: 'Fianarantsoa', latitude: -21.45, longitude: 47.09 },
  { nom: 'Mahajanga', latitude: -15.72, longitude: 46.32 },
  { nom: 'Toliara', latitude: -23.35, longitude: 43.67 },
  { nom: 'Antsiranana', latitude: -12.27, longitude: 49.29 },
];

export default function Meteo() {
  const lg = api.langue;
  const [jours, setJours] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);
  const [nouveauLieu, setNouveauLieu] = useState('');

  const charger = async () => {
    setChargement(true);
    setErreur('');
    try {
      const d = await api.get('/meteo/prochains-jours?nb=7');
      setJours(d);
    } catch (e) { setErreur(e.message); }
    setChargement(false);
  };

  useEffect(() => { charger(); }, []);

  const ajouterLieu = async (e) => {
    e.preventDefault();
    const v = VILLES.find((x) => x.nom === nouveauLieu);
    if (!v) return;
    try {
      await api.post('/meteo/actualisation', v);
      setNouveauLieu('');
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const actualiser = async () => {
    setErreur('');
    try {
      // on rafraîchit tous les lieux déjà connus
      const lieux = [...new Set(jours.map((j) => j.lieu))];
      const tout = await api.get('/meteo');
      const parLieu = {};
      tout.forEach((m) => { if (!parLieu[m.lieu]) parLieu[m.lieu] = m; });
      const aRafraichir = lieux.length ? lieux : Object.keys(parLieu);
      await Promise.all(aRafraichir.map((lieu) => {
        const m = parLieu[lieu];
        return api.post('/meteo/actualisation', m
          ? { latitude: m.latitude, longitude: m.longitude, lieu }
          : { lieu });
      }));
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const resume = async (j) => {
    try {
      const d = await api.get(`/meteo/${j.date_prev}/resume-vocal?lieu=${encodeURIComponent(j.lieu)}`);
      parler(typeof d === 'string' ? d : d.texte || d.message || '');
    } catch { /* rien */ }
  };

  if (chargement) return <Page titre={t('meteo.titre', lg)}><p className="chargement">{t('chargement', lg)}</p></Page>;

  // groupement par lieu
  const parLieu = {};
  jours.forEach((j) => { (parLieu[j.lieu] = parLieu[j.lieu] || []).push(j); });
  const lieux = Object.keys(parLieu);

  return (
    <Page titre={t('meteo.titre', lg)}>
      {erreur && <p className="erreur">{erreur} <button className="mini-bouton" onClick={charger}>{t('reessayer', lg)}</button></p>}

      <div className="ligne-form" style={{ padding: '0 14px' }}>
        <button className="action" onClick={actualiser}>🔄 {t('meteo.actualiser', lg)}</button>
        <form className="ligne-form" onSubmit={ajouterLieu} style={{ flex: 1 }}>
          <div>
            <label htmlFor="lieu" className="sr-only">{t('meteo.lieu', lg)}</label>
            <select id="lieu" value={nouveauLieu} onChange={(e) => setNouveauLieu(e.target.value)}>
              <option value="">{t('meteo.nouvLieu', lg)}</option>
              {VILLES.map((v) => <option key={v.nom} value={v.nom}>{v.nom}</option>)}
            </select>
          </div>
          <button className="action jaune" type="submit" disabled={!nouveauLieu}>
            ➕ {t('meteo.ajouter', lg)}
          </button>
        </form>
      </div>

      {lieux.length === 0 && <p className="liste-vide">{t('meteo.aucune', lg)}</p>}

      {lieux.map((lieu) => (
        <section key={lieu}>
          <h2 style={{ padding: '10px 16px 0' }}>📍 {lieu}</h2>
          {parLieu[lieu].map((j) => {
            const bon = favorable(j);
            const mechant = DANGEREUSES.includes(j.icone);
            const classe = mechant ? 'rouge' : bon ? 'vert' : 'jaune';
            return (
              <article key={j.id} className={`carte ${classe}`}>
                <div className="jour-tete">
                  <div>
                    <strong>{j.date_prev}</strong>
                    <div className="meta-ligne">
                      <span className="puce">💧 {t('meteo.proba', lg)} {j.proba_pluie}%</span>
                      <span className="puce">🌡️ {j.temp_min}° / {j.temp_max}°</span>
                    </div>
                  </div>
                  <span className="jour-icone" title={j.icone}>{ICONES[j.icone] || '🌈'}</span>
                </div>

                <div className="barre-pluie"><i style={{ width: `${j.proba_pluie}%` }} /></div>

                <div className="actions-carte">
                  <span className={`mini-bouton ${bon ? 'vert' : mechant ? 'rouge' : 'jaune'}`}>
                    {bon ? '✅ ' : mechant ? '⛔ ' : '⚠️ '}
                    {bon ? t('meteo.favorable', lg) : t('meteo.pasFavorable', lg)}
                  </span>
                  <button className="mini-bouton" onClick={() => resume(j)} aria-label={t('meteo.resume', lg)}>
                    🔊 {t('meteo.resume', lg)}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ))}

      <p className="meta-ligne" style={{ padding: '6px 16px 20px' }}>
        <span className="puce">🟢 {t('meteo.favorable', lg)}</span>
        <span className="puce">🔴 {t('meteo.pasFavorable', lg)}</span>
        <span className="puce">🟡 {t('meteo.proba', lg)} &lt; 70%</span>
      </p>
    </Page>
  );
}
