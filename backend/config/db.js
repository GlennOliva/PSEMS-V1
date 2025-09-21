const mysql = require('mysql');
require('dotenv').config();  // Load environment variables from .env file

const db = mysql.createConnection({
    host: process.env.DB_HOST,        // Use the value from .env
    user: process.env.DB_USER,        // Use the value from .env
    password: process.env.DB_PASSWORD, // Use the value from .env
    database: process.env.DB_NAME      // Use the value from .env
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL Database');
});

module.exports = db;