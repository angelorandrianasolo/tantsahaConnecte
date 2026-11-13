import { useState, useEffect } from 'react';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';

/* Étape 5 : parcelles — liste, création, modification, suppression. */
const VIDE = { nom: '', region: '', culture_id: '', utilisateur_id: '' };

export default function Parcelles() {
  const lg = api.langue;
  const [parcelles, setParcelles] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [modif, setModif] = useState(null);   // id de la parcelle en édition, ou null
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      const [p, c, u] = await Promise.all([
        api.get('/parcelles'), api.get('/cultures'), api.get('/utilisateurs'),
      ]);
      setParcelles(p);
      setCultures(c);
      setUtilisateurs(u);
      setEtat('pret');
    } catch (e) { setErreur(e.message); setEtat('erreur'); }
  };

  useEffect(() => { charger(); }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) { setErreur(t('parcelles.anarana', lg)); return; }
    const corps = {
      nom: form.nom.trim(),
      region: form.region.trim() || null,
      culture_id: form.culture_id ? Number(form.culture_id) : null,
      utilisateur_id: form.utilisateur_id ? Number(form.utilisateur_id) : null,
    };
    try {
      if (modif) await api.put(`/parcelles/${modif}`, corps);
      else await api.post('/parcelles', corps);
      setForm(VIDE);
      setModif(null);
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const editer = (p) => {
    setModif(p.id);
    setForm({
      nom: p.nom,
      region: p.region || '',
      culture_id: p.culture_id || '',
      utilisateur_id: p.utilisateur_id || '',
    });
    setErreur('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const supprimer = async (p) => {
    if (!window.confirm(t('sufa.confirm', lg))) return;
    try {
      await api.delete(`/parcelles/${p.id}`);
      if (modif === p.id) { setModif(null); setForm(VIDE); }
      charger();
    } catch (err) { setErreur(err.message); }
  };

  if (etat === 'chargement') {
    return <Page titre={t('parcelles.titre', lg)}><p className="chargement">{t('chargement', lg)}</p></Page>;
  }

  return (
    <Page titre={t('parcelles.titre', lg)}>
      {erreur && <p className="erreur">{erreur}</p>}

      {/* Formulaire création / modification */}
      <div className="carte">
        <h2>{modif ? `✏️ ${t('parcelles.modifier', lg)}` : `➕ ${t('parcelles.nouveau', lg)}`}</h2>
        <form className="ligne-form formulaire" onSubmit={soumettre}>
          <div>
            <label htmlFor="p-nom">{t('parcelles.anarana', lg)} *</label>
            <input id="p-nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div>
            <label htmlFor="p-region">{t('parcelles.region', lg)}</label>
            <input id="p-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
          </div>
          <div>
            <label htmlFor="p-culture">{t('parcelles.culture', lg)}</label>
            <select id="p-culture" value={form.culture_id} onChange={(e) => setForm({ ...form, culture_id: e.target.value })}>
              <option value="">{t('parcelles.sansCulture', lg)}</option>
              {cultures.map((c) => (
                <option key={c.id} value={c.id}>{c.pictogramme} {c.nom_mg}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="p-tompony">{t('parcelles.tompony', lg)}</label>
            <select id="p-tompony" value={form.utilisateur_id} onChange={(e) => setForm({ ...form, utilisateur_id: e.target.value })}>
              <option value="">—</option>
              {utilisateurs.map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
            </select>
          </div>
          <div className="actions-carte" style={{ marginTop: 0 }}>
            <button className="action" type="submit">💾 {t('hamafy', lg)}</button>
            {modif && (
              <button className="action jaune" type="button"
                onClick={() => { setModif(null); setForm(VIDE); }}>
                ✖ {t('annuler', lg)}
              </button>
            )}
          </div>
        </form>
      </div>

      {parcelles.length === 0 && <p className="liste-vide">{t('parcelles.aucune', lg)}</p>}

      {parcelles.map((p) => (
        <article key={p.id} className="carte vert">
          <div className="jour-tete">
            <div>
              <strong style={{ fontSize: 20 }}>{p.nom}</strong>
              <div className="meta-ligne">
                <span className="puce">{p.culture || t('parcelles.sansCulture', lg)}</span>
                {p.region && <span className="puce">📍 {p.region}</span>}
                <span className="puce">👤 {p.proprietaire}</span>
              </div>
            </div>
          </div>
          <div className="actions-carte">
            <button className="mini-bouton" onClick={() => editer(p)}>✏️ {t('parcelles.modifier', lg)}</button>
            <button className="mini-bouton rouge" onClick={() => supprimer(p)}>🗑 {t('sufa', lg)}</button>
          </div>
        </article>
      ))}
    </Page>
  );
}
