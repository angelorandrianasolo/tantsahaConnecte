import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { parler } from '../api/voix.js';
import { styles } from '../theme.js';

/* Étape 3 mobile : météo réelle multilieux, 🟢 favorable / 🔴 danger / 🟡 prudence */
const ICONES = {
  masoandro: '☀️', mandravona: '⛅', orana: '🌧️',
  'oram-baratra': '⛈️', varatra: '🌩️', rivotra: '🌪️',
};
const DANGEREUSES = ['oram-baratra', 'orage', 'varatra', 'rivotra', 'vent'];

const favorable = (j) =>
  Number(j.proba_pluie) >= 70 && !DANGEREUSES.includes(j.icone);

const VILLES = [
  { nom: 'Antsirabe', latitude: -19.8583, longitude: 47.5567 },
  { nom: 'Antananarivo', latitude: -18.8792, longitude: 47.5079 },
  { nom: 'Toamasina', latitude: -18.15, longitude: 49.4 },
  { nom: 'Fianarantsoa', latitude: -21.45, longitude: 47.09 },
  { nom: 'Mahajanga', latitude: -15.72, longitude: 46.32 },
  { nom: 'Toliara', latitude: -23.35, longitude: 43.67 },
  { nom: 'Antsiranana', latitude: -12.27, longitude: 49.29 },
];

export default function Meteo() {
  const lg = api.langue;
  const [jours, setJours] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    setChargement(true);
    setErreur('');
    try {
      setJours(await api.get('/meteo/prochains-jours?nb=7'));
    } catch (e) { setErreur(e.message); }
    setChargement(false);
  };

  useEffect(() => { charger(); }, []);

  const ajouterLieu = async (v) => {
    try {
      await api.post('/meteo/actualisation', v);
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const actualiser = async () => {
    setErreur('');
    try {
      const lieux = [...new Set(jours.map((j) => j.lieu))];
      const tout = await api.get('/meteo');
      const parLieu = {};
      tout.forEach((m) => { if (!parLieu[m.lieu]) parLieu[m.lieu] = m; });
      const aRafraichir = lieux.length ? lieux : Object.keys(parLieu);
      await Promise.all(aRafraichir.map((lieu) => {
        const m = parLieu[lieu];
        return api.post('/meteo/actualisation', m
          ? { latitude: m.latitude, longitude: m.longitude, lieu }
          : { lieu });
      }));
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const resume = async (j) => {
    try {
      const d = await api.get(`/meteo/${j.date_prev}/resume-vocal?lieu=${encodeURIComponent(j.lieu)}`);
      parler(typeof d === 'string' ? d : d.texte || d.message || '');
    } catch { /* rien */ }
  };

  if (chargement) {
    return <Page titre={t('meteo.titre', lg)}>
      <Text style={styles.chargement}>{t('chargement', lg)}</Text>
    </Page>;
  }

  const parLieu = {};
  jours.forEach((j) => { (parLieu[j.lieu] = parLieu[j.lieu] || []).push(j); });
  const lieux = Object.keys(parLieu);

  return (
    <Page titre={t('meteo.titre', lg)}>
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

      <View style={{ paddingHorizontal: 14 }}>
        <TouchableOpacity style={styles.action} onPress={actualiser}>
          <Text style={styles.actionTexte}>🔄 {t('meteo.actualiser', lg)}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { paddingHorizontal: 14, marginTop: 12 }]}>
        ➕ {t('meteo.ajouter', lg)}
      </Text>
      <View style={styles.chips}>
        {VILLES.map((v) => (
          <TouchableOpacity key={v.nom} style={styles.chip} onPress={() => ajouterLieu(v)}>
            <Text style={styles.chipTexte}>{v.nom}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {lieux.length === 0 && <Text style={styles.listeVide}>{t('meteo.aucune', lg)}</Text>}

      {lieux.map((lieu) => (
        <View key={lieu}>
          <Text style={{ fontSize: 20, fontWeight: '800', paddingHorizontal: 16, paddingTop: 10 }}>
            📍 {lieu}
          </Text>
          {parLieu[lieu].map((j) => {
            const bon = favorable(j);
            const mechant = DANGEREUSES.includes(j.icone);
            const carte = mechant ? styles.carteRouge : bon ? styles.carteVert : styles.carteJaune;
            return (
              <View key={j.id} style={[styles.carte, carte]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '800' }}>{j.date_prev}</Text>
                    <View style={styles.metaLigne}>
                      <Text style={styles.puce}>💧 {t('meteo.proba', lg)} {j.proba_pluie}%</Text>
                      <Text style={styles.puce}>🌡️ {j.temp_min}° / {j.temp_max}°</Text>
                    </View>
                  </View>
                  <Text style={styles.iconeJour}>{ICONES[j.icone] || '🌈'}</Text>
                </View>

                <View style={styles.barrePluie}>
                  <View style={[styles.barrePluieInterne, { width: `${j.proba_pluie}%` }]} />
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <View style={[styles.chip, bon ? styles.chipActif : mechant ? { backgroundColor: '#d32f2f', borderColor: '#d32f2f' } : { backgroundColor: '#f9a825', borderColor: '#f9a825' }]}>
                    <Text style={[styles.chipTexte, bon && styles.chipTexteActif, mechant && { color: '#ffffff' }, !bon && !mechant && { color: '#3a2c00' }]}>
                      {bon ? '✅ ' : mechant ? '⛔ ' : '⚠️ '}
                      {bon ? t('meteo.favorable', lg) : t('meteo.pasFavorable', lg)}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.chip} onPress={() => resume(j)}>
                    <Text style={styles.chipTexte}>🔊 {t('meteo.resume', lg)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <View style={[styles.metaLigne, { paddingHorizontal: 16, paddingBottom: 30 }]}>
        <Text style={styles.puce}>🟢 {t('meteo.favorable', lg)}</Text>
        <Text style={styles.puce}>🔴 {t('meteo.pasFavorable', lg)}</Text>
        <Text style={styles.puce}>🟡 {t('meteo.proba', lg)} &lt; 70%</Text>
      </View>
    </Page>
  );
}
