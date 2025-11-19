const db = require('../config/db'); // Make sure db.js connects MySQL using mysql2


exports.getUser = (userId, callback) => {
  const sql = 'SELECT * FROM tbl_user';
  db.query(sql, [userId], callback);
};


exports.getUserbyId = (userId, callback) => {
  const sql = 'SELECT * FROM tbl_user WHERE id = ?';
  db.query(sql, [userId], callback);
};

exports.addUser = (data, callback) => {
  const sql = `
    INSERT INTO tbl_user (full_name, email, password, address, role)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    data.full_name,
    data.email,
    data.password,
    data.address,
    data.role || 'staff', // default role = staff
  ];
  db.query(sql, values, callback);
};


exports.updateUser = (id, data, callback) => {
  const sql = `
    UPDATE tbl_user
    SET full_name = ?, email = ?, password = ?, address = ?, role = ?
    WHERE id = ?
  `;
  const values = [
    data.full_name,
    data.email,
    data.password,
    data.address,
    data.role,
    id,
  ];
  db.query(sql, values, callback);
};


// 🔐 Login function
// 🔐 Login function (only admin or staff can log in)
exports.loginUser = (email, password, callback) => {
  const sql = `
    SELECT * FROM tbl_user 
    WHERE email = ? 
      AND password = ? 
      AND (role = 'admin' OR role = 'staff')
  `;
  db.query(sql, [email, password], callback);
};

  

// 👥 Get all staff users
exports.getStaffUsers = (callback) => {
  const sql = `SELECT * FROM tbl_user WHERE role = 'staff'`;
  db.query(sql, callback);
};

exports.deleteUser = (id, callback) => {
  const sql = 'DELETE FROM tbl_user WHERE id = ?';
  db.query(sql, [id], callback);
};
