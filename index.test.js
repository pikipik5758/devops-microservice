const request = require('supertest');
const app = require('./index');

// 1. Tunggu inisialisasi tabel selesai sebelum tes dimulai
beforeAll(async () => {
  await app.initDB();
});

// 2. Tutup koneksi pool Postgres setelah seluruh tes selesai
afterAll(async () => {
  await app.pool.end();
});

describe('DevOps Microservice API Tests', () => {
  it('GET / - Harus mengembalikan status 200 dan pesan aktif', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
  });

  it('GET /users - Harus mengembalikan status 200 dan koneksi database sukses', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});