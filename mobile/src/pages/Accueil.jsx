import { Text } from 'react-native';
import Page from '../composants/Page';
import { api } from '../api/client';
import { t } from '../i18n/textes';
import { styles } from '../theme';

export default function Accueil() {
  return (
    <Page titre={t('accueil.titre', api.langue)} retour={false}>
      <Text style={styles.chargement}>{t('chargement', api.langue)}</Text>
    </Page>
  );
}
