const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Konfigurasi Database Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin:rahasia123@localhost:5432/devops_db',
});

// Auto-Create Table
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabel "users" siap digunakan!');
  } catch (err) {
    console.error('❌ Gagal inisialisasi tabel:', err.message);
  }
};

// ==========================================
// 📍 ROUTE API (Pastikan bagian ini ADA sebelum export)
// ==========================================

// 1. Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'DevOps Microservice is Running Live! 🚀' });
});

// 2. READ All Users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. CREATE User
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name dan Email wajib diisi!' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json({ success: true, message: 'User berhasil dibuat! 🎉', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. UPDATE User
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
    }
    res.json({ success: true, message: 'User berhasil diperbarui! ✏️', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE User
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan!' });
    }
    res.json({ success: true, message: 'User berhasil dihapus! 🗑️', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 🚀 SERVER LISTENER & EXPORTS
// ==========================================

if (process.env.NODE_ENV !== 'test') {
  initDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Lampirkan helper untuk testing Jest
app.initDB = initDB;
app.pool = pool;

module.exports = app;