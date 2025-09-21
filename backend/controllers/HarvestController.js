const Harvest = require('../models/HarvestModel');

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

// ➕ Add Harvest
exports.addHarvest = (req, res) => {
  try {
    const { user_id, batch_id, date, no_harvest, no_boxes } = req.body;

    if (!user_id || !batch_id || !date || !no_harvest || !no_boxes) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const harvestData = { user_id, batch_id, date, no_harvest, no_boxes };

    Harvest.create(harvestData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: 'Harvest record successfully created',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// ✏️ Update Harvest
exports.updateHarvest = (req, res) => {
  const id = req.params.id;
  const { batch_id, date, no_harvest, no_boxes } = req.body;

  if (!batch_id || !date || !no_harvest || !no_boxes) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Ensure the record exists
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

      res.json({ message: 'Harvest record updated successfully!' });
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
