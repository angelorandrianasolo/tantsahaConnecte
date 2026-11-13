import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { styles } from '../theme.js';

/* Étape 5 mobile : parcelles — liste, création, modification, suppression */
const VIDE = { nom: '', region: '', culture_id: '', utilisateur_id: '' };

export default function Parcelles() {
  const lg = api.langue;
  const [parcelles, setParcelles] = useState([]);
  const [cultures, setCultures] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [form, setForm] = useState(VIDE);
  const [modif, setModif] = useState(null);
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      const [p, c, u] = await Promise.all([
        api.get('/parcelles'), api.get('/cultures'), api.get('/utilisateurs'),
      ]);
      setParcelles(p);
      setCultures(c);
      setUtilisateurs(u);
      setEtat('pret');
    } catch (e) { setErreur(e.message); setEtat('erreur'); }
  };

  useEffect(() => { charger(); }, []);

  const soumettre = async () => {
    if (!form.nom.trim()) { setErreur(t('parcelles.anarana', lg)); return; }
    const corps = {
      nom: form.nom.trim(),
      region: form.region.trim() || null,
      culture_id: form.culture_id ? Number(form.culture_id) : null,
      utilisateur_id: form.utilisateur_id ? Number(form.utilisateur_id) : null,
    };
    try {
      if (modif) await api.put(`/parcelles/${modif}`, corps);
      else await api.post('/parcelles', corps);
      setForm(VIDE);
      setModif(null);
      charger();
    } catch (err) { setErreur(err.message); }
  };

  const editer = (p) => {
    setModif(p.id);
    setForm({
      nom: p.nom,
      region: p.region || '',
      culture_id: p.culture_id || '',
      utilisateur_id: p.utilisateur_id || '',
    });
    setErreur('');
  };

  const supprimer = (p) => {
    Alert.alert(t('sufa', lg), t('sufa.confirm', lg), [
      { text: t('annuler', lg), style: 'cancel' },
      {
        text: t('sufa', lg),
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/parcelles/${p.id}`);
            if (modif === p.id) { setModif(null); setForm(VIDE); }
            charger();
          } catch (err) { setErreur(err.message); }
        },
      },
    ]);
  };

  if (etat === 'chargement') {
    return <Page titre={t('parcelles.titre', lg)}>
      <Text style={styles.chargement}>{t('chargement', lg)}</Text>
    </Page>;
  }

  return (
    <Page titre={t('parcelles.titre', lg)}>
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

      {/* Formulaire création / modification */}
      <View style={styles.carte}>
        <Text style={[styles.titrePage, { fontSize: 20, marginBottom: 8 }]}>
          {modif ? `✏️ ${t('parcelles.modifier', lg)}` : `➕ ${t('parcelles.nouveau', lg)}`}
        </Text>

        <Text style={styles.label}>{t('parcelles.anarana', lg)} *</Text>
        <TextInput
          style={styles.champ}
          value={form.nom}
          onChangeText={(v) => setForm({ ...form, nom: v })}
          placeholder={t('parcelles.anarana', lg)}
        />

        <Text style={styles.label}>{t('parcelles.region', lg)}</Text>
        <TextInput
          style={styles.champ}
          value={form.region}
          onChangeText={(v) => setForm({ ...form, region: v })}
          placeholder={t('parcelles.region', lg)}
        />

        <Text style={styles.label}>{t('parcelles.culture', lg)}</Text>
        <View style={[styles.chips, { paddingHorizontal: 0 }]}>
          <TouchableOpacity
            style={[styles.chip, !form.culture_id && styles.chipActif]}
            onPress={() => setForm({ ...form, culture_id: '' })}
          >
            <Text style={[styles.chipTexte, !form.culture_id && styles.chipTexteActif]}>
              {t('parcelles.sansCulture', lg)}
            </Text>
          </TouchableOpacity>
          {cultures.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, String(form.culture_id) === String(c.id) && styles.chipActif]}
              onPress={() => setForm({ ...form, culture_id: String(c.id) })}
            >
              <Text style={[styles.chipTexte, String(form.culture_id) === String(c.id) && styles.chipTexteActif]}>
                {c.pictogramme} {c.nom_mg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('parcelles.tompony', lg)}</Text>
        <View style={[styles.chips, { paddingHorizontal: 0 }]}>
          {utilisateurs.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={[styles.chip, String(form.utilisateur_id) === String(u.id) && styles.chipActif]}
              onPress={() => setForm({ ...form, utilisateur_id: String(form.utilisateur_id) === String(u.id) ? '' : String(u.id) })}
            >
              <Text style={[styles.chipTexte, String(form.utilisateur_id) === String(u.id) && styles.chipTexteActif]}>
                👤 {u.nom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <TouchableOpacity style={styles.action} onPress={soumettre}>
            <Text style={styles.actionTexte}>💾 {t('hamafy', lg)}</Text>
          </TouchableOpacity>
          {modif && (
            <TouchableOpacity
              style={[styles.action, styles.actionJaune]}
              onPress={() => { setModif(null); setForm(VIDE); }}
            >
              <Text style={styles.actionTexte}>✖ {t('annuler', lg)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {parcelles.length === 0 && <Text style={styles.listeVide}>{t('parcelles.aucune', lg)}</Text>}

      {parcelles.map((p) => (
        <View key={p.id} style={[styles.carte, styles.carteVert]}>
          <Text style={{ fontSize: 19, fontWeight: '800' }}>{p.nom}</Text>
          <View style={styles.metaLigne}>
            <Text style={styles.puce}>{p.culture || t('parcelles.sansCulture', lg)}</Text>
            {!!p.region && <Text style={styles.puce}>📍 {p.region}</Text>}
            <Text style={styles.puce}>👤 {p.proprietaire}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={styles.chip} onPress={() => editer(p)}>
              <Text style={styles.chipTexte}>✏️ {t('parcelles.modifier', lg)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: '#d32f2f', borderColor: '#d32f2f' }]}
              onPress={() => supprimer(p)}
            >
              <Text style={[styles.chipTexte, { color: '#ffffff' }]}>🗑 {t('sufa', lg)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </Page>
  );
}
