const express = require('express');
const router = express.Router();
const ConseilController = require('../controllers/conseil.controller');

router.get('/themes', ConseilController.themes);          // avant /:id
router.get('/theme/:theme', ConseilController.listerTheme);
router.get('/', ConseilController.lister);
router.get('/:id/version-vocale', ConseilController.versionVocale);
router.get('/:id', ConseilController.obtenir);
router.post('/', ConseilController.creer);
router.put('/:id', ConseilController.modifier);
router.delete('/:id', ConseilController.supprimer);

module.exports = router;
