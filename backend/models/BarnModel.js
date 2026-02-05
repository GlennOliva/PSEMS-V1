const db = require('../config/db'); // MySQL connection (mysql2)

// 🔹 Get all barns with the user’s full name
exports.getAll = (callback) => {
  const sql = `SELECT id, barn_name FROM tbl_barn ORDER BY id DESC`;
  db.query(sql, callback);
};

// 🔹 Get barns for a specific user
exports.getByUserId = (userId, callback) => {
  const sql = `
    SELECT
      id,
      barn_name,
      description,
      date,
      user_id
    FROM tbl_barn
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database error in getByUserId:', err);
      return callback(err);
    }
    callback(null, results);
  });
};


// 🔹 Get a single barn by ID
exports.getById = (id, callback) => {
  const sql = 'SELECT * FROM tbl_barn WHERE id = ?';
  db.query(sql, [id], callback);
};

// ➕ Add a new barn
exports.create = (data, callback) => {
  const sql = `
    INSERT INTO tbl_barn (user_id, barn_name, description, date)
    VALUES (?, ?, ?, ?)
  `;
  const values = [
    data.user_id,
    data.barn_name,
    data.description,
    data.date
  ];
  db.query(sql, values, callback);
};

// ✏️ Update barn by ID
exports.update = (id, data, callback) => {
  console.log("Updating barn with ID:", id);
  console.log("Data received:", data);

  const sql = `
    UPDATE tbl_barn
    SET barn_name = ?, description = ?, date = ?
    WHERE id = ?
  `;
  const values = [
    data.barn_name,
    data.description,
    data.date,
    id
  ];

  console.log("SQL Query Values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return callback(err, null);
    }

    if (result.affectedRows === 0) {
      console.log("No barn found with the given ID");
      return callback(null, { message: 'Barn not found' });
    }

    console.log("Barn updated successfully");
    callback(null, result);
  });
};

// ❌ Delete barn by ID
exports.delete = (id, callback) => {
  const sql = 'DELETE FROM tbl_barn WHERE id = ?';
  db.query(sql, [id], callback);
};



// ✅ Get barn_id using batchId
exports.getBarnIdByBatchId = (batchId, callback) => {
  const sql = `
    SELECT barn_id
    FROM tbl_batch
    WHERE id = ?
    LIMIT 1
  `;

  db.query(sql, [batchId], (err, rows) => {
    if (err) return callback(err);

    if (!rows || rows.length === 0) {
      return callback(null, null);
    }

    return callback(null, rows[0].barn_id);
  });
};

// ✅ Get barn info by barnId
exports.getById = (barnId, callback) => {
  const sql = `
    SELECT id, barn_name, status
    FROM tbl_barn
    WHERE id = ?
    LIMIT 1
  `;
  db.query(sql, [barnId], callback);
};

// ✅ Count all batches + harvested batches inside the barn
exports.getBatchCountsByBarnId = (barnId, callback) => {
  // ✅ "harvested" rule used here:
  // A batch is considered harvested if:
  // - date_completed IS NOT NULL
  // OR
  // - status is one of: harvested/completed/done/finished  (case-insensitive)
  //
  // If your system uses a different status word, add it below.
  const sql = `
    SELECT
      COUNT(*) AS total_batches,
      SUM(
        CASE
          WHEN date_completed IS NOT NULL
            OR (status IS NOT NULL AND LOWER(status) IN ('harvested', 'completed', 'done', 'finished'))
          THEN 1
          ELSE 0
        END
      ) AS harvested_batches
    FROM tbl_batch
    WHERE barn_id = ?
  `;

  db.query(sql, [barnId], callback);
};

// ✅ Update barn status (Available / Occupied)
exports.updateStatus = (barnId, status, callback) => {
  const sql = `
    UPDATE tbl_barn
    SET status = ?
    WHERE id = ?
  `;
  db.query(sql, [status, barnId], callback);
};