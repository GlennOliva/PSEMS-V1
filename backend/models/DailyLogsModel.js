const db = require('../config/db'); // MySQL connection (mysql2)

// 🔹 Get all daily logs (latest first)
exports.getAll = (callback) => {
  const sql = `
    SELECT id, user_id, batch_id, mortality_id, date, feed
    FROM tbl_daily
    ORDER BY id DESC
  `;
  db.query(sql, callback);
};

// 🔹 Get daily logs with mortality quantity and batch name for a specific user
exports.getByUserId = (userId, callback) => {
  const sql = `
    SELECT 
      d.id,
      d.user_id,
      d.batch_id,
      b.batch_name,
      d.mortality_id,
      m.quantity AS mortality_quantity,
      d.date,
      d.feed
    FROM tbl_daily d
    LEFT JOIN tbl_mortality m
      ON d.mortality_id = m.id
    LEFT JOIN tbl_batch b
      ON d.batch_id = b.id
    WHERE d.user_id = ?
    ORDER BY d.date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database error in getByUserId:', err);
      return callback(err);
    }
    callback(null, results);
  });
};



// 🔹 Get a single daily log by ID
exports.getById = (id, callback) => {
  const sql = 'SELECT * FROM tbl_daily WHERE id = ?';
  db.query(sql, [id], callback);
};

// ➕ Add a new daily log
exports.create = (data, callback) => {
  const sql = `
    INSERT INTO tbl_daily (user_id, batch_id, mortality_id, date, feed)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    data.user_id,
    data.batch_id,
    data.mortality_id,
    data.date,
    data.feed
  ];
  db.query(sql, values, callback);
};

// ✏️ Update daily log by ID
exports.update = (id, data, callback) => {
  console.log("Updating daily log with ID:", id);
  console.log("Data received:", data);

  const sql = `
    UPDATE tbl_daily
    SET batch_id = ?, mortality_id = ?, date = ?, feed = ?
    WHERE id = ?
  `;
  const values = [
    data.batch_id,
    data.mortality_id,
    data.date,
    data.feed,
    id
  ];

  console.log("SQL Query Values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return callback(err, null);
    }

    if (result.affectedRows === 0) {
      console.log("No daily log found with the given ID");
      return callback(null, { message: 'Daily log not found' });
    }

    console.log("Daily log updated successfully");
    callback(null, result);
  });
};

// ❌ Delete daily log by ID
exports.delete = (id, callback) => {
  const sql = 'DELETE FROM tbl_daily WHERE id = ?';
  db.query(sql, [id], callback);
};
