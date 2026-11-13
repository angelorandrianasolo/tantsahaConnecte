import { useState, useEffect } from 'react';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { parler } from '../api/voix.js';

/* Étape 4 : alertes — filtres, marquer lu (par moi, via le token), voix. */
export default function Alertes() {
  const lg = api.langue;
  const [alertes, setAlertes] = useState([]);
  const [meta, setMeta] = useState({ types: [], priorites: [] });
  const [filtreLue, setFiltreLue] = useState('false');
  const [filtrePriorite, setFiltrePriorite] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      let q = '?limit=100';
      if (filtreLue !== 'toutes') q += `&lue=${filtreLue}`;
      if (filtrePriorite) q += `&priorite=${filtrePriorite}`;
      if (filtreType) q += `&type=${filtreType}`;
      const [a, m] = await Promise.all([api.get(`/alertes${q}`), api.get('/alertes/meta')]);
      setAlertes(a);
      setMeta({ types: m.types || [], priorites: m.priorites || [] });
      setEtat('pret');
    } catch (e) {
      setErreur(e.message);
      setEtat('erreur');
    }
  };

  useEffect(() => { charger(); }, [filtreLue, filtrePriorite, filtreType]);

  const marquerLue = async (a) => {
    try {
      await api.patch(`/alertes/${a.id}/lue`);
      setAlertes((liste) => liste.map((x) => (x.id === a.id ? { ...x, lue: true } : x)));
    } catch (e) { setErreur(e.message); }
  };

  const toutMarquerLue = async () => {
    const nonLues = alertes.filter((a) => !a.lue);
    try {
      await Promise.all(nonLues.map((a) => api.patch(`/alertes/${a.id}/lue`)));
      setAlertes((liste) => liste.map((x) => ({ ...x, lue: true })));
    } catch (e) { setErreur(e.message); }
  };

  const actualiser = async () => {
    try { await api.post('/alertes/actualisation'); charger(); }
    catch (e) { setErreur(e.message); }
  };

  if (etat === 'chargement') {
    return <Page titre={t('alertes.titre', lg)}><p className="chargement">{t('chargement', lg)}</p></Page>;
  }

  const nbNonLues = alertes.filter((a) => !a.lue).length;

  return (
    <Page titre={t('alertes.titre', lg)}>
      {erreur && <p className="erreur">{erreur} <button className="mini-bouton" onClick={charger}>{t('reessayer', lg)}</button></p>}

      <div className="ligne-form" style={{ padding: '0 14px' }}>
        <button className="action" onClick={actualiser}>🔄 {t('alertes.actualiser', lg)}</button>
        {nbNonLues > 0 && (
          <button className="action jaune" onClick={toutMarquerLue}>
            ✔ {t('alertes.lueToutes', lg)} ({nbNonLues})
          </button>
        )}
      </div>

      <div className="filtres">
        <button className={filtreLue === 'false' ? 'actif' : ''} onClick={() => setFiltreLue('false')}>
          🔴 {t('alertes.filtreNonLues', lg)}
        </button>
        <button className={filtreLue === 'toutes' ? 'actif' : ''} onClick={() => setFiltreLue('toutes')}>
          {t('alertes.filtreTout', lg)}
        </button>
        <button className={filtreLue === 'true' ? 'actif' : ''} onClick={() => setFiltreLue('true')}>
          ✔ {t('alertes.filtreLues', lg)}
        </button>
      </div>

      <div className="ligne-form" style={{ padding: '0 14px 8px' }}>
        <div>
          <label htmlFor="f-prio" className="sr-only">Priorité</label>
          <select id="f-prio" value={filtrePriorite} onChange={(e) => setFiltrePriorite(e.target.value)}>
            <option value="">{t('alertes.filtreTout', lg)}</option>
            {meta.priorites.map((p) => (
              <option key={p} value={p}>{t(`priorite.${p}`, lg)}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-type" className="sr-only">Type</label>
          <select id="f-type" value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
            <option value="">{t('journal.type', lg)} : {t('alertes.filtreTout', lg)}</option>
            {meta.types.map((x) => (
              <option key={x} value={x}>{t(`type.${x}`, lg)}</option>
            ))}
          </select>
        </div>
      </div>

      {alertes.length === 0 && <p className="liste-vide">{t('alertes.aucune', lg)}</p>}

      {alertes.map((a) => {
        const urgent = a.priorite === 'URGENTE';
        const lu = a.lue;
        return (
          <article key={a.id} className={`carte ${urgent ? 'rouge' : 'jaune'}`} style={lu ? { opacity: 0.6 } : undefined}>
            <div className="jour-tete">
              <div style={{ flex: 1 }}>
                <div className="meta-ligne" style={{ marginTop: 0 }}>
                  <span className={`puce`}>{urgent ? '🔴' : '🟡'} {t(`priorite.${a.priorite}`, lg)}</span>
                  <span className="puce">{t(`type.${a.type}`, lg)}</span>
                  <span className="puce">{String(a.created_at).slice(0, 10)}</span>
                  {lu && <span className="puce">✔</span>}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 18 }}>{a.message}</p>
              </div>
              <button className="voix" aria-label={t('voix.btn', lg)} onClick={() => parler(a.message)}>🔊</button>
            </div>
            {!lu && (
              <div className="actions-carte">
                <button className="mini-bouton vert" onClick={() => marquerLue(a)}>
                  ✔ {t('alertes.marquerLue', lg)}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </Page>
  );
}
