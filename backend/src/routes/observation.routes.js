const express = require('express');
const router = express.Router();
const ObservationController = require('../controllers/observation.controller');

router.get('/types', ObservationController.types);   // doit être avant /:id
router.get('/', ObservationController.lister);
router.get('/parcelle/:id', ObservationController.listerParcelle);
router.get('/:id', ObservationController.obtenir);
router.post('/', ObservationController.creer);
router.put('/:id', ObservationController.modifier);
router.delete('/:id', ObservationController.supprimer);

module.exports = router;
