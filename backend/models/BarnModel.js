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
