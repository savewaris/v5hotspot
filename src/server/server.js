const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hotspot_data',
  password: 'Save_030945',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'client', 'public')));

// Route to fetch paginated data
app.get('/data', async (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;
  const offset = parseInt(req.query.offset) || 0;

  try {
    console.log('Fetching data from PostgreSQL...');
    const client = await pool.connect();
    const query = `
      SELECT ST_AsGeoJSON(geometry) AS geometry, freq 
      FROM fire_frequency
      LIMIT $1 OFFSET $2
    `;
    const result = await client.query(query, [limit, offset]);
    client.release();

    res.json(result.rows);
    console.log('Data successfully sent.');
  } catch (err) {
    console.error('Error fetching data', err);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'..','client', 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
