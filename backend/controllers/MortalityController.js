const Mortality = require('../models/MortalityModel');

// 📥 Get all mortality records
exports.getMortalities = (req, res) => {
  Mortality.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📥 Get mortality records by User ID
exports.getMortalitiesByUserId = (req, res) => {
  const userId = req.params.user_id;

  Mortality.getByUserId(userId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No mortality records found for this user' });
    }
    res.status(200).json(results);
  });
};

// 🔍 Get single mortality by ID
exports.getMortalityById = (req, res) => {
  const mortalityId = req.params.id;

  Mortality.getById(mortalityId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Mortality record not found' });
    }
    res.status(200).json(result[0]);
  });
};

// ➕ Add mortality record
exports.addMortality = (req, res) => {
  try {
    const { user_id, barn_id, cause, date, notes, quantity } = req.body;

    if (!user_id || !barn_id || !cause || !date) {
      return res.status(400).json({ error: 'user_id, barn_id, cause, and date are required' });
    }

    const mortalityData = { user_id, barn_id, cause, date, notes, quantity };

    Mortality.create(mortalityData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: 'Mortality record successfully created',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// ✏️ Update mortality record
exports.updateMortality = (req, res) => {
  const id = req.params.id;
  const { barn_id, cause, date, notes, quantity } = req.body;

  if (!barn_id || !cause || !date) {
    return res.status(400).json({ error: 'barn_id, cause, and date are required' });
  }

  // Ensure the record exists
  Mortality.getById(id, (err, mortality) => {
    if (err) {
      console.error('Error fetching mortality:', err);
      return res.status(500).json({ error: 'Failed to fetch mortality record' });
    }

    if (mortality.length === 0) {
      return res.status(404).json({ message: 'Mortality record not found' });
    }

    const updatedData = { barn_id, cause, date, notes, quantity };

    Mortality.update(id, updatedData, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update mortality record' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Mortality record not found' });
      }

      res.json({ message: 'Mortality record updated successfully!' });
    });
  });
};

// ❌ Delete mortality record
exports.deleteMortality = (req, res) => {
  const id = req.params.id;

  Mortality.delete(id, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete mortality record' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mortality record not found' });
    }

    res.json({ message: 'Mortality record deleted successfully!' });
  });
};
