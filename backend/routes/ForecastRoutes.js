const express = require('express');
const router = express.Router();
const controller = require('../controllers/ForecastController');

// ✅ GET /api/monthly_forecast/:user_id
router.get('/:user_id', controller.getForecastByUser);

module.exports = router;
