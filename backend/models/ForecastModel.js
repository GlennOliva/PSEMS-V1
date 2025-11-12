const db = require('../config/db'); // mysql2 connection pool

// 🔹 Get all forecast rows (no user_id filter)
exports.getAll = (callback) => {
  const sql = `
    SELECT
      id,
      batch_id,
      DATE_FORMAT(date, '%Y-%m-%d') AS month,   -- format as "YYYY-MM-DD"
      actual_mortality,
      predicted_mortality,
      harvest_mortality,
      actual_harvest
    FROM tbl_forecast
    ORDER BY date ASC
  `;
  db.query(sql, callback);
};
