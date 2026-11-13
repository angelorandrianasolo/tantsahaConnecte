import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { t } from '../i18n/textes';
import { couleurs, styles } from '../theme';

/* Gabarit de page (miroir du composant web Page.jsx) : titre + retour */
export default function Page({ titre, retour = true, defiler = true, children }) {
  const navigation = useNavigation();
  const Contenu = defiler ? ScrollView : View;

  return (
    <View style={{ flex: 1, backgroundColor: couleurs.fond }}>
      <View style={styles.tetePage}>
        <Text style={styles.titrePage}>{titre}</Text>
        {retour && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.lienRetour}>← {t('retour', api.langue)}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Contenu style={styles.corps} contentContainerStyle={{ paddingBottom: 30 }}>
        {children}
      </Contenu>
    </View>
  );
}
