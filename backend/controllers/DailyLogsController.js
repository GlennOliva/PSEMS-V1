const DailyLog = require('../models/DailyLogsModel');

// 📥 Get all daily logs
exports.getDailyLogs = (req, res) => {
  DailyLog.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📥 Get daily logs by User ID
exports.getDailyLogsByUserId = (req, res) => {
  const userId = req.params.user_id;

  DailyLog.getByUserId(userId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'No daily logs found for this user' });
    }
    res.status(200).json(results);
  });
};

// 🔍 Get single daily log by ID
exports.getDailyLogById = (req, res) => {
  const id = req.params.id;

  DailyLog.getById(id, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Daily log not found' });
    }
    res.status(200).json(result[0]);
  });
};

// ➕ Add daily log
exports.addDailyLog = (req, res) => {
  try {
    const { user_id, batch_id, mortality_id, date, feed } = req.body;

    if (!user_id || !mortality_id || !date) {
      return res.status(400).json({ error: 'user_id, mortality_id, and date are required' });
    }

    const dailyLogData = { user_id,batch_id, mortality_id, date, feed };

    DailyLog.create(dailyLogData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: 'Daily log successfully created',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// ✏️ Update daily log
exports.updateDailyLog = (req, res) => {
  const id = req.params.id;
  const { mortality_id, batch_id, date, feed } = req.body;

  if (!mortality_id || !date) {
    return res.status(400).json({ error: 'mortality_id and date are required' });
  }

  // Ensure the record exists
  DailyLog.getById(id, (err, dailyLog) => {
    if (err) {
      console.error('Error fetching daily log:', err);
      return res.status(500).json({ error: 'Failed to fetch daily log' });
    }

    if (dailyLog.length === 0) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    const updatedData = { mortality_id, batch_id, date, feed };

    DailyLog.update(id, updatedData, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update daily log' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Daily log not found' });
      }

      res.json({ message: 'Daily log updated successfully!' });
    });
  });
};

// ❌ Delete daily log
exports.deleteDailyLog = (req, res) => {
  const id = req.params.id;

  DailyLog.delete(id, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete daily log' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Daily log not found' });
    }

    res.json({ message: 'Daily log deleted successfully!' });
  });
};
