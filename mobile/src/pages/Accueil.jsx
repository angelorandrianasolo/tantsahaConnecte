import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Page from '../composants/Page.jsx';
import { api } from '../api/client.js';
import { t, remplir } from '../i18n/textes.js';
import { parler } from '../api/voix.js';
import { styles } from '../theme.js';

/* Étape 1 mobile : accueil — session en un clic + boutons géants */
export default function Accueil() {
  const lg = api.langue;
  const navigation = useNavigation();
  const [utilisateur, setUtilisateur] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [nbAlertes, setNbAlertes] = useState(0);
  const [nomNouveau, setNomNouveau] = useState('');
  const [etat, setEtat] = useState('chargement');
  const [erreur, setErreur] = useState('');

  const charger = async () => {
    setEtat('chargement');
    setErreur('');
    try {
      if (api.token) {
        const s = await api.get('/session');
        setUtilisateur(s.utilisateur);
      } else {
        setUtilisateur(null);
      }
      const u = await api.get('/utilisateurs');
      setUtilisateurs(u);
      const n = await api.get('/alertes/non-lues');
      setNbAlertes(n.length);
      setEtat('pret');
    } catch (e) {
      setErreur(e.message);
      setEtat('erreur');
    }
  };

  useEffect(() => { charger(); }, []);

  const connecter = async (id) => {
    try {
      const r = await api.post('/session', { utilisateur_id: id });
      await api.setToken(r.token);
      charger();
    } catch (e) { setErreur(e.message); }
  };

  const creerEtConnecter = async () => {
    if (!nomNouveau.trim()) return;
    try {
      const u = await api.post('/utilisateurs', { nom: nomNouveau.trim() });
      setNomNouveau('');
      await connecter(u.id);
    } catch (e) { setErreur(e.message); }
  };

  const deconnecter = async () => {
    try { await api.delete('/session'); } catch { /* token déjà invalide */ }
    await api.setToken(null);
    charger();
  };

  if (etat === 'chargement') {
    return <Page titre={t('accueil.titre', lg)} retour={false}>
      <Text style={styles.chargement}>{t('chargement', lg)}</Text>
    </Page>;
  }

  /* ---------- Pas de session : choix de l'utilisateur ---------- */
  if (!utilisateur) {
    return (
      <Page titre={t('accueil.titre', lg)} retour={false}>
        {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

        <View style={styles.carte}>
          <Text style={[styles.titrePage, { fontSize: 20, marginBottom: 10 }]}>
            {t('connexion.titre', lg)}
          </Text>
          {utilisateurs.length === 0 && (
            <Text style={styles.listeVide}>{t('connexion.aucun', lg)}</Text>
          )}
          <View style={styles.grille}>
            {utilisateurs.map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[styles.boutonGeant, styles.boutonGeantVert]}
                onPress={() => connecter(u.id)}
              >
                <Text style={styles.icone}>👤</Text>
                <Text style={[styles.boutonGeantTexte, styles.boutonGeantTexteClair]}>{u.nom}</Text>
                <Text style={{ color: '#ffffff', fontSize: 14 }}>{u.region}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.carte}>
          <Text style={[styles.label, { fontSize: 18 }]}>{t('connexion.nouveau', lg)}</Text>
          <Text style={styles.label}>{t('connexion.anarana', lg)}</Text>
          <TextInput
            style={styles.champ}
            value={nomNouveau}
            onChangeText={setNomNouveau}
            placeholder={t('connexion.anarana', lg)}
          />
          <TouchableOpacity style={[styles.action, { marginTop: 12 }]} onPress={creerEtConnecter}>
            <Text style={styles.actionTexte}>{t('connexion.creer', lg)}</Text>
          </TouchableOpacity>
        </View>
      </Page>
    );
  }

  /* ---------- Connecté : boutons géants ---------- */
  const salama = remplir(t('accueil.salama', lg), { nom: utilisateur.nom });
  const boutons = [
    { cle: 'accueil.meteo', icone: '🌦️', route: 'Meteo', style: styles.boutonGeantVert, texteClair: true },
    { cle: 'accueil.alertes', icone: '🔔', route: 'Alertes', badge: nbAlertes, style: nbAlertes > 0 ? styles.boutonGeantRouge : null },
    { cle: 'accueil.journal', icone: '📓', route: 'Journal' },
    { cle: 'accueil.conseils', icone: '💡', route: 'Conseils', style: styles.boutonGeantJaune },
    { cle: 'accueil.parcelles', icone: '🌾', route: 'Parcelles' },
    { cle: 'accueil.tableau', icone: '📊', route: 'TableauDeBord' },
  ];

  return (
    <Page titre={t('accueil.titre', lg)} retour={false}>
      {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}

      <View style={[styles.carte, styles.carteVert]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800' }}>{salama}</Text>
            <View style={styles.metaLigne}>
              <Text style={styles.puce}>📍 {utilisateur.region}</Text>
              <Text style={styles.puce}>👤 {utilisateur.nom}</Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityLabel={t('voix.btn', lg)}
            style={[styles.chip, { padding: 10, borderRadius: 999 }]}
            onPress={() => parler(salama)}
          >
            <Text style={{ fontSize: 30 }}>🔊</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.grille}>
        {boutons.map((b) => (
          <TouchableOpacity
            key={b.route}
            style={[styles.boutonGeant, b.style || null]}
            onPress={() => navigation.navigate(b.route)}
          >
            <Text style={styles.icone}>{b.icone}</Text>
            <Text style={[styles.boutonGeantTexte, b.texteClair && styles.boutonGeantTexteClair]}>
              {t(b.cle, lg)}
              {!!b.badge && b.badge > 0 && (
                <Text style={styles.badge}>{b.badge}</Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ paddingHorizontal: 14, paddingBottom: 30 }}>
        <TouchableOpacity style={[styles.action, styles.actionRouge]} onPress={deconnecter}>
          <Text style={styles.actionTexte}>🚪 {t('session.fermer', lg)}</Text>
        </TouchableOpacity>
      </View>
    </Page>
  );
}
