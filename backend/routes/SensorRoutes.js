const express = require('express');
const router = express.Router();
const db = require('../config/db'); // MySQL connection

// Helper function to maintain 300 rows per user
function maintainLimit(table, user_id, callback) {
    const queryCount = `SELECT COUNT(*) AS count FROM ${table} WHERE user_id = ?`;
    db.query(queryCount, [user_id], (err, result) => {
        if (err) return callback(err);

        const rowCount = result[0].count;

        if (rowCount >= 20) {
            const excess = rowCount - 19; // leave space for the new row

            // Step 1: get the IDs of the oldest rows
            const selectQuery = `
                SELECT id FROM ${table}
                WHERE user_id = ?
                ORDER BY date ASC, time ASC
                LIMIT ?
            `;
            db.query(selectQuery, [user_id, excess], (err2, rows) => {
                if (err2) return callback(err2);

                if (rows.length === 0) return callback(null);

                const idsToDelete = rows.map(r => r.id);

                // Step 2: delete oldest rows
                const deleteQuery = `DELETE FROM ${table} WHERE id IN (?)`;
                db.query(deleteQuery, [idsToDelete], (err3) => {
                    if (err3) return callback(err3);
                    callback(null);
                });
            });

        } else {
            callback(null);
        }
    });
}


// Insert temperature
router.post('/temperature', (req, res) => {
    const { user_id, temperature_celcius, status, date, time } = req.body;
    maintainLimit('tbl_temperature', user_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
            "INSERT INTO tbl_temperature (user_id, date, time, temperature_celcius, status) VALUES (?, ?, ?, ?, ?)",
            [user_id, date, time, temperature_celcius, status],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Temperature inserted successfully" });
            }
        );
    });
});

// Insert humidity
router.post('/humidity', (req, res) => {
    const { user_id, humidity_percentage, status, date, time } = req.body;
    maintainLimit('tbl_humidity', user_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
            "INSERT INTO tbl_humidity (user_id, date, time, humidity_percentage, status) VALUES (?, ?, ?, ?, ?)",
            [user_id, date, time, humidity_percentage, status],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Humidity inserted successfully" });
            }
        );
    });
});

// Insert ammonia
router.post('/ammonia', (req, res) => {
    const { user_id, ammonia_ppm, status, date, time } = req.body;
    maintainLimit('tbl_ammonia', user_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
            "INSERT INTO tbl_ammonia (user_id, date, time, ammonia_ppm, status) VALUES (?, ?, ?, ?, ?)",
            [user_id, date, time, ammonia_ppm, status],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Ammonia inserted successfully" });
            }
        );
    });
});

// Insert CO2
router.post('/carbon', (req, res) => {
    const { user_id, carbon_ppm, status, date, time } = req.body;
    maintainLimit('tbl_carbon', user_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
            "INSERT INTO tbl_carbon (user_id, date, time, carbon_ppm, status) VALUES (?, ?, ?, ?, ?)",
            [user_id, date, time, carbon_ppm, status],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Carbon inserted successfully" });
            }
        );
    });
});

module.exports = router;
