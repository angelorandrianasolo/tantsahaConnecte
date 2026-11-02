# Tantsaha Connect — Conception UML

Conception complète de l'application d'aide à la gestion des cultures pour les paysans malagasy.
Les diagrammes sont écrits en **PlantUML** (fichiers `.puml` dans ce dossier) : ils se rendent directement dans VS Code (extension *PlantUML*), sur [plantuml.com/plantuml](https://www.plantuml.com/plantuml) ou via la CLI.

## Catalogue des diagrammes

| # | Fichier | Type d'UML | Objectif |
|---|---------|-----------|----------|
| 1 | `01_usecase.puml` | **Diagramme de cas d'utilisation** | Qui fait quoi : 4 fonctions principales + extensions audio + acteurs externes (météo, serveur de contenu) |
| 2 | `02_classes.puml` | **Diagramme de classes** | Structure des données : `Parcelle`, `Culture` (sous-classes Riz/Maïs/…), `Observation`, `Alerte`, `PrevisionMeteo`, `Conseil`, + infrastructure offline (`BaseLocale`, `Synchronisateur`, `ServiceAudio`) |
| 3 | `03_sequence_meteo.puml` | **Diagramme de séquence** | Scénario 1 : consulter la météo avant de semer (mode hors ligne, lecture audio malagasy) |
| 4 | `04_sequence_semis.puml` | **Diagramme de séquence** | Scénario 2 : saisir une date de plantation (choix par icônes, validation vocale, file de synchronisation) |
| 5 | `05_activite_sync.puml` | **Diagramme d'activité** | Le cœur technique du projet : mode offline permanent, *store & forward*, synchronisation opportuniste |
| 6 | `06_etats.puml` | **Diagramme d'états** | Cycle de vie d'une observation (brouillon → enregistrée → sync) et d'une alerte (non lue → traitée → expirée) |

## Acteurs et responsabilités

```
Paysan (utilisateur)  →  interface pictogrammes + audio malagasy
Système météo         →  acteur externe, données pré-téléchargées / SMS
Serveur de contenu    →  conseils et calendrier agricole, téléchargés par lot
```

## Décisions de conception issues du diagnostic utilisateur

| Contrainte terrain | Décision UML |
|---|---|
| Peu ou pas d'alphabetisation | Chaque classe porteur d'information (`Alerte`, `Conseil`, `PrevisionMeteo`) possède une **version audio** (`annoncerVocalement()`, `resumeVocal()`) |
| Internet quasi absent | `BaseLocale` est la source de vérité primaire ; `Synchronisateur` est **asynchrone et non bloquant** (diagramme 5) |
| Rouge = danger (convention malagasy) | `Alerte.priorite` et `Pictogramme.couleurConvention()` portent la sémantique couleur dans le modèle |
| Non-familiers des icônes complexes | `Pictogramme` est un **objet métier** (code + image + légende + couleur), pas un simple champ décoratif |
| Smartphones basiques | `Observation.source` accepte `ImportSMS` : saisie possible par SMS pour les téléphones non tactiles |
| Peu de mémoire de lecture | `Conseil.contenuCourt` : pas de texte long dans le modèle, format contraint |

## Règles métier modélisées

1. **Validation d'observation** : `dateSaisie ≤ aujourd'hui` (voir garde `AV → LOCAL/KO`, diagramme 6).
2. **Alertes** : générées par `CalendrierAgricole.alertesJour(date)` ∪ `PrevisionMeteo.estFavorableSemis()` ; jamais plus de 4 à l'écran (concision).
3. **Cycle culture** : `dateRecolteEstimee(date) = dateSemis + dureeCycleJours` (permet les rappels semis/récolte sans saisie utilisateur).
4. **Hors ligne** : toute écriture est locale ; le réseau ne fait que vider la file et rafraîchir le cache.

## Étapes suivantes (proposées)

1. **Diagrammes de déploiement** (architecture Android/PWA + cache local) si besoin.
2. **Wireframes basse fidélité** des 5 écrans (Accueil, Alertes, Météo, Journal, Conseils).
3. **Prototype cliquable** (HTML/CSS/JS statique, 100 % hors ligne) — directement réalisable dans ce dépôt.
