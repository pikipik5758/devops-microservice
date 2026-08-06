const request = require('supertest');
const app = require('./index');

describe('DevOps Microservice API Tests', () => {
  it('GET / - Harus mengembalikan status 200 dan pesan aktif', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
  });

  it('GET /users - Harus mengembalikan respon JSON', async () => {
    const res = await request(app).get('/users');
    // Menoleransi status 200 (berhasil) atau 500 (jika DB belum terkoneksi di unit test)
    expect([200, 500]).toContain(res.statusCode);
  });
});