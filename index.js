const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/', (req, res) => {
  res.json({ status: 'running' });
});

app.post('/api/webhook', async (req, res) => {
  try {
    const { symbol, tf } = req.body;
    await pool.query(
      'INSERT INTO bars (received_at, symbol, tf, payload) VALUES (NOW(), $1, $2, $3)',
      [symbol || 'UNKNOWN', tf || '2', JSON.stringify(req.body)]
    );
    console.log(`Received: ${symbol}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));
