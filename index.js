const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json()); // Middleware agar Express bisa membaca JSON dari request body

const PORT = process.env.PORT || 3000;

// Cek apakah koneksi mengarah ke database lokal
const isLocal = !process.env.DATABASE_URL || 
                process.env.DATABASE_URL.includes('localhost') || 
                process.env.DATABASE_URL.includes('@db:');

// Konfigurasi Pool Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin:rahasia123@localhost:5432/devops_db',
  // Matikan SSL jika di lokal, aktifkan SSL jika di Cloud
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

// Auto-Create Table saat Server Pertama Kali Menyala (DevOps Practice)
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
initDB();

// 1. Endpoint Utama
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Container DevOps Microservice Active! 🚀' });
});

// 2. Endpoint Health Check & DB Check
app.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Database Terhubung! 🎉', db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'Koneksi Gagal ❌', error: err.message });
  }
});

// 3. READ: Ambil Semua User dari Database
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. CREATE: Tambah User Baru ke Database
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

// 5. UPDATE: Mengubah Data User Berdasarkan ID
app.put('/users/:id', async (req, res) => {
  const { id } = req.params; // Mengambil ID dari URL (/users/1)
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name dan Email wajib diisi!' });
  }

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

// 6. DELETE: Menghapus User Berdasarkan ID
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

// Jalankan server hanya jika BUKAN dalam mode testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Ekspor app agar bisa diuji oleh Jest
module.exports = app;