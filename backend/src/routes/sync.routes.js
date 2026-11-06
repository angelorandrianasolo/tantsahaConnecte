const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/sync.controller');

router.post('/envoi', SyncController.envoyer);            // téléphone → serveur
router.get('/telechargement', SyncController.telecharger); // téléphone ← serveur

module.exports = router;
