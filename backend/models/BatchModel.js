const db = require('../config/db');

// ✅ Get all batches
exports.getAll = (callback) => {
  const sql = `
    SELECT id, user_id, barn_id, batch_name, breed, no_chicken, date_started, date_completed, status
    FROM tbl_batch
    ORDER BY id DESC
  `;
  db.query(sql, callback);
};

// ✅ Get batch by ID
exports.getById = (id, callback) => {
  const sql = `
    SELECT id, user_id, barn_id, batch_name, breed, no_chicken, date_started, date_completed, status
    FROM tbl_batch
    WHERE id = ?
  `;
  db.query(sql, [id], callback);
};

// ✅ Get batches by user ID
exports.getByUserId = (userId, callback) => {
  const sql = `
    SELECT id, user_id, barn_id, batch_name, breed, no_chicken, date_started, date_completed, status
    FROM tbl_batch
    WHERE user_id = ?
    ORDER BY id DESC
  `;
  db.query(sql, [userId], callback);
};

// ➕ Create a new batch
exports.create = (batchData, callback) => {
  const sql = `
    INSERT INTO tbl_batch
    (user_id, barn_id, batch_name, breed, no_chicken, date_started, date_completed, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    batchData.user_id,
    batchData.barn_id,
    batchData.batch_name,
    batchData.breed,
    batchData.no_chicken,
    batchData.date_started,
    batchData.date_completed,
    batchData.status,
  ];
  db.query(sql, values, callback);
};

// ✏️ Update batch
exports.update = (id, batchData, callback) => {
  const sql = `
    UPDATE tbl_batch
    SET barn_id = ?, batch_name = ?, breed = ?, no_chicken = ?, date_started = ?, date_completed = ?, status = ?
    WHERE id = ?
  `;
  const values = [
    batchData.barn_id,
    batchData.batch_name,
    batchData.breed,
    batchData.no_chicken,
    batchData.date_started,
    batchData.date_completed,
    batchData.status,
    id,
  ];
  db.query(sql, values, callback);
};

// ❌ Delete batch
exports.delete = (id, callback) => {
  const sql = `
    DELETE FROM tbl_batch
    WHERE id = ?
  `;
  db.query(sql, [id], callback);
};
exports.markCompleted = (batchId, dateCompleted, callback) => {
  const sql = `
    UPDATE tbl_batch
    SET date_completed = ?, status = 'Completed'
    WHERE id = ?
      AND date_completed IS NULL
  `;
  db.query(sql, [dateCompleted, batchId], callback);
};
