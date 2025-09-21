const express = require('express');
const router = express.Router();
const controller = require('../controllers/UserController');


// 🟢 Register 
router.post('/register', controller.addUser);

    // 🟢 Login
    router.post('/login', controller.loginUser);

    router.get('/:id', controller.getUserById); // 👈 this line

// 🟢 Update user
router.put('/:id', controller.updateUser);

module.exports = router;