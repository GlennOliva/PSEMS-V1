const GrowthTracking = require('../models/GrowthTrackingModel');

// 📥 Get all growth tracking records
exports.getAllGrowth = (req, res) => {
  GrowthTracking.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📥 Get growth tracking records by User ID
exports.getGrowthByUserId = (req, res) => {
  const userId = req.params.user_id;

  GrowthTracking.getByUserId(userId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No growth tracking records found for this user' });
    }
    res.status(200).json(results);
  });
};

// 🔍 Get single growth tracking record by ID
exports.getGrowthById = (req, res) => {
  const id = req.params.id;

  GrowthTracking.getById(id, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Growth tracking record not found' });
    }
    res.status(200).json(result[0]);
  });
};

// ➕ Add growth tracking record
exports.addGrowth = (req, res) => {
  try {
    const { user_id, batch_id, date, age, total_weight, no_chicken, average_weight } = req.body;

    if (!user_id || !batch_id || !date) {
      return res.status(400).json({ error: 'user_id, batch_id, and date are required' });
    }

    const growthData = { user_id, batch_id, date, age, total_weight, no_chicken, average_weight };

    GrowthTracking.create(growthData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: 'Growth tracking record successfully created',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// ✏️ Update growth tracking record
exports.updateGrowth = (req, res) => {
  const id = req.params.id;
  const { batch_id, date, age, total_weight, no_chicken, average_weight } = req.body;

  if (!batch_id || !date) {
    return res.status(400).json({ error: 'batch_id and date are required' });
  }

  // Ensure the record exists
  GrowthTracking.getById(id, (err, growth) => {
    if (err) {
      console.error('Error fetching growth record:', err);
      return res.status(500).json({ error: 'Failed to fetch growth tracking record' });
    }

    if (growth.length === 0) {
      return res.status(404).json({ message: 'Growth tracking record not found' });
    }

    const updatedData = { batch_id, date, age, total_weight, no_chicken, average_weight };

    GrowthTracking.update(id, updatedData, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update growth tracking record' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Growth tracking record not found' });
      }

      res.json({ message: 'Growth tracking record updated successfully!' });
    });
  });
};

// ❌ Delete growth tracking record
exports.deleteGrowth = (req, res) => {
  const id = req.params.id;

  GrowthTracking.delete(id, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete growth tracking record' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Growth tracking record not found' });
    }

    res.json({ message: 'Growth tracking record deleted successfully!' });
  });
};
