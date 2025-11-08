const MonthlyForecast = require('../models/ForecastModel');

exports.getForecastByUser = (req, res) => {
  const { user_id } = req.params;

  MonthlyForecast.getByUser(user_id, (err, results) => {
    if (err) {
      console.error('Forecast query error:', err);
      return res.status(500).json({ error: err.message });
    }

    // ✅ shape the result for the Recharts <LineChart>
    const formatted = results.map(row => ({
      month: row.month,
      actualMortality: row.actual_mortality,
      predictedMortality: row.predicted_mortality,
      predictedHarvest: row.harvest_mortality,
      actualHarvest: row.actual_harvest
    }));

    res.json(formatted);
  });
};
