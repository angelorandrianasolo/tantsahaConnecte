const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');

router.get('/', DashboardController.obtenir);

module.exports = router;
