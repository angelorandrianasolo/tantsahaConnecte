const express = require('express');
const router = express.Router();
const AudioController = require('../controllers/audio.controller');

router.get('/langues', AudioController.langues);  // avant / (métadonnées)
router.get('/', AudioController.lire);
router.post('/', AudioController.lirePost);

module.exports = router;
