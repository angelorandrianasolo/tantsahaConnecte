const express = require('express');
const router = express.Router();
const MeteoController = require('../controllers/meteo.controller');

router.get('/icones', MeteoController.icones);            // avant /:date
router.get('/prochains-jours', MeteoController.prochainsJours);
router.get('/', MeteoController.lister);
router.get('/:date/favorable-semis', MeteoController.estFavorable);
router.get('/:date/resume-vocal', MeteoController.resumeVocal);
router.get('/:date', MeteoController.obtenirParDate);
router.post('/', MeteoController.ajouter);
router.delete('/:id', MeteoController.supprimer);

module.exports = router;
