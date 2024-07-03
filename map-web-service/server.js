require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { Readable } = require('stream');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection configuration
const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
};

// Enable SSL only if USE_SSL is true
if (process.env.USE_SSL === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

// PostgreSQL connection
const pool = new Pool(poolConfig);

app.use(cors());

// Log memory usage every minute
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log(`Memory usage: ${JSON.stringify(memoryUsage)}`);
}, 60000);

// Endpoint to fetch GeoJSON data
app.get('/geojson', async (req, res) => {
  try {
    const client = await pool.connect();
    const query = client.query(new Readable({
      read() {
        const queryStream = client.query('SELECT id, ST_AsGeoJSON(geometry)::json AS geometry FROM fire_frequency'); // Replace with your table and column names
        queryStream.on('data', (row) => {
          this.push(JSON.stringify({
            type: 'Feature',
            geometry: JSON.parse(row.geometry),
            properties: { id: row.id }
          }) + '\n');
        });
        queryStream.on('end', () => {
          client.release(); // Release the client back to the pool
          this.push(null); // Signal end of data
        });
        queryStream.on('error', (err) => {
          console.error('Query Error:', err);
          this.push(null); // Signal end of data on error
        });
      }
    }));

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="data.json"'
    });

    query.pipe(res); // Stream data directly to response
  } catch (err) {
    console.error('Database Connection Error:', err);
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
