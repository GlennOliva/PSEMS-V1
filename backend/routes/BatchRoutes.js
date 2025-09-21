const express = require('express');
const router = express.Router();
const controller = require('../controllers/BatchController');

// 📥 Get all batches
router.get('/', controller.getAllBatches);

// 📥 Get batch by ID
router.get('/:id', controller.getBatchById);

// 📥 Get batches by user ID
router.get('/user/:user_id', controller.getBatchesByUserId);

// ➕ Add batch
router.post('/add', controller.addBatch);

// ✏️ Update batch
router.put('/:id', controller.updateBatch);

// ❌ Delete batch
router.delete('/:id', controller.deleteBatch);

module.exports = router;
