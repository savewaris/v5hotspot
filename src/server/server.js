const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.USE_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database', err.stack);
  } else {
    console.log('Connected to the database');
    release();
  }
});

// Route to fetch paginated data
app.get('/data', async (req, res) => {
  const limit = parseInt(req.query.limit) || 1000;
  const offset = parseInt(req.query.offset) || 0;

  try {
    console.log('Fetching data from PostgreSQL...');
    const query = `
      SELECT ST_AsGeoJSON(geometry) AS geometry, freq 
      FROM fire_frequency
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);

    res.json(result.rows);
    console.log('Data successfully sent.');
  } catch (err) {
    console.error('Error fetching data', err);
    res.status(500).json({ error: 'Error fetching data', details: err.message });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);
});