const Mortality = require('../models/MortalityDataModel');

// 📥 Get all Harvest records
exports.getMortalityByUser = (req, res) => {
  const { user_id } = req.params;
  Mortality.getByUser(user_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
});
};

