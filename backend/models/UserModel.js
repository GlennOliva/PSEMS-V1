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
    INSERT INTO tbl_user (full_name , email , password, address)
    VALUES (?, ?, ?, ?)
  `;
  const values = [
    data.full_name,
    data.email,
    data.password,
    data.address
  ];
  db.query(sql, values, callback);
};


exports.updateUser = (id, data, callback) => {
  const sql = `
    UPDATE tbl_user
    SET full_name = ? , email = ? , password = ? , address = ?
    WHERE id = ?
  `;
  const values = [
    data.full_name,
    data.email,
    data.password,
    data.address,
    id
  ];
  db.query(sql, values, callback);
};


// 🔐 Login function
exports.loginUser = (email, password, callback) => {
    const sql = `SELECT * FROM tbl_user WHERE email = ? AND password = ?`;
    db.query(sql, [email, password], callback);
  };
  