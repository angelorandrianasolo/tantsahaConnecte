import { useState, useEffect } from 'react';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { parler } from '../api/voix.js';

/* Étape 7 : conseils bilingues — filtre par thème + voix (audio serveur). */
export default function Conseils() {
  const lg = api.langue;
  const [conseils, setConseils] = useState([]);
  const [themes, setThemes] = useState([]);
  const [theme, setTheme] = useState('');
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      const q = theme ? `/conseils/theme/${encodeURIComponent(theme)}` : '/conseils';
      const [c, th] = await Promise.all([api.get(q), api.get('/conseils/themes')]);
      setConseils(c);
      setThemes(th);
      setEtat('pret');
    } catch (e) { setErreur(e.message); setEtat('erreur'); }
  };

  useEffect(() => { charger(); }, [theme]);

  const ecouter = async (c) => {
    try {
      const p = await api.get(`/conseils/${c.id}/audio`);
      const u = new SpeechSynthesisUtterance(p.texte);
      if (p.langue) u.lang = p.langue;
      if (p.rapidite != null) u.rate = p.rapidite;
      if (p.tonalite != null) u.pitch = p.tonalite;
      if (p.volume != null) u.volume = p.volume;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {
      parler(lg === 'fr' ? (c.contenu_fr || c.contenu) : c.contenu);   // secours hors ligne
    }
  };

  if (etat === 'chargement') {
    return <Page titre={t('conseils.titre', lg)}><p className="chargement">{t('chargement', lg)}</p></Page>;
  }

  return (
    <Page titre={t('conseils.titre', lg)}>
      {erreur && <p className="erreur">{erreur} <button className="mini-bouton" onClick={charger}>{t('reessayer', lg)}</button></p>}

      <div className="filtres">
        <button className={theme === '' ? 'actif' : ''} onClick={() => setTheme('')}>
          {t('conseils.tous', lg)}
        </button>
        {themes.map((th) => (
          <button key={th} className={theme === th ? 'actif' : ''} onClick={() => setTheme(th)}>
            {th}
          </button>
        ))}
      </div>

      {conseils.length === 0 && <p className="liste-vide">{t('conseils.aucun', lg)}</p>}

      {conseils.map((c) => (
        <article key={c.id} className="carte jaune">
          <div className="jour-tete">
            <div style={{ flex: 1 }}>
              <div className="meta-ligne" style={{ marginTop: 0 }}>
                <span className="puce">💡 {c.theme}</span>
              </div>
              <h3 style={{ margin: '6px 0 4px' }}>{lg === 'fr' ? (c.titre_fr || c.titre) : c.titre}</h3>
              <p style={{ margin: 0, fontSize: 18 }}>{lg === 'fr' ? (c.contenu_fr || c.contenu) : c.contenu}</p>
            </div>
            <button className="voix" aria-label={t('conseils.ecouter', lg)} onClick={() => ecouter(c)}>🔊</button>
          </div>
        </article>
      ))}
    </Page>
  );
}
