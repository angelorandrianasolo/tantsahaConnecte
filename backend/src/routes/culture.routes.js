const express = require('express');
const router = express.Router();
const CultureController = require('../controllers/culture.controller');

router.get('/', CultureController.lister);
router.get('/:id/recolte-estimee', CultureController.dateRecolte);
router.get('/:id', CultureController.obtenir);
router.post('/', CultureController.creer);
router.put('/:id', CultureController.modifier);
router.delete('/:id', CultureController.supprimer);

module.exports = router;
