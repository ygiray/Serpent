// M3 – events API (SCRUM-37)
const express = require('express');
const request = require('supertest');
const { createTestApp } = require('./helpers');
const events = require('../src/routes/events');

// Until the auth middleware is in main (SCRUM-39), the logged-in user is set by a stub.
// When authenticate is enabled in routes/events.js, switch these tests to makeToken().
function appWithUser(user) {
  const { db } = createTestApp();
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = user;
    next();
  });
  app.use(events.path, events.createRouter(db));
  return { app, db };
}

const parent = { id: 1, role: 'parent' };
const child = { id: 3, role: 'child' };

const validEvent = {
  title: 'Speech therapy',
  description: 'Weekly session',
  startsAt: '2026-11-10T10:00',
  endsAt: '2026-11-10T11:00',
};

describe('POST /api/children/:childId/events', () => {
  it('adds an event and returns it with 201', async () => {
    const { app } = appWithUser(parent);
    const res = await request(app).post('/api/children/5/events').send(validEvent);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...validEvent, childId: 5, createdBy: 1 });
    expect(res.body.id).toBeDefined();
  });

  it('rejects an event without a title', async () => {
    const { app } = appWithUser(parent);
    const res = await request(app).post('/api/children/5/events').send({ ...validEvent, title: '  ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects an event without start or end time', async () => {
    const { app } = appWithUser(parent);
    const res = await request(app).post('/api/children/5/events').send({ title: 'Swimming' });

    expect(res.status).toBe(400);
  });

  it('rejects an event whose end is not after its start', async () => {
    const { app } = appWithUser(parent);
    const res = await request(app)
      .post('/api/children/5/events')
      .send({ ...validEvent, endsAt: '2026-11-10T10:00' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'End time must be after start time' });
  });

  it('does not let a child add events', async () => {
    const { app } = appWithUser(child);
    const res = await request(app).post('/api/children/5/events').send(validEvent);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/children/:childId/events', () => {
  function addEvent(db, childId, title, startsAt, endsAt) {
    db.prepare(
      'INSERT INTO events (childId, createdBy, title, startsAt, endsAt) VALUES (?, 1, ?, ?, ?)'
    ).run(childId, title, startsAt, endsAt);
  }

  it('returns only the events of the given week, ordered by start time', async () => {
    const { app, db } = appWithUser(parent);
    addEvent(db, 5, 'Sunday swim', '2026-11-15T18:00', '2026-11-15T19:00'); // last day of the week
    addEvent(db, 5, 'Monday music', '2026-11-09T09:00', '2026-11-09T10:00'); // first day of the week
    addEvent(db, 5, 'Last week', '2026-11-08T09:00', '2026-11-08T10:00');
    addEvent(db, 5, 'Next week', '2026-11-16T00:00', '2026-11-16T01:00');
    addEvent(db, 6, 'Other child', '2026-11-10T09:00', '2026-11-10T10:00');

    const res = await request(app).get('/api/children/5/events?week=2026-11-09');

    expect(res.status).toBe(200);
    expect(res.body.map((e) => e.title)).toEqual(['Monday music', 'Sunday swim']);
  });

  it('rejects a week that does not start on Monday', async () => {
    const { app } = appWithUser(parent);
    const res = await request(app).get('/api/children/5/events?week=2026-11-10');

    expect(res.status).toBe(400);
  });

  it('is mounted automatically by createApp', async () => {
    const { app } = createTestApp();
    const res = await request(app).get('/api/children/5/events?week=2026-11-09');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
