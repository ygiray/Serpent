const express = require('express');
const request = require('supertest');
const { authenticate, requireRole } = require('../src/middleware/auth');
const { makeToken } = require('./helpers');

function buildTestServer() {
  const app = express();
  app.get('/protected', authenticate, (req, res) => {
    res.json({ user: req.user });
  });
  app.get('/parent-only', authenticate, requireRole('parent'), (req, res) => {
    res.json({ ok: true });
  });
  return app;
}

describe('auth middleware (SCRUM-28)', () => {
  const app = buildTestServer();

  it('rejects requests without Authorization header with 401', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Login required' });
  });

  it('rejects malformed or invalid tokens with 401', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid or expired token' });
  });

  it('populates req.user when given a valid token', async () => {
    const token = makeToken({ id: 7, role: 'parent' });
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: { id: 7, role: 'parent' } });
  });

  it('allows access when user role matches requireRole', async () => {
    const token = makeToken({ id: 7, role: 'parent' });
    const res = await request(app)
      .get('/parent-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('denies access with 403 when user role is not allowed', async () => {
    const token = makeToken({ id: 8, role: 'child' });
    const res = await request(app)
      .get('/parent-only')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Not allowed for your role' });
  });
});