import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { api, nombreFile, rejouerFile } from '../api/client.js';
import { t, remplir } from '../i18n/textes.js';
import { couleurs, styles } from '../theme.js';

/* Bandeau d'état permanent (miroir du web) :
   🟢/🔴 serveur joignable + écritures en attente + choix de la langue */
export default function BandeauEtat() {
  const lg = api.langue;
  const langue = lg;                            // pour les boutons MG/FR
  const [enLigne, setEnLigne] = useState(true);
  const [enAttente, setEnAttente] = useState(0);

  useEffect(() => {
    let vivant = true;
    const verifier = async () => {
      try {
        await api.get('/health');
        if (vivant) setEnLigne(true);
      } catch {
        if (vivant) setEnLigne(false);
      }
      try {
        const n = await nombreFile();
        if (vivant) setEnAttente(n);
      } catch { /* ignore */ }
    };
    verifier();
    const id = setInterval(verifier, 15000);
    return () => { vivant = false; clearInterval(id); };
  }, []);

  // Dès que le serveur redevient joignable, on renvoie l'attente
  useEffect(() => {
    if (enLigne && enAttente > 0) rejouerFile();
  }, [enLigne, enAttente]);

  return (
    <View style={[styles.bandeau, { backgroundColor: enLigne ? couleurs.vert : couleurs.rouge }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
        <View style={styles.pastille} />
        <Text style={styles.bandeauTexte}>
          {enLigne ? t('etat.enLigne', lg) : t('etat.horsLigne', lg)}
        </Text>
        {enAttente > 0 && (
          <Text style={[styles.bandeauTexte, { marginLeft: 8, opacity: 0.9 }]}>
            📤 {remplir(t('etat.fileN', lg), { n: enAttente })}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {['mg', 'fr'].map((l) => (
          <TouchableOpacity
            key={l}
            accessibilityLabel={`${t('accueil.langue', lg)} ${l}`}
            onPress={() => api.setLangue(l)}
            style={[styles.boutonLangue, langue === l && styles.boutonLangueActif]}
          >
            <Text style={[styles.boutonLangueTexte, langue === l && styles.boutonLangueTexteActif]}>
              {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

