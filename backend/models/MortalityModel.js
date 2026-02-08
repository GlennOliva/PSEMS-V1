const db = require('../config/db'); // MySQL connection (mysql2)

// 🔹 Get all mortalities (latest first)
exports.getAll = (callback) => {
  const sql = `
    SELECT id, user_id, barn_id, cause, date, notes
    FROM tbl_mortality
    ORDER BY id DESC
  `;
  db.query(sql, callback);
};

// 🔹 Get mortalities for a specific user
// 🔹 Get mortalities for a specific user with barn name
exports.getByUserId = (userId, callback) => {
  const sql = `
    SELECT 
      m.id,
      m.user_id,
      m.barn_id,
      b.barn_name,       -- include barn name
      m.cause,
      m.date,
      m.quantity,
      m.notes
    FROM tbl_mortality AS m
    LEFT JOIN tbl_barn AS b
      ON m.barn_id = b.id
    WHERE m.user_id = ?
    ORDER BY m.date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database error in getByUserId:', err);
      return callback(err);
    }
    callback(null, results);
  });
};


// 🔹 Get a single mortality record by ID
exports.getById = (id, callback) => {
  const sql = 'SELECT * FROM tbl_mortality WHERE id = ?';
  db.query(sql, [id], callback);
};

// ➕ Add a new mortality record
exports.create = (data, callback) => {
  const sql = `
    INSERT INTO tbl_mortality (user_id, barn_id, cause, quantity, date, notes)
    VALUES (?, ?, ?, ?, ? , ?)
  `;
  const values = [
    data.user_id,
    data.barn_id,
    data.cause,
       data.quantity,
    data.date,
    data.notes
  ];
  db.query(sql, values, callback);
};

// ✏️ Update mortality record by ID
exports.update = (id, data, callback) => {
  console.log("Updating mortality with ID:", id);
  console.log("Data received:", data);

  const sql = `
    UPDATE tbl_mortality
    SET  barn_id = ?, cause = ?, quantity = ?, date = ?, notes = ?
    WHERE id = ?
  `;
  const values = [
    data.barn_id,
    data.cause,
    data.quantity,
    data.date,
    data.notes,
    id
  ];

  console.log("SQL Query Values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return callback(err, null);
    }

    if (result.affectedRows === 0) {
      console.log("No mortality found with the given ID");
      return callback(null, { message: 'Mortality not found' });
    }

    console.log("Mortality updated successfully");
    callback(null, result);
  });
};

// ❌ Delete mortality record by ID
exports.delete = (id, callback) => {
  const sql = 'DELETE FROM tbl_mortality WHERE id = ?';
  db.query(sql, [id], callback);
};


exports.sumByBarnInRange = (barnId, startDate, endDate, callback) => {
  const sql = `
    SELECT COALESCE(SUM(quantity), 0) AS total
    FROM tbl_mortality
    WHERE barn_id = ?
      AND date >= ?
      AND date <= ?
  `;
  db.query(sql, [barnId, startDate, endDate], (err, rows) => {
    if (err) return callback(err);
    callback(null, Number(rows?.[0]?.total ?? 0));
  });
};