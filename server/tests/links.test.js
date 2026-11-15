const request = require('supertest');
const { createTestApp, makeToken } = require('./helpers');
const { seedFixtures } = require('./fixtures');

let app, db, f;
beforeEach(() => {
  ({ app, db } = createTestApp());
  f = seedFixtures(db);
});

const url = () => `/api/children/${f.childId}/links`;
const as = (user) => ({ Authorization: `Bearer ${makeToken(user)}` });
const link = (body) => request(app).post(url()).set(as(f.parent)).send(body);

describe('M2 – linking specialists', () => {
  it('links a registered specialist by email and type (FR-M2-01)', async () => {
    const res = await link({ email: 'specialist@test.com', specialistType: 'teacher' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ specialistId: f.specialist.id, specialistType: 'teacher' });
  });

  it('rejects an email that is not a registered specialist (FR-M2-02)', async () => {
    expect((await link({ email: 'nobody@test.com', specialistType: 'teacher' })).status).toBe(404);
    expect((await link({ email: 'other-parent@test.com', specialistType: 'teacher' })).status).toBe(404);
  });

  it('rejects a missing email or an unknown specialist type', async () => {
    expect((await link({ specialistType: 'teacher' })).status).toBe(400);
    expect((await link({ email: 'specialist@test.com', specialistType: 'astronaut' })).status).toBe(400);
  });

  it('rejects linking the same specialist twice (FR-M2-08)', async () => {
    await link({ email: 'specialist@test.com', specialistType: 'teacher' });
    expect((await link({ email: 'specialist@test.com', specialistType: 'coach' })).status).toBe(409);
  });

  it('lists the linked specialists with name, email and type (FR-M2-03)', async () => {
    await link({ email: 'specialist@test.com', specialistType: 'teacher' });
    const res = await request(app).get(url()).set(as(f.parent));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ name: 'Linked Specialist', email: 'specialist@test.com', specialistType: 'teacher' });
  });

  it('unlinks a specialist (FR-M2-04)', async () => {
    const created = await link({ email: 'specialist@test.com', specialistType: 'teacher' });
    expect((await request(app).delete(`${url()}/${created.body.id}`).set(as(f.parent))).status).toBe(204);
    expect((await request(app).get(url()).set(as(f.parent))).body).toHaveLength(0);
    expect((await request(app).delete(`${url()}/${created.body.id}`).set(as(f.parent))).status).toBe(404);
  });

  it('only lets the child\'s own parent manage links (FR-M2-06)', async () => {
    expect((await request(app).get(url())).status).toBe(401);
    for (const user of [f.specialist, f.childUser, f.otherParent]) {
      expect((await request(app).get(url()).set(as(user))).status).toBe(403);
    }
  });

  it('returns 404 for a child that does not exist', async () => {
    expect((await request(app).get('/api/children/999/links').set(as(f.parent))).status).toBe(404);
  });
});