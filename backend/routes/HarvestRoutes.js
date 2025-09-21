const express = require('express');
const router = express.Router();
const controller = require('../controllers/HarvestController');

// 🟢 Add a new harvest record
router.post('/add_harvest', controller.addHarvest);

// 🟢 Get all harvest records
router.get('/', controller.getHarvests);

// 🟢 Get harvest records by user_id
router.get('/user_harvest/:user_id', controller.getHarvestsByUserId);

// 🟢 Get a single harvest record by its ID
router.get('/:id', controller.getHarvestById);

// 🟢 Update harvest record by ID
router.put('/:id', controller.updateHarvest);

// 🟢 Delete harvest record by ID
router.delete('/:id', controller.deleteHarvest);

module.exports = router;
