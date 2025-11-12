const express = require('express');
const router = express.Router();
const controller = require('../controllers/ForecastController');

router.get('/', controller.getForecastByUser);


module.exports = router;
