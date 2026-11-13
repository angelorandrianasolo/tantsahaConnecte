import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { parler } from '../api/voix.js';
import { couleurs, styles } from '../theme.js';

/* Étape 8 mobile : tableau de bord — l'état du jour en UN appel */
const ICONES = {
  masoandro: '☀️', mandravona: '⛅', orana: '🌧️',
  'oram-baratra': '⛈️', varatra: '🌩️', rivotra: '🌪️',
};

export default function TableauDeBord() {
  const lg = api.langue;
  const navigation = useNavigation();
  const [d, setD] = useState(null);
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setErreur('');
    try { setD(await api.get('/dashboard')); }
    catch (e) { setErreur(e.message); }
  };

  useEffect(() => { charger(); }, []);

  if (erreur) {
    return <Page titre={t('tableau.titre', lg)}>
      <Text style={styles.erreur}>{erreur}</Text>
      <View style={{ paddingHorizontal: 14 }}>
        <TouchableOpacity style={styles.action} onPress={charger}>
          <Text style={styles.actionTexte}>{t('reessayer', lg)}</Text>
        </TouchableOpacity>
      </View>
    </Page>;
  }
  if (!d) {
    return <Page titre={t('tableau.titre', lg)}>
      <Text style={styles.chargement}>{t('chargement', lg)}</Text>
    </Page>;
  }

  const resume = () => {
    const parts = [];
    if (d.meteo && d.meteo[0]) {
      const m = d.meteo[0];
      parts.push(`${t('meteo.titre', lg)} ${m.lieu} : ${m.temp_min}–${m.temp_max}°, ${t('meteo.proba', lg)} ${m.proba_pluie}%`);
    }
    if (d.alertes) {
      parts.push(`${t('tableau.alertes', lg)} : ${d.alertes.total} (${d.alertes.urgentes} ${t('tableau.urgentes', lg)})`);
    }
    if (d.derniereObservation) {
      parts.push(`${t('tableau.derniere', lg)} : ${d.derniereObservation.parcelle}, ${d.derniereObservation.valeur}`);
    }
    parts.push(`${t('tableau.nbParcelles', lg)} : ${d.parcelles}`);
    parler(parts.join('. '));
  };

  const nonLues = (d.alertes && d.alertes.liste ? d.alertes.liste : []).filter((a) => !a.lue);

  const stats = [
    { valeur: d.alertes ? d.alertes.urgentes : 0, libelle: `🔴 ${t('tableau.urgentes', lg)}`, couleur: couleurs.rouge },
    { valeur: d.alertes ? d.alertes.total : 0, libelle: `🔔 ${t('tableau.total', lg)}`, couleur: couleurs.jauneFonce },
    { valeur: d.parcelles, libelle: `🌾 ${t('tableau.nbParcelles', lg)}`, couleur: couleurs.vert },
  ];

  return (
    <Page titre={t('tableau.titre', lg)}>
      <View style={{ paddingHorizontal: 14, flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <TouchableOpacity style={styles.action} onPress={resume}>
          <Text style={styles.actionTexte}>🔊 {t('tableau.resume', lg)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.action, styles.actionJaune]} onPress={charger}>
          <Text style={styles.actionTexte}>🔄 {t('meteo.actualiser', lg)}</Text>
        </TouchableOpacity>
      </View>

      {/* Statistiques */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginTop: 12 }}>
        {stats.map((s) => (
          <View key={s.libelle} style={[styles.carte, styles.stat, { flex: 1, margin: 0, padding: 10 }]}>
            <Text style={[styles.statValeur, { color: s.couleur }]}>{s.valeur}</Text>
            <Text style={styles.statLibelle}>{s.libelle}</Text>
          </View>
        ))}
      </View>

      {/* Météo 3 jours */}
      <Text style={{ fontSize: 20, fontWeight: '800', paddingHorizontal: 16, paddingTop: 14 }}>
        🌦️ {t('tableau.meteo3', lg)}
      </Text>
      {(d.meteo || []).map((m) => (
        <View key={m.id} style={styles.carte}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '800' }}>{m.date_prev}</Text>
              <View style={styles.metaLigne}>
                <Text style={styles.puce}>📍 {m.lieu}</Text>
                <Text style={styles.puce}>💧 {m.proba_pluie}%</Text>
                <Text style={styles.puce}>🌡️ {m.temp_min}° / {m.temp_max}°</Text>
              </View>
            </View>
            <Text style={styles.iconeJour}>{ICONES[m.icone] || '🌈'}</Text>
          </View>
        </View>
      ))}

      {/* Dernière observation */}
      <Text style={{ fontSize: 20, fontWeight: '800', paddingHorizontal: 16, paddingTop: 14 }}>
        📓 {t('tableau.derniere', lg)}
      </Text>
      {d.derniereObservation ? (
        <View style={styles.carte}>
          <Text style={{ fontSize: 17, fontWeight: '800' }}>{d.derniereObservation.parcelle}</Text>
          <View style={styles.metaLigne}>
            <Text style={styles.puce}>{t(`type.${d.derniereObservation.type}`, lg)}</Text>
            <Text style={styles.puce}>📅 {d.derniereObservation.date_obs}</Text>
          </View>
          <Text style={{ fontSize: 17, marginTop: 6 }}>{d.derniereObservation.valeur}</Text>
        </View>
      ) : (
        <Text style={styles.listeVide}>{t('tableau.pasObs', lg)}</Text>
      )}

      {/* Alertes non lues */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>🔔 {t('tableau.alertes', lg)}</Text>
        {nonLues.length > 0 && (
          <Text style={styles.badge}>
            <Text style={styles.badgeTexte}>{nonLues.length}</Text>
          </Text>
        )}
      </View>
      {nonLues.slice(0, 5).map((a) => (
        <View key={a.id} style={[styles.carte, a.priorite === 'URGENTE' ? styles.carteRouge : styles.carteJaune]}>
          <Text style={{ fontSize: 16 }}>{a.message}</Text>
        </View>
      ))}
      {nonLues.length > 5 && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 30 }}>
          <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('Alertes')}>
            <Text style={styles.actionTexte}>👉 {t('alertes.titre', lg)} ({nonLues.length})</Text>
          </TouchableOpacity>
        </View>
      )}
    </Page>
  );
}
