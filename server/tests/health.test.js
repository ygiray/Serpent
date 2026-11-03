const request = require('supertest');
const { createApp } = require('../src/app');
const { openDb } = require('../src/db');

describe('GET /api/health', () => {
  it('returns ok and reads app info from the database', async () => {
    const app = createApp(openDb(':memory:'));
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', app: 'Serpent', version: '0.0.0' });
  });
});
