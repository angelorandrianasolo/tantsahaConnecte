import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { styles } from '../theme.js';

/* Étape 6 mobile : journal — formulaire, photo ≤ 500 Ko, filtres */
const TYPES = [
  { id: 'PLUIE', icone: '🌧️' },
  { id: 'RAVAGEUR', icone: '🐛' },
  { id: 'PLANTATION', icone: '🌱' },
  { id: 'RECOLTE', icone: '🌾' },
  { id: 'MALADIE', icone: '🦠' },
];

const VIDE = { parcelle_id: '', type: 'PLUIE', date_obs: '', valeur: '', photo: '' };
const aujourdhui = () => new Date().toISOString().slice(0, 10);

export default function Journal() {
  const lg = api.langue;
  const [observations, setObservations] = useState([]);
  const [parcelles, setParcelles] = useState([]);
  const [form, setForm] = useState({ ...VIDE, date_obs: aujourdhui() });
  const [modif, setModif] = useState(null);
  const [fParc, setFParc] = useState('');
  const [fType, setFType] = useState('');
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      let q = '?limit=100';
      if (fParc) q += `&parcelle_id=${fParc}`;
      if (fType) q += `&type=${fType}`;
      const [o, p] = await Promise.all([api.get(`/observations${q}`), api.get('/parcelles')]);
      setObservations(o);
      setParcelles(p);
      setEtat('pret');
    } catch (e) { setErreur(e.message); setEtat('erreur'); }
  };

  useEffect(() => { charger(); }, [fParc, fType]);

  /* Photo : galerie, réduite (quality 0.6) pour rester ≤ 500 Ko */
  const choisirPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('journal.photo', lg), t('erreur', lg));
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (res.canceled) return;
    const a = res.assets[0];
    const dataUrl = `data:image/jpeg;base64,${a.base64 || ''}`;
    if (!a.base64 || dataUrl.length > 700000) {
      Alert.alert(t('journal.photoGros', lg));
      return;
    }
    setErreur('');
    setForm((f) => ({ ...f, photo: dataUrl }));
  };

  const soumettre = async () => {
    if (!form.parcelle_id) { setErreur(t('journal.choisirParcelle', lg)); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date_obs)) { setErreur(t('journal.date', lg)); return; }
    const corps = {
      parcelle_id: Number(form.parcelle_id),
      type: form.type,
      date_obs: form.date_obs,
      valeur: form.valeur.trim(),
      photo: form.photo || null,
    };
    try {
      if (modif) await api.put(`/observations/${modif}`, corps);
      else await api.post('/observations', corps);
      setForm({ ...VIDE, date_obs: aujourdhui() });
      setModif(null);
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const editer = (o) => {
    setModif(o.id);
    setForm({
      parcelle_id: String(o.parcelle_id),
      type: o.type,
      date_obs: o.date_obs,
      valeur: o.valeur || '',
      photo: o.photo || '',
    });
    setErreur('');
  };

  const supprimer = (o) => {
    Alert.alert(t('sufa', lg), t('sufa.confirm', lg), [
      { text: t('annuler', lg), style: 'cancel' },
      {
        text: t('sufa', lg),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/observations/${o.id}`);
            if (modif === o.id) { setModif(null); setForm({ ...VIDE, date_obs: aujourdhui() }); }
            charger();
          } catch (err) { setErreur(err.message); }
        },
      },
    ]);
  };

  if (etat === 'chargement') {
    return <Page titre={t('journal.titre', lg)}>
      <Text style={styles.chargement}>{t('chargement', lg)}</Text>
    </Page>;
  }

  return (
    <Page titre={t('journal.titre', lg)}>
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

      {/* Formulaire */}
      <View style={styles.carte}>
        <Text style={[styles.titrePage, { fontSize: 20, marginBottom: 8 }]}>
          {modif ? `✏️ ${t('journal.modifier', lg)}` : `➕ ${t('journal.nouveau', lg)}`}
        </Text>

        <Text style={styles.label}>{t('journal.parcelle', lg)} *</Text>
        <View style={[styles.chips, { paddingHorizontal: 0 }]}>
          {parcelles.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, String(form.parcelle_id) === String(p.id) && styles.chipActif]}
              onPress={() => setForm({ ...form, parcelle_id: String(p.id) })}
            >
              <Text style={[styles.chipTexte, String(form.parcelle_id) === String(p.id) && styles.chipTexteActif]}>
                🌾 {p.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('journal.date', lg)}</Text>
        <TextInput
          style={styles.champ}
          value={form.date_obs}
          onChangeText={(v) => setForm({ ...form, date_obs: v })}
          placeholder="AAAA-MM-JJ"
          maxLength={10}
        />

        <Text style={styles.label}>{t('journal.type', lg)}</Text>
        <View style={[styles.chips, { paddingHorizontal: 0 }]}>
          {TYPES.map((x) => (
            <TouchableOpacity
              key={x.id}
              style={[styles.chip, form.type === x.id && styles.chipActif]}
              onPress={() => setForm({ ...form, type: x.id })}
            >
              <Text style={[styles.chipTexte, form.type === x.id && styles.chipTexteActif]}>
                {x.icone} {t(`type.${x.id}`, lg)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('journal.valeur', lg)}</Text>
        <TextInput
          style={styles.champ}
          value={form.valeur}
          onChangeText={(v) => setForm({ ...form, valeur: v })}
          placeholder={t('journal.valeur', lg)}
        />

        <Text style={styles.label}>{t('journal.photo', lg)}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.chip} onPress={choisirPhoto}>
            <Text style={styles.chipTexte}>🖼️ {t('journal.photoAjouter', lg)}</Text>
          </TouchableOpacity>
          {!!form.photo && (
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: '#d32f2f', borderColor: '#d32f2f' }]}
              onPress={() => setForm({ ...form, photo: '' })}
            >
              <Text style={[styles.chipTexte, { color: '#ffffff' }]}>🗑 {t('journal.photoRetirer', lg)}</Text>
            </TouchableOpacity>
          )}
        </View>
        {!!form.photo && <Image source={{ uri: form.photo }} style={styles.photoVignette} />}

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity style={styles.action} onPress={soumettre}>
            <Text style={styles.actionTexte}>💾 {t('hamafy', lg)}</Text>
          </TouchableOpacity>
          {modif && (
            <TouchableOpacity
              style={[styles.action, styles.actionJaune]}
              onPress={() => { setModif(null); setForm({ ...VIDE, date_obs: aujourdhui() }); }}
            >
              <Text style={styles.actionTexte}>✖ {t('annuler', lg)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, !fParc && styles.chipActif]}
          onPress={() => setFParc('')}
        >
          <Text style={[styles.chipTexte, !fParc && styles.chipTexteActif]}>
            {t('journal.parcelle', lg)} : {t('alertes.filtreTout', lg)}
          </Text>
        </TouchableOpacity>
        {parcelles.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, fParc === String(p.id) && styles.chipActif]}
            onPress={() => setFParc(fParc === String(p.id) ? '' : String(p.id))}
          >
            <Text style={[styles.chipTexte, fParc === String(p.id) && styles.chipTexteActif]}>{p.nom}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.chips}>
        {TYPES.map((x) => (
          <TouchableOpacity
            key={x.id}
            style={[styles.chip, fType === x.id && styles.chipActif]}
            onPress={() => setFType(fType === x.id ? '' : x.id)}
          >
            <Text style={[styles.chipTexte, fType === x.id && styles.chipTexteActif]}>
              {x.icone} {t(`type.${x.id}`, lg)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {observations.length === 0 && <Text style={styles.listeVide}>{t('journal.aucune', lg)}</Text>}

      {observations.map((o) => (
        <View key={o.id} style={styles.carte}>
          <View style={styles.metaLigne}>
            <Text style={styles.puce}>
              {TYPES.find((x) => x.id === o.type)?.icone} {t(`type.${o.type}`, lg)}
            </Text>
            <Text style={styles.puce}>📅 {o.date_obs}</Text>
            <Text style={styles.puce}>🌾 {o.parcelle}</Text>
          </View>
          {!!o.valeur && <Text style={{ fontSize: 17, marginTop: 8 }}>{o.valeur}</Text>}
          {!!o.photo && <Image source={{ uri: o.photo }} style={styles.photoVignette} />}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={styles.chip} onPress={() => editer(o)}>
              <Text style={styles.chipTexte}>✏️ {t('journal.modifier', lg)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: '#d32f2f', borderColor: '#d32f2f' }]}
              onPress={() => supprimer(o)}
            >
              <Text style={[styles.chipTexte, { color: '#ffffff' }]}>🗑 {t('sufa', lg)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </Page>
  );
}
