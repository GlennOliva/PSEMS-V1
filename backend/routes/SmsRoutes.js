const express = require('express');
const axios = require('axios');
const router = express.Router();

const BASE_URL = 'https://api.textbee.dev/api/v1';
const API_KEY = '89553bb3-7b13-413b-b875-d583048a8547';
const DEVICE_ID = '691ceb9982033f16094df078';

router.post('/send-sms', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'Phone and message required' });

  try {
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      { recipients: [phone], message },
      { headers: { 'x-api-key': API_KEY } }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('TextBee API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to send SMS', details: err.response?.data || err.message });
  }
});

module.exports = router; // ✅ CommonJS export
