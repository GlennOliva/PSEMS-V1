const express = require('express');
const router = express.Router();
const controller = require('../controllers/BatchController');

// 📥 Get all batches
router.get('/', controller.getAllBatches);

// ✅ Get batches by user ID FIRST
router.get('/user/:user_id', controller.getBatchesByUserId);

// ✅ then single batch by id
router.get('/:id', controller.getBatchById);


// ➕ Add batch
router.post('/add', controller.addBatch);

// ✏️ Update batch
router.put('/:id', controller.updateBatch);

// ❌ Delete batch
router.delete('/:id', controller.deleteBatch);

router.get('/:id/harvest-limit', controller.getHarvestLimit);


module.exports = router;
