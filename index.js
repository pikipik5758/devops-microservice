const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint 1: Pesan Selamat Datang
app.get('/', (req, res) => {
  res.json({ 
    message: "Hello World! Mikro proyek DevOps dimulai.",
    timestamp: new Date()
  });
});

// Endpoint 2: Health Check (Penting untuk DevOps kelak!)
app.get('/health', (req, res) => {
  res.status(200).json({ status: "UP", service: "devops-microservice" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});