const Harvest = require('../models/HarvestModel');
const Batch = require('../models/BatchModel'); // ✅ ADD THIS

// 📥 Get all Harvest records
exports.getHarvests = (req, res) => {
  Harvest.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📥 Get Harvest records by User ID
exports.getHarvestsByUserId = (req, res) => {
  const userId = req.params.user_id;

  Harvest.getByUserId(userId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No harvests found for this user' });
    }
    res.status(200).json(results);
  });
};

// 🔍 Get single Harvest by ID
exports.getHarvestById = (req, res) => {
  const harvestId = req.params.id;

  Harvest.getById(harvestId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Harvest record not found' });
    }
    res.status(200).json(result[0]);
  });
};

// ➕ Add Harvest  ✅ ALSO mark batch completed
exports.addHarvest = (req, res) => {
  try {
    const { user_id, batch_id, date, no_harvest, no_boxes } = req.body;

    // ✅ allow 0 values by checking null/undefined
    if (user_id == null || batch_id == null || !date || no_harvest == null || no_boxes == null) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const harvestData = { user_id, batch_id, date, no_harvest, no_boxes };

    Harvest.create(harvestData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }

      // ✅ after harvest saved → auto complete the selected batch
      Batch.markCompleted(batch_id, date, (err2, upd) => {
        if (err2) {
          console.error('Batch completion update failed:', err2);
          // You can decide: still return success, or fail.
          // I recommend failing so you notice the issue early:
          return res.status(500).json({
            error: 'Harvest saved but failed to mark batch completed',
            details: err2,
          });
        }

        return res.status(201).json({
          message: 'Harvest record successfully created and batch marked Completed',
          id: result.insertId,
          batch_completed: true,
          batch_id: Number(batch_id),
          date_completed: date,
        });
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// ✏️ Update Harvest  ✅ keep batch completed (recommended)
exports.updateHarvest = (req, res) => {
  const id = req.params.id;
  const { batch_id, date, no_harvest, no_boxes } = req.body;

  if (batch_id == null || !date || no_harvest == null || no_boxes == null) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  Harvest.getById(id, (err, harvest) => {
    if (err) {
      console.error('Error fetching harvest:', err);
      return res.status(500).json({ error: 'Failed to fetch harvest' });
    }

    if (harvest.length === 0) {
      return res.status(404).json({ message: 'Harvest record not found' });
    }

    const updatedData = { batch_id, date, no_harvest, no_boxes };

    Harvest.update(id, updatedData, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update harvest' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Harvest record not found' });
      }

      // ✅ Ensure batch remains completed with date
      Batch.markCompleted(batch_id, date, (err2) => {
        if (err2) {
          console.error('Batch completion update failed:', err2);
          return res.status(500).json({
            error: 'Harvest updated but failed to mark batch completed',
            details: err2,
          });
        }

        return res.json({ message: 'Harvest record updated successfully and batch marked Completed!' });
      });
    });
  });
};

// ❌ Delete Harvest
exports.deleteHarvest = (req, res) => {
  const id = req.params.id;

  Harvest.delete(id, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete harvest' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Harvest record not found' });
    }

    res.json({ message: 'Harvest record deleted successfully!' });
  });
};
