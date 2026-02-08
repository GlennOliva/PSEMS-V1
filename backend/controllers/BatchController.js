const Batch = require('../models/BatchModel');
const Harvest = require('../models/HarvestModel');
const Mortality = require('../models/MortalityModel');


// 📥 Get all Batches
exports.getAllBatches = (req, res) => {
  Batch.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📥 Get Batches by User ID
exports.getBatchesByUserId = (req, res) => {
  const userId = req.params.user_id;

  Batch.getByUserId(userId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No batches found for this user' });
    }

    res.status(200).json(results);
  });
};

// 🔍 Get Batch by ID
exports.getBatchById = (req, res) => {
  const batchId = req.params.id;

  Batch.getById(batchId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json(result[0]);
  });
};

// ➕ Add Batch
exports.addBatch = (req, res) => {
  try {
    const {
      user_id,
      barn_id,
      batch_name,
      breed,
      no_chicken,
      date_started,
      date_completed,
      status,
    } = req.body;

    if (!user_id || !barn_id || !batch_name || !breed || !no_chicken || !date_started || !status) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const batchData = {
      user_id,
      barn_id,
      batch_name,
      breed,
      no_chicken,
      date_started,
      date_completed: date_completed || null,
      status,
    };

    Batch.create(batchData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: 'Batch successfully created',
        id: result.insertId,
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// ✏️ Update Batch
exports.updateBatch = (req, res) => {
  const id = req.params.id;
  const {
    barn_id,
    batch_name,
    breed,
    no_chicken,
    date_started,
    date_completed,
    status,
  } = req.body;

  if (!barn_id || !batch_name || !breed || !no_chicken || !date_started || !status) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Fetch batch to ensure it exists
  Batch.getById(id, (err, batch) => {
    if (err) {
      console.error('Error fetching batch:', err);
      return res.status(500).json({ error: 'Failed to fetch batch' });
    }

    if (batch.length === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const updatedData = {
      barn_id,
      batch_name,
      breed,
      no_chicken,
      date_started,
      date_completed: date_completed || null,
      status,
    };

    Batch.update(id, updatedData, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update batch' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Batch not found' });
      }

      res.json({ message: 'Batch updated successfully!' });
    });
  });
};

// ❌ Delete Batch
exports.deleteBatch = (req, res) => {
  const id = req.params.id;

  Batch.delete(id, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete batch' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.json({ message: 'Batch deleted successfully!' });
  });
};



exports.getHarvestLimit = (req, res) => {
  const batchId = req.params.id;
  const today = (req.query.date || new Date().toISOString().split('T')[0]);
  const excludeHarvestId = req.query.excludeHarvestId ? Number(req.query.excludeHarvestId) : null;

  Batch.getById(batchId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch batch' });
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Batch not found' });

    const batch = rows[0];

    const baseChickens = Number(batch.no_chicken) || 0;
    const barnId = Number(batch.barn_id);
    const startDate = batch.date_started;
    const endDate = today;

    Mortality.sumByBarnInRange(barnId, startDate, endDate, (err2, mortalityTotal) => {
      if (err2) return res.status(500).json({ error: 'Failed to compute mortality total' });

      Harvest.sumByBatchInRange(batchId, startDate, endDate, excludeHarvestId, (err3, harvestedTotal) => {
        if (err3) return res.status(500).json({ error: 'Failed to compute harvested total' });

        const available = Math.max(0, baseChickens - mortalityTotal - harvestedTotal);

        return res.json({
          batch_id: Number(batchId),
          batch_name: batch.batch_name,
          barn_id: barnId,
          baseChickens,
          mortalityTotal,
          harvestedTotal,
          available,
          startDate,
          endDate,
        });
      });
    });
  });
};


