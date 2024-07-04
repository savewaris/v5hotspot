const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: process.env.USE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// Test database connection
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to the database');
    client.release();
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
  }
};

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
    console.error('Error fetching data:', err.message);
    res.status(500).json({ error: 'Error fetching data', details: err.message });
  }
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html'));
});

// Start server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  console.log('Database connection details:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_DATABASE}`);
  console.log(`User: ${process.env.DB_USER}`);
  await testDatabaseConnection();
});