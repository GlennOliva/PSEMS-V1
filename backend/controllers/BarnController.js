const Barn = require('../models/BarnModel');


// ✅ GET /api/barn/availability/by-batch/:batchId
exports.getAvailabilityByBatchId = (req, res) => {
  const batchId = parseInt(req.params.batchId, 10);

  if (!batchId || batchId <= 0) {
    return res.status(400).json({ error: 'Invalid batchId' });
  }

  // 1) Find barn_id from batchId
  Barn.getBarnIdByBatchId(batchId, (err, barnId) => {
    if (err) {
      console.error('Database error (getBarnIdByBatchId):', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!barnId) {
      return res.status(404).json({ message: 'Batch not found or has no barn assigned' });
    }

    // 2) Get barn info
    Barn.getById(barnId, (err, barnRows) => {
      if (err) {
        console.error('Database error (getById):', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!barnRows || barnRows.length === 0) {
        return res.status(404).json({ message: 'Barn not found' });
      }

      const barn = barnRows[0];

      // 3) Count total vs harvested batches in that barn
      Barn.getBatchCountsByBarnId(barnId, (err, countRows) => {
        if (err) {
          console.error('Database error (getBatchCountsByBarnId):', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        const totalBatches = Number(countRows?.[0]?.total_batches || 0);
        const harvestedBatches = Number(countRows?.[0]?.harvested_batches || 0);

        // ✅ Available when all batches in barn are harvested
        // If barn has 0 batches, treat as available (you can change this if you want)
        const available = totalBatches === 0 ? true : harvestedBatches >= totalBatches;

        // 4) Optional: update barn status in tbl_barn
        // Assumes tbl_barn has a column named `status` and values 'Available' / 'Occupied'
        const newStatus = available ? 'Available' : 'Occupied';

        Barn.updateStatus(barnId, newStatus, (updateErr) => {
          if (updateErr) {
            console.error('Database error (updateStatus):', updateErr);
            // Don’t fail the request if status update fails — still return availability
          }

          return res.status(200).json({
            barn_id: barn.id,
            barn_name: barn.barn_name,
            available,
            total_batches: totalBatches,
            harvested_batches: harvestedBatches,
          });
        });
      });
    });
  });
};

// 📥 Get all Barns
exports.getBarns = (req, res) => {
  Barn.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📥 Get Barns by User ID
exports.getBarnsByUserId = (req, res) => {
  const userId = req.params.user_id;

  Barn.getByUserId(userId, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No barns found for this user' });
    }

    res.status(200).json(results);
  });
};


// 🔍 Get Barn by ID
exports.getBarnById = (req, res) => {
  const barnId = req.params.id;

  Barn.getById(barnId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Barn not found' });
    }

    res.status(200).json(result[0]);
  });
};

// ➕ Add Barn
exports.addBarn = (req, res) => {
  try {
    const { user_id, barn_name, description, date } = req.body;

    if (!user_id || !barn_name || !description || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const barnData = { user_id, barn_name, description, date };

    Barn.create(barnData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: 'Barn successfully created',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// ✏️ Update Barn
exports.updateBarn = (req, res) => {
  const id = req.params.id;
  const { barn_name, description, date } = req.body;

  if (!barn_name || !description || !date) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  // Fetch barn to ensure it exists
  Barn.getById(id, (err, barn) => {
    if (err) {
      console.error('Error fetching barn:', err);
      return res.status(500).json({ error: 'Failed to fetch barn' });
    }

    if (barn.length === 0) {
      return res.status(404).json({ message: 'Barn not found' });
    }

    const updatedData = { barn_name, description, date };

    Barn.update(id, updatedData, (err, result) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: 'Failed to update barn' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Barn not found' });
      }

      res.json({ message: 'Barn updated successfully!' });
    });
  });
};

// ❌ Delete Barn
exports.deleteBarn = (req, res) => {
  const id = req.params.id;

  Barn.delete(id, (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete barn' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Barn not found' });
    }

    res.json({ message: 'Barn deleted successfully!' });
  });
};
