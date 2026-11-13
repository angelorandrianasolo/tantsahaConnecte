import { useState, useEffect } from 'react';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';

/* Étape 6 : journal d'observations — formulaire, photo ≤ 500 Ko, filtres. */
const TYPES = [
  { id: 'PLUIE', icone: '🌧️' },
  { id: 'RAVAGEUR', icone: '🐛' },
  { id: 'PLANTATION', icone: '🌱' },
  { id: 'RECOLTE', icone: '🌾' },
  { id: 'MALADIE', icone: '🦠' },
];

const VIDE = { parcelle_id: '', type: 'PLUIE', date_obs: '', valeur: '', photo: '' };

const aujourdhui = () => new Date().toISOString().slice(0, 10);

export default function Journal() {
  const lg = api.langue;
  const [observations, setObservations] = useState([]);
  const [parcelles, setParcelles] = useState([]);
  const [form, setForm] = useState({ ...VIDE, date_obs: aujourdhui() });
  const [modif, setModif] = useState(null);
  const [fParc, setFParc] = useState('');
  const [fType, setFType] = useState('');
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      let q = '?limit=100';
      if (fParc) q += `&parcelle_id=${fParc}`;
      if (fType) q += `&type=${fType}`;
      const [o, p] = await Promise.all([api.get(`/observations${q}`), api.get('/parcelles')]);
      setObservations(o);
      setParcelles(p);
      setEtat('pret');
    } catch (e) { setErreur(e.message); setEtat('erreur'); }
  };

  useEffect(() => { charger(); }, [fParc, fType]);

  /* Photo : on réduit l'image dans le navigateur pour rester ≤ 500 Ko */
  const choisirPhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * ratio);
        c.height = Math.round(img.height * ratio);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL('image/jpeg', 0.7);
        if (dataUrl.length > 700000) { setErreur(t('journal.photoGros', lg)); return; }
        setErreur('');
        setForm((f2) => ({ ...f2, photo: dataUrl }));
      };
      img.src = lecteur.result;
    };
    lecteur.readAsDataURL(f);
  };

  const soumettre = async (e) => {
    e.preventDefault();
    if (!form.parcelle_id) { setErreur(t('journal.choisirParcelle', lg)); return; }
    const corps = {
      parcelle_id: Number(form.parcelle_id),
      type: form.type,
      date_obs: form.date_obs,
      valeur: form.valeur.trim(),
      photo: form.photo || null,
    };
    try {
      if (modif) await api.put(`/observations/${modif}`, corps);
      else await api.post('/observations', corps);
      setForm({ ...VIDE, date_obs: aujourdhui() });
      setModif(null);
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const editer = (o) => {
    setModif(o.id);
    setForm({
      parcelle_id: String(o.parcelle_id),
      type: o.type,
      date_obs: o.date_obs,
      valeur: o.valeur || '',
      photo: o.photo || '',
    });
    setErreur('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const supprimer = async (o) => {
    if (!window.confirm(t('sufa.confirm', lg))) return;
    try {
      await api.delete(`/observations/${o.id}`);
      if (modif === o.id) { setModif(null); setForm({ ...VIDE, date_obs: aujourdhui() }); }
      charger();
    } catch (err) { setErreur(err.message); }
  };

  if (etat === 'chargement') {
    return <Page titre={t('journal.titre', lg)}><p className="chargement">{t('chargement', lg)}</p></Page>;
  }

  return (
    <Page titre={t('journal.titre', lg)}>
      {erreur && <p className="erreur">{erreur}</p>}

      <div className="carte">
        <h2>{modif ? `✏️ ${t('journal.modifier', lg)}` : `➕ ${t('journal.nouveau', lg)}`}</h2>
        <form className="ligne-form formulaire" onSubmit={soumettre}>
          <div>
            <label htmlFor="j-parc">{t('journal.parcelle', lg)} *</label>
            <select id="j-parc" value={form.parcelle_id} onChange={(e) => setForm({ ...form, parcelle_id: e.target.value })}>
              <option value="">{t('journal.choisirParcelle', lg)}</option>
              {parcelles.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="j-date">{t('journal.date', lg)}</label>
            <input id="j-date" type="date" max={aujourdhui()} value={form.date_obs}
              onChange={(e) => setForm({ ...form, date_obs: e.target.value })} />
          </div>
          <div style={{ flexBasis: '100%' }}>
            <label>{t('journal.type', lg)}</label>
            <div className="filtres" style={{ padding: 0 }}>
              {TYPES.map((x) => (
                <button key={x.id} type="button"
                  className={form.type === x.id ? 'actif' : ''}
                  onClick={() => setForm({ ...form, type: x.id })}>
                  {x.icone} {t(`type.${x.id}`, lg)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="j-valeur">{t('journal.valeur', lg)}</label>
            <input id="j-valeur" value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} />
          </div>
          <div>
            <label htmlFor="j-photo">{t('journal.photo', lg)}</label>
            <input id="j-photo" type="file" accept="image/*" onChange={choisirPhoto} />
            {form.photo && (
              <div>
                <img className="photo-vignette" src={form.photo} alt={t('journal.photo', lg)} style={{ maxHeight: 140 }} />
                <button type="button" className="mini-bouton rouge"
                  onClick={() => setForm({ ...form, photo: '' })}>
                  🗑 {t('journal.photoRetirer', lg)}
                </button>
              </div>
            )}
          </div>
          <div className="actions-carte" style={{ marginTop: 0 }}>
            <button className="action" type="submit">💾 {t('hamafy', lg)}</button>
            {modif && (
              <button className="action jaune" type="button"
                onClick={() => { setModif(null); setForm({ ...VIDE, date_obs: aujourdhui() }); }}>
                ✖ {t('annuler', lg)}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filtres */}
      <div className="ligne-form" style={{ padding: '0 14px 8px' }}>
        <div>
          <label htmlFor="f-parc" className="sr-only">{t('journal.parcelle', lg)}</label>
          <select id="f-parc" value={fParc} onChange={(e) => setFParc(e.target.value)}>
            <option value="">{t('journal.parcelle', lg)} : {t('alertes.filtreTout', lg)}</option>
            {parcelles.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-jtype" className="sr-only">{t('journal.type', lg)}</label>
          <select id="f-jtype" value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="">{t('journal.type', lg)} : {t('alertes.filtreTout', lg)}</option>
            {TYPES.map((x) => <option key={x.id} value={x.id}>{x.icone} {t(`type.${x.id}`, lg)}</option>)}
          </select>
        </div>
      </div>

      {observations.length === 0 && <p className="liste-vide">{t('journal.aucune', lg)}</p>}

      {observations.map((o) => (
        <article key={o.id} className="carte">
          <div className="jour-tete">
            <div style={{ flex: 1 }}>
              <div className="meta-ligne" style={{ marginTop: 0 }}>
                <span className="puce">{TYPES.find((x) => x.id === o.type)?.icone} {t(`type.${o.type}`, lg)}</span>
                <span className="puce">📅 {o.date_obs}</span>
                <span className="puce">🌾 {o.parcelle}</span>
              </div>
              {o.valeur && <p style={{ margin: '8px 0 0', fontSize: 18 }}>{o.valeur}</p>}
            </div>
          </div>
          {o.photo && <img className="photo-vignette" src={o.photo} alt={t('journal.photo', lg)} style={{ maxHeight: 220 }} />}
          <div className="actions-carte">
            <button className="mini-bouton" onClick={() => editer(o)}>✏️ {t('journal.modifier', lg)}</button>
            <button className="mini-bouton rouge" onClick={() => supprimer(o)}>🗑 {t('sufa', lg)}</button>
          </div>
        </article>
      ))}
    </Page>
  );
}
