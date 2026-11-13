import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { parler } from '../api/voix.js';
import { styles } from '../theme.js';

/* Étape 7 mobile : conseils bilingues — filtre par thème + voix */
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
      parler(p.texte || '');
    } catch {
      parler(lg === 'fr' ? (c.contenu_fr || c.contenu) : c.contenu);   // secours hors ligne
    }
  };

  if (etat === 'chargement') {
    return <Page titre={t('conseils.titre', lg)}>
      <Text style={styles.chargement}>{t('chargement', lg)}</Text>
    </Page>;
  }

  return (
    <Page titre={t('conseils.titre', lg)}>
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, theme === '' && styles.chipActif]}
          onPress={() => setTheme('')}
        >
          <Text style={[styles.chipTexte, theme === '' && styles.chipTexteActif]}>
            {t('conseils.tous', lg)}
          </Text>
        </TouchableOpacity>
        {themes.map((th) => (
          <TouchableOpacity
            key={th}
            style={[styles.chip, theme === th && styles.chipActif]}
            onPress={() => setTheme(theme === th ? '' : th)}
          >
            <Text style={[styles.chipTexte, theme === th && styles.chipTexteActif]}>{th}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {conseils.length === 0 && <Text style={styles.listeVide}>{t('conseils.aucun', lg)}</Text>}

      {conseils.map((c) => (
        <View key={c.id} style={[styles.carte, styles.carteJaune]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={styles.metaLigne}>
                <Text style={styles.puce}>💡 {c.theme}</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 6 }}>
                {lg === 'fr' ? (c.titre_fr || c.titre) : c.titre}
              </Text>
              <Text style={{ fontSize: 17, marginTop: 4 }}>
                {lg === 'fr' ? (c.contenu_fr || c.contenu) : c.contenu}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityLabel={t('conseils.ecouter', lg)}
              style={[styles.chip, { borderRadius: 999 }]}
              onPress={() => ecouter(c)}
            >
              <Text style={{ fontSize: 22 }}>🔊</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </Page>
  );
}
