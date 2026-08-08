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

// Jalankan initDB & listen otomatis HANYA jika bukan mode test
if (process.env.NODE_ENV !== 'test') {
  initDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Lampirkan initDB & pool ke app agar bisa dipanggil oleh Jest
app.initDB = initDB;
app.pool = pool;

module.exports = app;