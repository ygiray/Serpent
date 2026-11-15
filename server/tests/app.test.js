const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createTestApp, makeToken } = require('./helpers');
const { JWT_SECRET } = require('../src/config');

describe('app structure', () => {
  it('returns 404 JSON for an unknown API path', async () => {
    const { app } = createTestApp();
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('makeToken creates a token with userId and role', () => {
    const payload = jwt.verify(makeToken({ id: 7, role: 'parent' }), JWT_SECRET);
    expect(payload).toMatchObject({ userId: 7, role: 'parent' });
  });
});
