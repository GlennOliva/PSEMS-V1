const Harvest = require('../models/HarvestDataModel');

// 📥 Get all Harvest records
exports.getHarvestsByUser = (req, res) => {
  const { user_id } = req.params;
  Harvest.getByUser(user_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

