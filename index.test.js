const request = require('supertest');
const app = require('./index');

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