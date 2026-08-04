const express = require('express');
const{ Pool } = require('pg');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000; 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/devops_db',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Endpoint 1: Pesan Selamat Datang
app.get('/', (req, res) => {
  res.json({ 
    message: "Multi-Container DevOps Microservice is running!",
    timestamp: new Date()
  });
});

// Endpoint 2: Health Check (Penting untuk DevOps kelak!)
app.get('/health', (req, res) => {
  res.json({ status: "UP", timestamp: new Date() });
});


// tes koneksi ke database
app.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: "Database connection successful!",
      db_time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed!",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});