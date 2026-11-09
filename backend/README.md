# Tantsaha Connect — Backend (Node.js / Express / PostgreSQL)

Architecture **MVC** : `routes → controllers → services → models → PostgreSQL`.

## Démarrage

```bash
npm install
npm start          # http://localhost:3000
npm test           # test de non-régression (démarre le serveur sur :3101)
```

Base de données : `psql -U postgres -f db/tantsahaConnectDb.sql`
Connexion : user `root` sans mot de passe (mode trust), port `5432`, base `tantsaha_connect`.

## Ce que fait le serveur automatiquement

- **au démarrage + toutes les 6 h** : récupère la **vraie météo** (Open-Meteo) pour chaque région des utilisateurs, puis **génère les alertes** (semis, récolte, orage).
- en cas d'absence de réseau : **garde l'ancien cache** (jamais de perte).

## Endpoints

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/health` | état du serveur |
| **Utilisateurs** |
| GET/POST | `/utilisateurs` | liste / création |
| GET/PUT/DELETE | `/utilisateurs/:id` | lecture / modification / suppression |
| PUT | `/utilisateurs/:id/preferences` | région + latitude/longitude (pour la météo) |
| **Parcelles** |
| GET/POST | `/parcelles` | liste (avec propriétaire + culture) / création |
| GET/PUT/DELETE | `/parcelles/:id` | CRUD |
| **Cultures** |
| GET/POST | `/cultures` | liste (Vary, Maizy, Voanjo, Voatabia) / création |
| GET | `/cultures/:id/recolte-estimee?plantation=AAAA-MM-JJ` | date de récolte = plantation + cycle |
| GET/PUT/DELETE | `/cultures/:id` | CRUD |
| **Observations (journal)** |
| GET | `/observations` · `/observations/parcelle/:id` · `/observations/types` | listes |
| GET/POST/PUT/DELETE | `/observations[/:id]` | CRUD (type contrôlé, pas de date future) |
| **Alertes** |
| GET | `/alertes` · `/alertes/non-lues` · `/alertes/meta` | listes triées (urgentes d'abord) |
| POST | `/alertes/actualisation` | **génère les alertes automatiques** |
| PATCH | `/alertes/:id/lue` | marquer comme traitée |
| GET/POST/PUT/DELETE | `/alertes[/:id]` | CRUD |
| **Météo (réelle : Open-Meteo)** |
| POST | `/meteo/actualisation` `{latitude, longitude, lieu}` | rafraîchit une région |
| GET | `/meteo/prochains-jours?nb=3&lieu=Antsirabe` | 3 jours (limite 1–7) |
| GET | `/meteo/:date/favorable-semis?lieu=` | règle : orana ≥ 70 % et pas d'orage |
| GET | `/meteo/:date/resume-vocal?lieu=` | phrase malagasy prête à être lue |
| GET | `/meteo` · `/meteo/icones` | toutes les prévisions / icônes admises |
| GET/POST/DELETE | `/meteo[...]` | lecture / saisie manuelle / suppression |
| **Conseils** |
| GET | `/conseils` · `/conseils/themes` · `/conseils/theme/:theme` | listes |
| **Audio (voix pilotée par une fonction JS)** |
| GET | `/audio?texte=...&lang=mg\|fr&rapidite=0.9` | **paramètres** pour `SpeechSynthesisUtterance` |
| POST | `/audio` `{texte, langue, rapidite}` | idem (texte long) |
| GET | `/audio/langues` | langues admises (`mg`, `fr`) |
| GET | `/conseils/:id/audio?lang=fr&rapidite=` | paramètres de voix **du conseil** |
| GET | `/conseils/:id/fichier-audio` | fichier wav/mp3 pré-enregistré (optionnel) |
| GET | `/conseils/:id/version-vocale?lang=` | texte prêt pour la voix |
| GET/POST/PUT/DELETE | `/conseils[/:id]` | CRUD (contenu ≤ 300 caractères, FR + MG) |
| **Synchro hors ligne** |
| POST | `/sync/envoi` `{observations[], alertesLues[]}` | vide la file d'attente du téléphone (lots ≤ 50) |
| GET | `/sync/telechargement` | bundle pour le cache : alertes + 3 jours météo + conseils |
| **Tableau de bord** |
| GET | `/dashboard` | état du jour en **1 appel** (météo, alertes, dernière obs, parcelles) |

## Règles métier (issues du modèle UML)

1. Observation : type dans les 5 admis, parcelle existante, **date ≤ aujourd'hui**.
2. Météo favorable au semis : `proba_pluie ≥ 70 %` ET icône ∉ {oram-baratra, orage, varatra, rivotra}.
3. Récolte estimée : `plantation + duree_cycle_jours` (table `cultures`).
4. Alertes automatiques : récolte à J-3, semis quand la météo est favorable, urgence quand oram-baratra / ≥ 85 % d'orana — **avec anti-doublon**.
5. Synchro : un élément invalide n'annule jamais les autres du même lot.

## Conventions

- **Langue du projet : le malagasy** ; le site est **multilingue** : ajouter `?lang=fr`
  (ou `Accept-Language: fr`) traduit **les erreurs, les alertes vocales et les conseils**
  en français. Par défaut : malagasy.
- **Audio** : `GET /audio?texte=...` renvoie les paramètres que la fonction JS côté
  client doit lire — `{ texte, langue: "fr-FR", rapidite, tonalite, volume, dureeEstimeeSec }` :
  ```js
  const p = await (await fetch('/audio?texte=Salama&lang=mg')).json();
  const u = new SpeechSynthesisUtterance(p.texte);
  u.lang = p.langue; u.rate = p.rapidite; u.pitch = p.tonalite; u.volume = p.volume;
  speechSynthesis.speak(u);
  ```
- Couleurs (à respecter à l'IHM) : 🔴 rouge = danger/interdiction, 🟡 jaune = prudence, 🟢 vert = favorable.
- Dates répondues en `AAAA-MM-JJ` (pas d'horodatage décalé).
- Météo sortante : `https.get` IPv4 + 2 tentatives (fetch échoue sur ce réseau) ; 25 s max.
- Audio fichier : `backend/audio/conseil-<id>.wav` (voix générée, à remplacer par une voix malagasy type Google TTS).
