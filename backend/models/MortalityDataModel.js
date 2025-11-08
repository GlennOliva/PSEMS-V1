const db = require('../config/db'); // mysql2 connection

// 🔹 Get all harvest records with user's full name and batch info
exports.getByUser = (user_id, callback) => {
  const sql = `
    SELECT 
      m.id,
      m.barn_id,
      m.quantity,
      m.cause,
      u.full_name,
      b.barn_name
    FROM tbl_mortality m
    LEFT JOIN tbl_user  u  ON m.user_id  = u.id
    LEFT JOIN tbl_barn b ON m.barn_id = b.id
    WHERE m.user_id = ?
  `;
  db.query(sql, [user_id], callback);
};
