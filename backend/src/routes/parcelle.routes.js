const express = require('express');
const router = express.Router();
const ParcelleController = require('../controllers/parcelle.controller');

router.get('/', ParcelleController.lister);
router.get('/:id', ParcelleController.obtenir);
router.post('/', ParcelleController.creer);
router.put('/:id', ParcelleController.modifier);
router.delete('/:id', ParcelleController.supprimer);

module.exports = router;
