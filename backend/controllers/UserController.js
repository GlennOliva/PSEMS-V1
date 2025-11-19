const User = require('../models/UserModel');

// 📌 Get all users
exports.getUser = (req, res) => {
  User.getUser(req.params.userId, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// 📌 Get user by ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;
  User.getUserbyId(userId, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(result[0]);
  });
};

// 📌 Register user
exports.addUser = (req, res) => {
  try {
    const { full_name, email, password, address, role } = req.body;

    if (!full_name || !email || !password || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userData = { full_name, email, password, address, role: role || 'staff' };

    User.addUser(userData, (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({
        message: 'Staff Successfully Created',
        id: result.insertId
      });
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Server error occurred' });
  }
};

// 📌 Update user
exports.updateUser = (req, res) => {
  const id = req.params.id;
  const { full_name, email, password, address, role } = req.body;

  const updatedData = { full_name, email, password, address, role };

  User.updateUser(id, updatedData, (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Staff updated successfully!' });
  });
};

// 🔐 Login user (only admin or staff)
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  User.loginUser(email, password, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { password: pw, ...safeUser } = results[0];

    res.json({ message: 'Login successful', user: safeUser });
  });
};

// 👥 Get all staff users
exports.getStaffUsers = (req, res) => {
  User.getStaffUsers((err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};


// 🗑️ Delete user
exports.deleteUser = (req, res) => {
  const userId = req.params.id;

  User.deleteUser(userId, (err, result) => {
    if (err) {
      console.error("Delete error:", err);

      // If foreign key prevents deletion
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          error: "Cannot delete staff — linked records exist.",
        });
      }

      return res.status(500).json({ error: "Failed to delete staff" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Staff deleted successfully!" });
  });
};

