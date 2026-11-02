-- =========================================================
--  Tantsaha Connect — base de données (tout-en-un)
--  Exécution :
--  psql -U postgres -f db/tantsahaConnectDb.sql
-- =========================================================

-- 1) Création de la base ----------------------------------
DROP DATABASE IF EXISTS tantsaha_connect;
CREATE DATABASE tantsaha_connect;

\c tantsaha_connect

-- 2) Schéma -----------------------------------------------
CREATE TABLE utilisateurs (
    id            SERIAL PRIMARY KEY,
    nom           VARCHAR(100) NOT NULL,
    langue        VARCHAR(5)   DEFAULT 'MG',
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
    icone         VARCHAR(50),
    proba_pluie   INT,
    temp_min      NUMERIC(4,1),
    temp_max      NUMERIC(4,1),
    UNIQUE (date_prev)
);

CREATE TABLE conseils (
    id            SERIAL PRIMARY KEY,
    theme         VARCHAR(50),
    titre         VARCHAR(150),
    contenu       TEXT,
    fichier_audio VARCHAR(255)
);

-- 3) Jeu de données de test --------------------------------
INSERT INTO utilisateurs (nom, langue) VALUES ('Rakoto', 'MG'), ('Voahangy', 'MG');

INSERT INTO parcelles (utilisateur_id, nom, region) VALUES
  (1, 'Tanimbary A', 'Antsirabe'),
  (2, 'Kilalaky B',  'Toamasina');

INSERT INTO observations (parcelle_id, type, date_obs, valeur) VALUES
  (1, 'PLANTATION', '2026-01-15', 'Semis riz'),
  (1, 'PLUIE',      '2026-01-20', 'Pluie forte');

INSERT INTO alertes (type, priorite, message) VALUES
  ('SEMIS', 'URGENTE', 'Semis dans 3 jours');

INSERT INTO previsions_meteo (date_prev, icone, proba_pluie, temp_min, temp_max) VALUES
  (CURRENT_DATE,     'soleil', 10, 18.0, 30.0),
  (CURRENT_DATE + 1, 'nuage',  40, 19.0, 27.0),
  (CURRENT_DATE + 2, 'pluie',  80, 18.0, 24.0);

INSERT INTO conseils (theme, titre, contenu) VALUES
  ('PARASITES', 'Tisserand du riz', 'Vérifier les feuilles chaque semaine.');

-- Vérification ---------------------------------------------
SELECT 'utilisateurs' AS table, count(*) FROM utilisateurs
UNION ALL SELECT 'parcelles',        count(*) FROM parcelles
UNION ALL SELECT 'observations',     count(*) FROM observations
UNION ALL SELECT 'alertes',          count(*) FROM alertes
UNION ALL SELECT 'previsions_meteo', count(*) FROM previsions_meteo
UNION ALL SELECT 'conseils',         count(*) FROM conseils;
