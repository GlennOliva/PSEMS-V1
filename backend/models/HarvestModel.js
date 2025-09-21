const db = require('../config/db'); // MySQL connection (mysql2)

// 🔹 Get all harvest records with the user's full name
exports.getAll = (callback) => {
  const sql = `
    SELECT 
      h.*, 
      CONCAT(u.first_name, ' ', u.last_name) AS full_name
    FROM 
      tbl_harvest h
    LEFT JOIN 
      tbl_user u ON h.user_id = u.id
  `;
  db.query(sql, callback);
};

// 🔹 Get harvest records for a specific user with batch_name
exports.getByUserId = (userId, callback) => {
  const sql = `
    SELECT
      h.id,
      h.user_id,
      h.batch_id,
      b.batch_name,         -- ✅ from tbl_batch
      h.date,
      h.no_harvest,
      h.no_boxes
    FROM tbl_harvest AS h
    JOIN tbl_batch AS b
      ON h.batch_id = b.id 
    WHERE h.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database error in getByUserId:', err);
      return callback(err);
    }
    callback(null, results);
  });
};


// 🔹 Get a single harvest record by ID
exports.getById = (id, callback) => {
  const sql = 'SELECT * FROM tbl_harvest WHERE id = ?';
  db.query(sql, [id], callback);
};

// ➕ Add a new harvest record
exports.create = (data, callback) => {
  const sql = `
    INSERT INTO tbl_harvest (user_id, batch_id, date, no_harvest, no_boxes)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    data.user_id,
    data.batch_id,
    data.date,
    data.no_harvest,
    data.no_boxes
  ];
  db.query(sql, values, callback);
};

// ✏️ Update a harvest record by ID
exports.update = (id, data, callback) => {
  console.log("Updating harvest with ID:", id);
  console.log("Data received:", data);

  const sql = `
    UPDATE tbl_harvest
    SET batch_id = ?, date = ?, no_harvest = ?, no_boxes = ?
    WHERE id = ?
  `;
  const values = [
    data.batch_id,
    data.date,
    data.no_harvest,
    data.no_boxes,
    id
  ];

  console.log("SQL Query Values:", values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return callback(err, null);
    }

    if (result.affectedRows === 0) {
      console.log("No harvest found with the given ID");
      return callback(null, { message: 'Harvest not found' });
    }

    console.log("Harvest updated successfully");
    callback(null, result);
  });
};

// ❌ Delete a harvest record by ID
exports.delete = (id, callback) => {
  const sql = 'DELETE FROM tbl_harvest WHERE id = ?';
  db.query(sql, [id], callback);
};
