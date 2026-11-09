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
    created_at    TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE alertes (
    id            SERIAL PRIMARY KEY,
    type          VARCHAR(30) NOT NULL,   -- SEMIS, RECOLTE, METEO, RAVAGEUR
    priorite      VARCHAR(20) DEFAULT 'NORMALE',
    message       VARCHAR(255),
    lue           BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP  DEFAULT NOW()
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
  (1, 'PLANTATION', '2026-01-15', 'Namonokana vary'),
  (1, 'PLUIE',      '2026-01-20', 'Orana mafy');

INSERT INTO alertes (type, priorite, message) VALUES
  ('SEMIS', 'URGENTE', 'Famonokana amin''ny 3 andro');

INSERT INTO previsions_meteo (date_prev, lieu, icone, proba_pluie, temp_min, temp_max) VALUES
  (CURRENT_DATE,     'Antsirabe', 'masoandro', 10, 18.0, 30.0),
  (CURRENT_DATE + 1, 'Antsirabe', 'mandravona', 40, 19.0, 27.0),
  (CURRENT_DATE + 2, 'Antsirabe', 'orana',      80, 18.0, 24.0);

INSERT INTO conseils (theme, titre, titre_fr, contenu, contenu_fr) VALUES
  ('PARASITES', 'Mpanala ao amin''ny vary', 'Chenille sur le riz',
   'Jereo ny ravina isan-kerinandro, ary esorin-dro izay eo misy.',
   'Inspectez les feuilles chaque semaine et retirez les feuilles atteintes.');

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
