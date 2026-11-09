-- =========================================================
--  Tantsaha Connect — base de données (tout-en-un)
--  Exécution :
--  psql -U postgres -f db/tantsahaConnectDb.sql
-- =========================================================

-- 1) Création de la base ----------------------------------
DROP DATABASE IF EXISTS tantsaha_connect WITH (FORCE);   -- ferme les connexions ouvertes
CREATE DATABASE tantsaha_connect;

\c tantsaha_connect

-- 2) Schéma -----------------------------------------------
CREATE TABLE utilisateurs (
    id            SERIAL PRIMARY KEY,
    nom           VARCHAR(100) NOT NULL,
    langue        VARCHAR(5)   DEFAULT 'MG',
    region        VARCHAR(100),                    -- préférence : lieu pour la météo
    latitude      NUMERIC(8,5),
    longitude     NUMERIC(8,5),
    created_at    TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE parcelles (
    id            SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id),
    nom           VARCHAR(100) NOT NULL,
    region        VARCHAR(100)
);

CREATE TABLE observations (
    id            SERIAL PRIMARY KEY,
    parcelle_id   INT REFERENCES parcelles(id),
    type          VARCHAR(30) NOT NULL,   -- PLUIE, RAVAGEUR, PLANTATION, RECOLTE
    date_obs      DATE        NOT NULL,
    valeur        VARCHAR(255),
    photo         TEXT,                   -- image en base64 (ravageur, feuille...)
    created_at    TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE alertes (
    id            SERIAL PRIMARY KEY,
    type          VARCHAR(30) NOT NULL,   -- SEMIS, RECOLTE, METEO, RAVAGEUR
    priorite      VARCHAR(20) DEFAULT 'NORMALE',
    message       VARCHAR(255),
    lue           BOOLEAN DEFAULT FALSE,   -- traitée (état AL2)
    created_at    TIMESTAMP  DEFAULT NOW()
);

-- Lecture D'UNE alerte PAR UN utilisateur ("vue" personnelles)
CREATE TABLE alertes_lues (
    alerte_id      INT REFERENCES alertes(id) ON DELETE CASCADE,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE CASCADE,
    created_at     TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (alerte_id, utilisateur_id)
);

-- Session : le téléphone garde son token en cache (pas de reconnexion)
CREATE TABLE sessions (
    token          VARCHAR(64) PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE previsions_meteo (
    id            SERIAL PRIMARY KEY,
    date_prev     DATE NOT NULL,
    lieu          VARCHAR(100) NOT NULL DEFAULT 'Antsirabe',  -- météo par région
    icone         VARCHAR(50),
    proba_pluie   INT,
    temp_min      NUMERIC(4,1),
    temp_max      NUMERIC(4,1),
    UNIQUE (date_prev, lieu)
);

CREATE TABLE conseils (
    id            SERIAL PRIMARY KEY,
    theme         VARCHAR(50),
    titre         VARCHAR(150),
    titre_fr      VARCHAR(150),
    contenu       TEXT,
    contenu_fr    TEXT,
    fichier_audio VARCHAR(255)
);

-- Cultures (cycle de vie : date de récolte = plantation + duree_cycle_jours)
CREATE TABLE cultures (
    id                SERIAL PRIMARY KEY,
    nom_mg            VARCHAR(100) NOT NULL,
    pictogramme       VARCHAR(20),
    duree_cycle_jours INT NOT NULL CHECK (duree_cycle_jours > 0)
);

ALTER TABLE parcelles ADD COLUMN culture_id INT REFERENCES cultures(id);

-- 3) Jeu de données de test --------------------------------
INSERT INTO utilisateurs (nom, langue, region, latitude, longitude) VALUES
  ('Rakoto', 'MG', 'Antsirabe', -19.8583, 47.5567),
  ('Voahangy', 'MG', 'Toamasina', -18.1500, 49.4000);

INSERT INTO parcelles (utilisateur_id, nom, region) VALUES
  (1, 'Tanimbary A', 'Antsirabe'),
  (2, 'Kilalaky B',  'Toamasina');

INSERT INTO observations (parcelle_id, type, date_obs, valeur) VALUES
  (1, 'PLANTATION', CURRENT_DATE - 105, 'Namonokana vary'),
  (1, 'PLUIE',      CURRENT_DATE - 98,  'Orana mafy'),
  (1, 'RAVAGEUR',   CURRENT_DATE - 40,  'Mpanala teo amin''ny ravina'),
  (2, 'PLANTATION', CURRENT_DATE - 88,  'Namonokana maizy'),
  (2, 'PLUIE',      CURRENT_DATE - 12,  'Orana 35 kalitiana'),
  (2, 'RECOLTE',    CURRENT_DATE - 5,   'Nivoaka 40 kilao');

INSERT INTO alertes (type, priorite, message) VALUES
  ('SEMIS', 'URGENTE', 'Famonokana amin''ny 3 andro');

INSERT INTO alertes (type, priorite, message) VALUES
  ('RAVAGEUR', 'URGENTE', 'Mpanala ao amin''ny Tanimbary A'),
  ('RECOLTE',  'NORMALE', 'Famokarana maizy eo ho eo');

INSERT INTO previsions_meteo (date_prev, lieu, icone, proba_pluie, temp_min, temp_max) VALUES
  (CURRENT_DATE,     'Antsirabe', 'masoandro', 10, 18.0, 30.0),
  (CURRENT_DATE + 1, 'Antsirabe', 'mandravona', 40, 19.0, 27.0),
  (CURRENT_DATE + 2, 'Antsirabe', 'orana',      80, 18.0, 24.0);

INSERT INTO conseils (theme, titre, titre_fr, contenu, contenu_fr) VALUES
  ('PARASITES', 'Mpanala ao amin''ny vary', 'Chenille sur le riz',
   'Jereo ny ravina isan-kerinandro, ary esorin-dro izay eo misy.',
   'Inspectez les feuilles chaque semaine et retirez les feuilles atteintes.'),
  ('PARASITES', 'Ovy malaza eo amin''ny voanjo', 'Mouche blanche du haricot',
   'Aseho ny tongony mafana, ka ny feno eo amin''ny tany no harena.',
   'Plantez en saison sèche et paillez le sol pour limiter les mouches.'),
  ('IRRIGATION', 'Fandraisana rano mahavelona', 'Apport d''eau vital',
   'Omeo ny rano isan-karazany amin''ny maraina vao masoandro mafana.',
   'Arrosez tôt le matin avant les fortes chaleurs.'),
  ('IRRIGATION', 'Fandraisana rano amin''ny ranomasina', 'Arrosage goutte à goutte',
   'Ireo karazana tongotra kely no ampiasaina mba hioreny ny rano.',
   'Utilisez de petits procédés pour économiser l’eau.'),
  ('SEMIS', 'Fotoana mety hamono', 'Période favorable au semis',
   'Jereo ny orana 70 kalitiana ambanin''ny masoandro madinika.',
   'Visez 70 % de pluie sous un ciel couvert.'),
  ('SEMIS', 'Fototra hanombohana', 'Préparation des semis',
   'Feno tsara ny tany aloha, ary atao eo anoloana ny lovia.',
   'Bêchez bien la terre avant de mettre en pépinière.'),
  ('RECOLTE', 'Fotoana hamokarana', 'Période de récolte',
   'Omeo andro mamy fa tsy orana mafy rehefa mamoaka.',
   'Choisissez une journée sèche pour moissonner.'),
  ('RECOLTE', 'Fitehirizana ny vokatra', 'Conservation de la récolte',
   'Atao eo amin''ny maimaim-poana sy masoandro ny vary vao voavidy.',
   'Séchez le riz au soleil et stockez-le au sec.'),
  ('MALADIES', 'Ravina maitso mivoaka', 'Feuille tachetée',
   'Esoriny ny ravina voafantatra, ary aza asehony akaiky ny harena.',
   'Retirez les feuilles touchées et ne les laissez pas près des plants.'),
  ('MALADIES', 'Fitsimbohana eo amin''ny hazo', 'Champignons du fruit',
   'Aseho ny tongony mafana ka ny feno eo amin''ny tany no harena.',
   'Aérez la parcelle et évitez l’humidité stagnante.');

INSERT INTO cultures (nom_mg, pictogramme, duree_cycle_jours) VALUES
  ('Vary',     U&'\+0001F33E', 120),
  ('Maizy',    U&'\+0001F33D', 90),
  ('Voanjo',   U&'\+0001FAD8', 60),
  ('Voatabia', U&'\+0001F360', 120);

UPDATE parcelles SET culture_id = 1 WHERE id = 1;
UPDATE parcelles SET culture_id = 2 WHERE id = 2;

-- Vérification ---------------------------------------------
SELECT 'utilisateurs' AS table, count(*) FROM utilisateurs
UNION ALL SELECT 'parcelles',        count(*) FROM parcelles
UNION ALL SELECT 'observations',     count(*) FROM observations
UNION ALL SELECT 'alertes',          count(*) FROM alertes
UNION ALL SELECT 'previsions_meteo', count(*) FROM previsions_meteo
UNION ALL SELECT 'conseils',         count(*) FROM conseils;
