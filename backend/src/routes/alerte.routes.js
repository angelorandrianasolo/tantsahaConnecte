const express = require('express');
const router = express.Router();
const AlerteController = require('../controllers/alerte.controller');

router.get('/meta', AlerteController.metadonnees);    // avant /:id
router.get('/non-lues', AlerteController.listerNonLues);
router.get('/', AlerteController.lister);
router.get('/:id', AlerteController.obtenir);
router.post('/', AlerteController.creer);
router.put('/:id', AlerteController.modifier);
router.patch('/:id/lue', AlerteController.marquerLue);
router.delete('/:id', AlerteController.supprimer);

module.exports = router;
