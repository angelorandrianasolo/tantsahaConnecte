import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';

/* Gabarit de page : titre + bouton retour. Toutes les pages l'utilisent. */
export default function Page({ titre, retour = true, children }) {
  const naviguer = useNavigate();
  return (
    <>
      <header className="tete-page">
        <h1>{titre}</h1>
        {retour && (
          <button className="lien-retour" onClick={() => naviguer('/')}>
            ← {t('retour', api.langue)}
          </button>
        )}
      </header>
      <main>{children}</main>
    </>
  );
}
