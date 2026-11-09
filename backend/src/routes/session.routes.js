const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/session.controller');

router.post('/', SessionController.ouvrir);       // connexion : {utilisateur_id}
router.get('/', SessionController.identifier);    // qui suis-je ?
router.delete('/', SessionController.fermer);     // déconnexion

module.exports = router;
