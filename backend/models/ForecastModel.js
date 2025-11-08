const db = require('../config/db'); // mysql2 connection pool

// 🔹 Get all forecast rows for a specific user
exports.getByUser = (user_id, callback) => {
  const sql = `
    SELECT
      id,
      user_id,
      batch_id,
      DATE_FORMAT(date, '%Y-%m') AS month,   -- 👉 format to "YYYY-MM"
      actual_mortality,
      predicted_mortality,
      harvest_mortality,
      actual_harvest
    FROM tbl_forecast
    WHERE user_id = ?
    ORDER BY date ASC
  `;
  db.query(sql, [user_id], callback);
};
