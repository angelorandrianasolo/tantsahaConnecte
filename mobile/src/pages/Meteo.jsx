import { Text } from 'react-native';
import Page from '../composants/Page';
import { api } from '../api/client';
import { t } from '../i18n/textes';
import { styles } from '../theme';

export default function Meteo() {
  return (
    <Page titre={t('accueil.meteo', api.langue)} retour={true}>
      <Text style={styles.chargement}>{t('chargement', api.langue)}</Text>
    </Page>
  );
}
