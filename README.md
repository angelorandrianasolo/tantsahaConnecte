# 🌾 Tantsaha Connect

Application d'aide à la gestion des cultures pour les paysans malagasy
(projet IHM/ergonomie).

**Deux frontends, une seule logique :**

| Version | Dossier | Technologie |
|---|---|---|
| 🖥️ Web | `frontend/` | React 18 + Vite + React Router 6 |
| 📱 Mobile | `mobile/` | React Native + **Expo SDK 54** |
| ⚙️ Backend | `backend/` | Node.js MVC + Express + PostgreSQL |

Le web et le mobile partagent **la même API REST**, le même bilinguisme
(malagasy par défaut, français via `?lang=fr`), les mêmes couleurs
(🔴 danger / 🟢 favorable / 🟡 prudence) et la même logique métier.

## 🚀 Démarrage

```bash
# 1. Base de données (une seule fois)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f backend\db\tantsahaConnectDb.sql

# 2. Backend (port 3000) — sert aussi le build web
cd backend && npm install && npm start

# 3a. Frontend web en développement (port 5173, proxy vers 3000)
cd frontend && npm install && npm run dev

# 3b. Build web pour production (servi par le backend sur 3000)
cd frontend && npm run build

# 4. Mobile (Expo SDK 54)
cd mobile && npm install && npx expo start
```

## 📖 Documentation

- `backend/README.md` — les 50+ endpoints de l'API, enveloppes, variables d'env
- `docs/` — UML et schéma de la base
- `backend/db/tantsahaConnectDb.sql` — base en un seul fichier
  ⚠️ le recréer **efface les données**

## ✅ Tests

```bash
cd backend && npm test    # 38/38 smoke tests
```

## 🧭 Fonctionnalités

Météo réelle (Open-Meteo, multilieux), alertes automatiques, parcelles,
journal d'observations, conseils bilingues, tableau de bord, synchronisation
hors-ligne (`/sync`), audio malagasy (paramètres de synthèse vocale),
photos ≤ 500 Ko, session sans mot de passe (token).
