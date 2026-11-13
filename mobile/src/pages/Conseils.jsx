import { Text } from 'react-native';
import Page from '../composants/Page';
import { api } from '../api/client';
import { t } from '../i18n/textes';
import { styles } from '../theme';

export default function Conseils() {
  return (
    <Page titre={t('accueil.conseils', api.langue)} retour={true}>
      <Text style={styles.chargement}>{t('chargement', api.langue)}</Text>
    </Page>
  );
}
