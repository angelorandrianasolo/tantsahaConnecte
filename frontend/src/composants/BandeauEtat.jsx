import { useState, useEffect } from 'react';
import { api, nombreFile, rejouerFile } from '../api/client.js';
import { t, remplir } from '../i18n/textes.js';

/* Bandeau d'état permanent :
   🟢/🔴 réseau + nombre d'écritures en attente + choix de la langue */
export default function BandeauEtat({ langue, onChangeLangue }) {
  const [enLigne, setEnLigne] = useState(navigator.onLine);
  const [enAttente, setEnAttente] = useState(nombreFile());

  useEffect(() => {
    const majReseau = () => setEnLigne(navigator.onLine);
    const majFile = () => setEnAttente(nombreFile());
    window.addEventListener('online', majReseau);
    window.addEventListener('offline', majReseau);
    window.addEventListener('file-attente', majFile);
    const id = setInterval(majFile, 2000);
    return () => {
      window.removeEventListener('online', majReseau);
      window.removeEventListener('offline', majReseau);
      window.removeEventListener('file-attente', majFile);
      clearInterval(id);
    };
  }, []);

  // Dès que le réseau revient, on renvoie ce qui était en attente
  useEffect(() => {
    if (enLigne && enAttente > 0) rejouerFile();
  }, [enLigne, enAttente]);

  return (
    <div className={`bandeau-etat ${enLigne ? 'en-ligne' : 'hors-ligne'}`} role="status">
      <span className="etat-gauche">
        <span className="pastille" aria-hidden="true" />
        {enLigne ? t('etat.enLigne', langue) : t('etat.horsLigne', langue)}
        {enAttente > 0 && (
          <span className="badge-file" title={t('etat.aEnvoyer', langue)}>
            📤 {remplir(t('etat.fileN', langue), { n: enAttente })}
          </span>
        )}
      </span>

      <span className="choix-langue" aria-label={t('accueil.langue', langue)}>
        <button
          type="button"
          className={langue === 'mg' ? 'actif' : ''}
          aria-pressed={langue === 'mg'}
          onClick={() => onChangeLangue('mg')}
        >
          MG
        </button>
        <button
          type="button"
          className={langue === 'fr' ? 'actif' : ''}
          aria-pressed={langue === 'fr'}
          onClick={() => onChangeLangue('fr')}
        >
          FR
        </button>
      </span>
    </div>
  );
}
