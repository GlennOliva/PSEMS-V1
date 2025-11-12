const MonthlyForecast = require('../models/ForecastModel');

exports.getForecast = (req, res) => {
  MonthlyForecast.getAll((err, results) => {
    if (err) {
      console.error('Forecast query error:', err);
      return res.status(500).json({ error: err.message });
    }

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
