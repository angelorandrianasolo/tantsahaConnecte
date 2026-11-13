import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t } from '../i18n/textes.js';
import { parler } from '../api/voix.js';
import { styles } from '../theme.js';

/* Étape 4 mobile : alertes — filtres, marquer lu, voix */
export default function Alertes() {
  const lg = api.langue;
  const [alertes, setAlertes] = useState([]);
  const [meta, setMeta] = useState({ types: [], priorites: [] });
  const [filtreLue, setFiltreLue] = useState('false');
  const [filtrePriorite, setFiltrePriorite] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      let q = '?limit=100';
      if (filtreLue !== 'toutes') q += `&lue=${filtreLue}`;
      if (filtrePriorite) q += `&priorite=${filtrePriorite}`;
      if (filtreType) q += `&type=${filtreType}`;
      const [a, m] = await Promise.all([api.get(`/alertes${q}`), api.get('/alertes/meta')]);
      setAlertes(a);
      setMeta({ types: m.types || [], priorites: m.priorites || [] });
      setEtat('pret');
    } catch (e) {
      setErreur(e.message);
      setEtat('erreur');
    }
  };

  useEffect(() => { charger(); }, [filtreLue, filtrePriorite, filtreType]);

  const marquerLue = async (a) => {
    try {
      await api.patch(`/alertes/${a.id}/lue`);
      setAlertes((liste) => liste.map((x) => (x.id === a.id ? { ...x, lue: true } : x)));
    } catch (e) { setErreur(e.message); }
  };

  const toutMarquerLue = async () => {
    const nonLues = alertes.filter((a) => !a.lue);
    try {
      await Promise.all(nonLues.map((a) => api.patch(`/alertes/${a.id}/lue`)));
      setAlertes((liste) => liste.map((x) => ({ ...x, lue: true })));
    } catch (e) { setErreur(e.message); }
  };

  const actualiser = async () => {
    try { await api.post('/alertes/actualisation'); charger(); }
    catch (e) { setErreur(e.message); }
  };

  if (etat === 'chargement') {
    return <Page titre={t('alertes.titre', lg)}>
      <Text style={styles.chargement}>{t('chargement', lg)}</Text>
    </Page>;
  }

  const nbNonLues = alertes.filter((a) => !a.lue).length;

  return (
    <Page titre={t('alertes.titre', lg)}>
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

      <View style={{ paddingHorizontal: 14, flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <TouchableOpacity style={styles.action} onPress={actualiser}>
          <Text style={styles.actionTexte}>🔄 {t('alertes.actualiser', lg)}</Text>
        </TouchableOpacity>
        {nbNonLues > 0 && (
          <TouchableOpacity style={[styles.action, styles.actionJaune]} onPress={toutMarquerLue}>
            <Text style={styles.actionTexte}>✔ {t('alertes.lueToutes', lg)} ({nbNonLues})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtre lu / non lu */}
      <View style={styles.chips}>
        {[
          { v: 'false', l: `🔴 ${t('alertes.filtreNonLues', lg)}` },
          { v: 'toutes', l: t('alertes.filtreTout', lg) },
          { v: 'true', l: `✔ ${t('alertes.filtreLues', lg)}` },
        ].map((f) => (
          <TouchableOpacity
            key={f.v}
            style={[styles.chip, filtreLue === f.v && styles.chipActif]}
            onPress={() => setFiltreLue(f.v)}
          >
            <Text style={[styles.chipTexte, filtreLue === f.v && styles.chipTexteActif]}>{f.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtre priorité */}
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, filtrePriorite === '' && styles.chipActif]}
          onPress={() => setFiltrePriorite('')}
        >
          <Text style={[styles.chipTexte, filtrePriorite === '' && styles.chipTexteActif]}>
            {t('alertes.filtreTout', lg)}
          </Text>
        </TouchableOpacity>
        {meta.priorites.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, filtrePriorite === p && styles.chipActif]}
            onPress={() => setFiltrePriorite(filtrePriorite === p ? '' : p)}
          >
            <Text style={[styles.chipTexte, filtrePriorite === p && styles.chipTexteActif]}>
              {p === 'URGENTE' ? '🔴' : '🟡'} {t(`priorite.${p}`, lg)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtre type */}
      <View style={styles.chips}>
        {meta.types.map((x) => (
          <TouchableOpacity
            key={x}
            style={[styles.chip, filtreType === x && styles.chipActif]}
            onPress={() => setFiltreType(filtreType === x ? '' : x)}
          >
            <Text style={[styles.chipTexte, filtreType === x && styles.chipTexteActif]}>
              {t(`type.${x}`, lg)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {alertes.length === 0 && <Text style={styles.listeVide}>{t('alertes.aucune', lg)}</Text>}

      {alertes.map((a) => {
        const urgent = a.priorite === 'URGENTE';
        return (
          <View
            key={a.id}
            style={[styles.carte, urgent ? styles.carteRouge : styles.carteJaune, a.lue && { opacity: 0.6 }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={styles.metaLigne}>
                  <Text style={styles.puce}>{urgent ? '🔴' : '🟡'} {t(`priorite.${a.priorite}`, lg)}</Text>
                  <Text style={styles.puce}>{t(`type.${a.type}`, lg)}</Text>
                  <Text style={styles.puce}>{String(a.created_at).slice(0, 10)}</Text>
                  {a.lue && <Text style={styles.puce}>✔</Text>}
                </View>
                <Text style={{ fontSize: 17, marginTop: 8 }}>{a.message}</Text>
              </View>
              <TouchableOpacity
                accessibilityLabel={t('voix.btn', lg)}
                style={[styles.chip, { borderRadius: 999 }]}
                onPress={() => parler(a.message)}
              >
                <Text style={{ fontSize: 22 }}>🔊</Text>
              </TouchableOpacity>
            </View>
            {!a.lue && (
              <TouchableOpacity
                style={[styles.chip, styles.chipActif, { alignSelf: 'flex-start', marginTop: 10 }]}
                onPress={() => marquerLue(a)}
              >
                <Text style={[styles.chipTexte, styles.chipTexteActif]}>
                  ✔ {t('alertes.marquerLue', lg)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </Page>
  );
}
