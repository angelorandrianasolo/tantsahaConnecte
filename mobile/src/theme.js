/* ============================================================
   Thème mobile — MÊMES conventions que la version web :
     ROUGE = danger / VERT = favorable / JAUNE = prudence
   ============================================================ */
import { StyleSheet } from 'react-native';

export const couleurs = {
  rouge: '#d32f2f',
  rougeFonce: '#b71c1c',
  vert: '#2e7d32',
  vertFonce: '#1b5e20',
  jaune: '#f9a825',
  jauneFonce: '#c17900',

  fond: '#f6f1e7',
  carte: '#ffffff',
  texte: '#2b2b2b',
  textePale: '#6d6d6d',
  bord: '#e2d9c8',
};

export const rayon = 16;

export const styles = StyleSheet.create({
  // Bandeau d'état (réseau)
  bandeau: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bandeauTexte: { color: '#ffffff', fontWeight: '800', fontSize: 15 },
  pastille: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#ffffff', marginRight: 8,
  },

  // Page
  tetePage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  titrePage: { fontSize: 26, fontWeight: '800', color: couleurs.texte },
  lienRetour: { color: couleurs.vert, fontWeight: '800', fontSize: 18 },
  corps: { flex: 1 },

  // Carte
  carte: {
    backgroundColor: couleurs.carte,
    borderRadius: rayon,
    padding: 16,
    margin: 14,
    elevation: 3,                                   // ombre Android
    shadowColor: '#000',                            // ombre iOS
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  carteRouge: { borderLeftWidth: 10, borderLeftColor: couleurs.rouge },
  carteVert: { borderLeftWidth: 10, borderLeftColor: couleurs.vert },
  carteJaune: { borderLeftWidth: 10, borderLeftColor: couleurs.jaune },

  // Boutons géants (compréhensibles sans texte : icône + couleur)
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    gap: 12,
  },
  boutonGeant: {
    width: '47%',
    minHeight: 150,
    borderRadius: rayon,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
    backgroundColor: couleurs.carte,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  boutonGeantVert: { backgroundColor: couleurs.vert },
  boutonGeantRouge: { backgroundColor: couleurs.rouge },
  boutonGeantJaune: { backgroundColor: couleurs.jaune },
  boutonGeantTexte: { fontSize: 19, fontWeight: '800', color: couleurs.texte, textAlign: 'center' },
  boutonGeantTexteClair: { color: '#ffffff' },
  icone: { fontSize: 54 },

  // Boutons d'action
  action: {
    backgroundColor: couleurs.vert,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionRouge: { backgroundColor: couleurs.rouge },
  actionJaune: { backgroundColor: couleurs.jaune },
  actionTexte: { color: '#ffffff', fontWeight: '800', fontSize: 18 },

  // Divers
  chargement: { textAlign: 'center', padding: 40, color: couleurs.textePale },
  erreur: { color: couleurs.rouge, fontWeight: '800', padding: 12 },
  badge: {
    backgroundColor: couleurs.rouge,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeTexte: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
});
