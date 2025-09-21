const db = require('../config/db'); // MySQL connection (mysql2)

// 🔹 Get all growth tracking records (latest first)
exports.getAll = (callback) => {
  const sql = `
    SELECT g.id, g.user_id, g.batch_id, b.batch_name, g.date, g.age, g.total_weight, g.no_chicken, g.average_weight
    FROM tbl_growth g
    LEFT JOIN tbl_batch b ON g.batch_id = b.id
    ORDER BY g.id DESC
  `;
  db.query(sql, callback);
};

// 🔹 Get growth tracking records for a specific user
exports.getByUserId = (userId, callback) => {
  const sql = `
    SELECT g.id, g.user_id, g.batch_id, b.batch_name, g.date, g.age, g.total_weight, g.no_chicken, g.average_weight
    FROM tbl_growth g
    LEFT JOIN tbl_batch b ON g.batch_id = b.id
    WHERE g.user_id = ?
    ORDER BY g.date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database error in getByUserId:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

// 🔹 Get a single growth record by ID
exports.getById = (id, callback) => {
  const sql = 'SELECT * FROM tbl_growth WHERE id = ?';
  db.query(sql, [id], callback);
};

// ➕ Add a new growth record
exports.create = (data, callback) => {
  const sql = `
    INSERT INTO tbl_growth (user_id, batch_id, date, age, total_weight, no_chicken, average_weight)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.user_id,
    data.batch_id,
    data.date,
    data.age,
    data.total_weight,
    data.no_chicken,
    data.average_weight
  ];
  db.query(sql, values, callback);
};

// ✏️ Update growth record by ID
exports.update = (id, data, callback) => {
  const sql = `
    UPDATE tbl_growth
    SET batch_id = ?, date = ?, age = ?, total_weight = ?, no_chicken = ?, average_weight = ?
    WHERE id = ?
  `;
  const values = [
    data.batch_id,
    data.date,
    data.age,
    data.total_weight,
    data.no_chicken,
    data.average_weight,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return callback(err, null);
    }

    if (result.affectedRows === 0) {
      return callback(null, { message: 'Growth record not found' });
    }

    callback(null, result);
  });
};

// ❌ Delete growth record by ID
exports.delete = (id, callback) => {
  const sql = 'DELETE FROM tbl_growth WHERE id = ?';
  db.query(sql, [id], callback);
};
