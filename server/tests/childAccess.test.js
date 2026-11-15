const express = require('express');
const request = require('supertest');
const { createTestApp } = require('./helpers');
const { seedFixtures } = require('./fixtures');
const { requireChildAccess } = require('../src/middleware/childAccess');

// A tiny app that only runs the middleware. The logged-in user is set directly,
// so these tests do not depend on the login code.
function appAs(db, user) {
  const app = express();
  app.get(
    '/children/:childId',
    (req, res, next) => { req.user = { id: user.id, role: user.role }; next(); },
    requireChildAccess(db),
    (req, res) => res.json({ childId: req.child.id })
  );
  return app;
}

let db, f;
beforeEach(() => {
  ({ db } = createTestApp());
  f = seedFixtures(db);
  db.prepare("INSERT INTO specialist_links (childId, specialistId, specialistType) VALUES (?, ?, 'teacher')")
    .run(f.childId, f.specialist.id);
});

const get = (user, childId = f.childId) => request(appAs(db, user)).get(`/children/${childId}`);

describe('requireChildAccess (SCRUM-48)', () => {
  it('lets the parent see their own child', async () => {
    const res = await get(f.parent);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ childId: f.childId });
  });

  it('lets a linked specialist see the child', async () => {
    expect((await get(f.specialist)).status).toBe(200);
  });

  it('lets the child see their own profile', async () => {
    expect((await get(f.childUser)).status).toBe(200);
  });

  it('denies another parent', async () => {
    expect((await get(f.otherParent)).status).toBe(403);
  });

  it('denies a specialist who is not linked (FR-M2-05)', async () => {
    expect((await get(f.otherSpecialist)).status).toBe(403);
  });

  it('denies a specialist right after the parent unlinks them (FR-M2-05)', async () => {
    db.prepare('DELETE FROM specialist_links WHERE specialistId = ?').run(f.specialist.id);
    expect((await get(f.specialist)).status).toBe(403);
  });

  it('returns 404 for a child that does not exist', async () => {
    expect((await get(f.parent, 999)).status).toBe(404);
  });
});