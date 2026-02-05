const express = require('express');
const router = express.Router();
const controller = require('../controllers/BarnController');

// 🟢 Add a new barn
router.post('/add_barn', controller.addBarn);

// 🟢 Get all barns
router.get('/', controller.getBarns);

// 🟢 Get barns by user_id
router.get('/user_barn/:user_id', controller.getBarnsByUserId);

// 🟢 Get a single barn by its ID
router.get('/:id', controller.getBarnById);

// 🟢 Update barn by ID
router.put('/:id', controller.updateBarn);

// 🟢 Delete barn by ID
router.delete('/:id', controller.deleteBarn);

router.get('/availability/by-batch/:batchId', controller.getAvailabilityByBatchId);

module.exports = router;
