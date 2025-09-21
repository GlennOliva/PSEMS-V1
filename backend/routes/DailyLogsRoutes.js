const express = require('express');
const router = express.Router();
const controller = require('../controllers/DailyLogsController');

// 🟢 Add a new daily log
router.post('/add_daily', controller.addDailyLog);

// 🟢 Get all daily logs
router.get('/', controller.getDailyLogs);

// 🟢 Get daily logs by user_id
router.get('/user_daily/:user_id', controller.getDailyLogsByUserId);

// 🟢 Get a single daily log by its ID
router.get('/:id', controller.getDailyLogById);

// 🟢 Update daily log by ID
router.put('/:id', controller.updateDailyLog);

// 🟢 Delete daily log by ID
router.delete('/:id', controller.deleteDailyLog);

module.exports = router;
