const express = require('express');
const router = express.Router();
const db = require('../config/db'); // your MySQL connection

router.get('/batch-report', (req, res) => {
  const query = `
SELECT 
    b.id,
    b.date_started AS date_started,
    b.date_completed AS date_completed,
    ROUND(AVG(t.temperature_celcius), 2) AS avg_temperature,
    ROUND(AVG(h.humidity_percentage), 2) AS avg_humidity,
    ROUND(AVG(a.ammonia_ppm), 2) AS avg_ammonia,
    ROUND(AVG(c.carbon_ppm), 2) AS avg_co2,
    COALESCE(SUM(m.quantity), 0) AS mortality,
    COALESCE(SUM(hv.no_harvest), 0) AS harvest
FROM tbl_batch b
LEFT JOIN tbl_temperature t 
    ON t.user_id = b.user_id
    AND t.date BETWEEN b.date_started AND COALESCE(b.date_completed, b.date_started)

LEFT JOIN tbl_humidity h 
    ON h.user_id = b.user_id 
    AND h.date = b.date_started
LEFT JOIN tbl_ammonia a 
    ON a.user_id = b.user_id 
    AND a.date = b.date_started
LEFT JOIN tbl_carbon c 
    ON c.user_id = b.user_id 
    AND c.date = b.date_started
LEFT JOIN tbl_mortality m 
    ON m.barn_id = b.barn_id
LEFT JOIN tbl_harvest hv 
    ON hv.batch_id = b.id
GROUP BY b.id
ORDER BY b.date_started DESC;
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
