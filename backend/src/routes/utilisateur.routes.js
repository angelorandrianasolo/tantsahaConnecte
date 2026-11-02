const express = require('express');
const router = express.Router();
const UtilisateurController = require('../controllers/utilisateur.controller');

router.get('/', UtilisateurController.lister);
router.get('/:id', UtilisateurController.obtenir);
router.post('/', UtilisateurController.creer);
router.put('/:id', UtilisateurController.modifier);
router.delete('/:id', UtilisateurController.supprimer);

module.exports = router;
