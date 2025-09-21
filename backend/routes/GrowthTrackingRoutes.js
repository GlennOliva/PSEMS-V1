const express = require('express');
const router = express.Router();
const controller = require('../controllers/GrowthTrackingController');

// 🟢 Add a new growth record
router.post('/add_growth', controller.addGrowth);

// 🟢 Get all growth records
router.get('/', controller.getAllGrowth);

// 🟢 Get growth records by user_id
router.get('/user_growth/:user_id', controller.getGrowthByUserId);

// 🟢 Get a single growth record by its ID
router.get('/:id', controller.getGrowthById);

// 🟢 Update growth record by ID
router.put('/:id', controller.updateGrowth);

// 🟢 Delete growth record by ID
router.delete('/:id', controller.deleteGrowth);

module.exports = router;
