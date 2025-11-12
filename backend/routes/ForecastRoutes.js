const express = require('express');
const router = express.Router();
const controller = require('../controllers/ForecastController');

// ✅ No user_id required
router.get('/', controller.getForecast);

module.exports = router;
