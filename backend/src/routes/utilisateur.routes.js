const express = require('express');
const router = express.Router();
const UtilisateurController = require('../controllers/utilisateur.controller');

router.get('/', UtilisateurController.lister);
// préférences = données personnelles : session obligatoire (et le bon compte)
router.put('/:id/preferences',
  require('../middlewares/session').requis,
  UtilisateurController.preferences); // avant /:id
router.get('/:id', UtilisateurController.obtenir);
router.post('/', UtilisateurController.creer);
router.put('/:id', UtilisateurController.modifier);
router.delete('/:id', UtilisateurController.supprimer);

module.exports = router;
