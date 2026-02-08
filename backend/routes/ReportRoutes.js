const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Optional: /batch-report?user_id=123
router.get('/batch-report', (req, res) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : null;

  let where = '';
  const params = [];

  if (userId) {
    where = 'WHERE b.user_id = ?';
    params.push(userId);
  }

  const query = `
SELECT
  b.id,
  b.batch_name,
  b.barn_id,
  b.date_started,
  b.date_completed,

(SELECT ROUND(AVG(t.temperature_celcius), 2)
   FROM tbl_temperature t
   WHERE t.user_id = b.user_id
     AND t.date BETWEEN DATE(DATE_SUB(b.date_started, INTERVAL 8 HOUR))
                   AND DATE(DATE_SUB(COALESCE(b.date_completed, b.date_started), INTERVAL 8 HOUR))
  ) AS avg_temperature,

  (SELECT ROUND(AVG(h.humidity_percentage), 2)
   FROM tbl_humidity h
   WHERE h.user_id = b.user_id
     AND h.date BETWEEN DATE(DATE_SUB(b.date_started, INTERVAL 8 HOUR))
                   AND DATE(DATE_SUB(COALESCE(b.date_completed, b.date_started), INTERVAL 8 HOUR))
  ) AS avg_humidity,

  (SELECT ROUND(AVG(a.ammonia_ppm), 2)
   FROM tbl_ammonia a
   WHERE a.user_id = b.user_id
     AND a.date BETWEEN DATE(DATE_SUB(b.date_started, INTERVAL 8 HOUR))
                   AND DATE(DATE_SUB(COALESCE(b.date_completed, b.date_started), INTERVAL 8 HOUR))
  ) AS avg_ammonia,

  (SELECT ROUND(AVG(c.carbon_ppm), 2)
   FROM tbl_carbon c
   WHERE c.user_id = b.user_id
     AND c.date BETWEEN DATE(DATE_SUB(b.date_started, INTERVAL 8 HOUR))
                   AND DATE(DATE_SUB(COALESCE(b.date_completed, b.date_started), INTERVAL 8 HOUR))
  ) AS avg_co2,

  (SELECT COALESCE(SUM(m.quantity), 0)
   FROM tbl_mortality m
   WHERE m.user_id = b.user_id
     AND m.barn_id = b.barn_id
     AND m.date BETWEEN DATE(b.date_started)
                   AND DATE(COALESCE(b.date_completed, b.date_started))
  ) AS mortality,

  (SELECT COALESCE(SUM(hv.no_harvest), 0)
   FROM tbl_harvest hv
   WHERE hv.user_id = b.user_id
     AND hv.batch_id = b.id
     AND hv.date BETWEEN DATE(b.date_started)
                   AND DATE(COALESCE(b.date_completed, b.date_started))
  ) AS harvest

FROM tbl_batch b
${where}
ORDER BY b.date_started DESC;
`;



  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
