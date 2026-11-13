import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';

export default function Parcelles() {
  return (
    <Page titre={t('accueil.parcelles', api.langue)}>
      <div className="carte">
        <p className="chargement">{t('chargement', api.langue)}</p>
      </div>
    </Page>
  );
}
