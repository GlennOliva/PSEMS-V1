const express = require('express');
const router = express.Router();
const db = require('../config/db'); // MySQL connection

// Store last insert time for each table
const lastInsertTime = {
    temperature: 0,
    humidity: 0,
    ammonia: 0,
    carbon: 0
};

// Helper function to maintain 20 rows per user
function maintainLimit(table, user_id, callback) {
    const queryCount = `SELECT COUNT(*) AS count FROM ${table} WHERE user_id = ?`;
    db.query(queryCount, [user_id], (err, result) => {
        if (err) return callback(err);

        const rowCount = result[0].count;
        if (rowCount >= 20) {
            const excess = rowCount - 19; 
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

// Helper to insert data if 1 hour has passed
function insertWithHourlyLimit(table, data, tableKey, res) {
    const now = Date.now();
    if (now - lastInsertTime[tableKey] < 60 * 60 * 1000) {
        // Less than 1 hour since last insert
        return res.json({ message: `Data for ${table} already inserted within the last hour.` });
    }

    maintainLimit(table, data.user_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });

        const fields = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(_ => '?').join(', ');
        const values = Object.values(data);

        const insertQuery = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;

        db.query(insertQuery, values, (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            lastInsertTime[tableKey] = now;
            res.json({ message: `${table} data inserted successfully` });
        });
    });
}

// Temperature
router.post('/temperature', (req, res) => {
    const { user_id, temperature_celcius, status, date, time } = req.body;
    insertWithHourlyLimit(
        'tbl_temperature',
        { user_id, date, time, temperature_celcius, status },
        'temperature',
        res
    );
});

// Humidity
router.post('/humidity', (req, res) => {
    const { user_id, humidity_percentage, status, date, time } = req.body;
    insertWithHourlyLimit(
        'tbl_humidity',
        { user_id, date, time, humidity_percentage, status },
        'humidity',
        res
    );
});

// Ammonia
router.post('/ammonia', (req, res) => {
    const { user_id, ammonia_ppm, status, date, time } = req.body;
    insertWithHourlyLimit(
        'tbl_ammonia',
        { user_id, date, time, ammonia_ppm, status },
        'ammonia',
        res
    );
});

// CO2
router.post('/carbon', (req, res) => {
    const { user_id, carbon_ppm, status, date, time } = req.body;
    insertWithHourlyLimit(
        'tbl_carbon',
        { user_id, date, time, carbon_ppm, status },
        'carbon',
        res
    );
});

module.exports = router;
