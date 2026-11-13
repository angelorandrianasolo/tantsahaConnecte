import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t, remplir } from '../i18n/textes.js';
import { parler } from '../api/voix.js';

/* Étape 8 : tableau de bord — l'état du jour en UN appel (/dashboard). */
const ICONES = {
  masoandro: '☀️', mandravona: '⛅', orana: '🌧️',
  'oram-baratra': '⛈️', varatra: '🌩️', rivotra: '🌪️',
};

export default function TableauDeBord() {
  const lg = api.langue;
  const naviguer = useNavigate();
  const [d, setD] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setErreur('');
    try { setD(await api.get('/dashboard')); }
    catch (e) { setErreur(e.message); }
  };

  useEffect(() => { charger(); }, []);

  if (erreur) {
    return <Page titre={t('tableau.titre', lg)}>
      <p className="erreur">{erreur} <button className="mini-bouton" onClick={charger}>{t('reessayer', lg)}</button></p>
    </Page>;
  }
  if (!d) return <Page titre={t('tableau.titre', lg)}><p className="chargement">{t('chargement', lg)}</p></Page>;

  const resume = () => {
    const parts = [];
    if (d.meteo && d.meteo[0]) {
      const m = d.meteo[0];
      parts.push(`${t('meteo.titre', lg)} ${m.lieu} : ${m.temp_min}–${m.temp_max}°, ${t('meteo.proba', lg)} ${m.proba_pluie}%`);
    }
    if (d.alertes) {
      parts.push(`${t('tableau.alertes', lg)} : ${d.alertes.total} (${d.alertes.urgentes} ${t('tableau.urgentes', lg)})`);
    }
    if (d.derniereObservation) {
      parts.push(`${t('tableau.derniere', lg)} : ${d.derniereObservation.parcelle}, ${d.derniereObservation.valeur}`);
    }
    parts.push(`${t('tableau.nbParcelles', lg)} : ${d.parcelles}`);
    parler(parts.join('. '));
  };

  const nonLues = (d.alertes && d.alertes.liste ? d.alertes.liste : []).filter((a) => !a.lue);

  return (
    <Page titre={t('tableau.titre', lg)}>
      <div className="ligne-form" style={{ padding: '0 14px' }}>
        <button className="action" onClick={resume}>🔊 {t('tableau.resume', lg)}</button>
        <button className="action jaune" onClick={charger}>🔄 {t('meteo.actualiser', lg)}</button>
      </div>

      {/* Statistiques */}
      <div className="grille-stats">
        <div className="carte stat rouge">
          <div className="valeur">{d.alertes ? d.alertes.urgentes : 0}</div>
          <div className="libelle">🔴 {t('tableau.urgentes', lg)}</div>
        </div>
        <div className="carte stat jaune">
          <div className="valeur">{d.alertes ? d.alertes.total : 0}</div>
          <div className="libelle">🔔 {t('tableau.total', lg)}</div>
        </div>
        <div className="carte stat vert">
          <div className="valeur">{d.parcelles}</div>
          <div className="libelle">🌾 {t('tableau.nbParcelles', lg)}</div>
        </div>
      </div>

      {/* Météo 3 jours */}
      <h2 style={{ padding: '8px 16px 0' }}>🌦️ {t('tableau.meteo3', lg)}</h2>
      {(d.meteo || []).map((m) => (
        <article key={m.id} className="carte">
          <div className="jour-tete">
            <div>
              <strong>{m.date_prev}</strong>
              <div className="meta-ligne">
                <span className="puce">📍 {m.lieu}</span>
                <span className="puce">💧 {m.proba_pluie}%</span>
                <span className="puce">🌡️ {m.temp_min}° / {m.temp_max}°</span>
              </div>
            </div>
            <span className="jour-icone">{ICONES[m.icone] || '🌈'}</span>
          </div>
        </article>
      ))}

      {/* Dernière observation */}
      <h2 style={{ padding: '8px 16px 0' }}>📓 {t('tableau.derniere', lg)}</h2>
      {d.derniereObservation ? (
        <div className="carte">
          <strong>{d.derniereObservation.parcelle}</strong>
          <div className="meta-ligne">
            <span className="puce">{t(`type.${d.derniereObservation.type}`, lg)}</span>
            <span className="puce">📅 {d.derniereObservation.date_obs}</span>
          </div>
          <p style={{ margin: '6px 0 0' }}>{d.derniereObservation.valeur}</p>
        </div>
      ) : (
        <p className="liste-vide">{t('tableau.pasObs', lg)}</p>
      )}

      {/* Alertes non lues */}
      <h2 style={{ padding: '8px 16px 0' }}>
        🔔 {t('tableau.alertes', lg)}
        {nonLues.length > 0 && <span className="badge" style={{ marginLeft: 8 }}>{nonLues.length}</span>}
      </h2>
      {nonLues.slice(0, 5).map((a) => (
        <div key={a.id} className={`carte ${a.priorite === 'URGENTE' ? 'rouge' : 'jaune'}`}>
          <p style={{ margin: 0 }}>{a.message}</p>
        </div>
      ))}
      {nonLues.length > 5 && (
        <div style={{ padding: '0 14px' }}>
          <button className="action" onClick={() => naviguer('/alertes')}>
            👉 {t('alertes.titre', lg)} ({nonLues.length})
          </button>
        </div>
      )}
    </Page>
  );
}
