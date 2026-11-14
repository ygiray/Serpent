
const request = require('supertest');

// Mock SCRUM-28 authentication until its branch is merged.
// The role and user ID come from test-only headers.
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    const id = Number(req.headers['x-test-user-id']);
    const role = req.headers['x-test-role'];

    if (!Number.isInteger(id) || id <= 0 || !role) {
      return res.status(401).json({ error: 'Login required' });
    }

    req.user = { id, role };
    next();
  }
}), { virtual: true });

const { createApp } = require('../src/app');
const { openDb } = require('../src/db');

function setup() {
  const db = openDb(':memory:');

  // Temporary fixture tables for integration dependencies.
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS children (
      id INTEGER PRIMARY KEY,
      parentId INTEGER NOT NULL,
      userId INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS specialist_links (
      id INTEGER PRIMARY KEY,
      childId INTEGER NOT NULL,
      specialistId INTEGER NOT NULL
    );
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, passwordHash, name, role)
    VALUES (?, ?, 'test-hash', ?, ?)
  `);

  insertUser.run(1, 'parent@test.local', 'Parent', 'parent');
  insertUser.run(2, 'child@test.local', 'Child', 'child');
  insertUser.run(3, 'specialist@test.local', 'Specialist', 'specialist');
  insertUser.run(4, 'other@test.local', 'Other Parent', 'parent');

  db.prepare(`
    INSERT INTO children (id, parentId, userId)
    VALUES (10, 1, 2)
  `).run();

  db.prepare(`
    INSERT INTO specialist_links (id, childId, specialistId)
    VALUES (20, 10, 3)
  `).run();

  return { db, app: createApp(db) };
}

function asUser(app, method, url, id, role) {
  return request(app)[method](url)
    .set('x-test-user-id', String(id))
    .set('x-test-role', role);
}

const baseUrl = '/api/children/10/tasks';

describe('SCRUM-68 Tasks API', () => {
  let db;
  let app;

  beforeEach(() => {
    ({ db, app } = setup());
  });

  afterEach(() => {
    db.close();
  });

  test('rejects requests without authentication', async () => {
    const res = await request(app).get(baseUrl);
    expect(res.status).toBe(401);
  });

  test('allows a parent to create a task', async () => {
    const res = await asUser(app, 'post', baseUrl, 1, 'parent')
      .send({
        title: 'Read a book',
        description: 'Read for 15 minutes',
        developmentArea: 'language',
        dueDate: '2026-12-01'
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Read a book');
    expect(res.body.status).toBe('pending');
    expect(res.body.assignedBy).toBe(1);
    expect(res.body.childId).toBe(10);
  });

  test('allows a linked specialist to create a task', async () => {
    const res = await asUser(app, 'post', baseUrl, 3, 'specialist')
      .send({
        title: 'Motor practice',
        developmentArea: 'motor',
        dueDate: '2026-12-02'
      });

    expect(res.status).toBe(201);
    expect(res.body.assignedBy).toBe(3);
  });

  test('rejects an unrelated parent', async () => {
    const res = await asUser(app, 'get', baseUrl, 4, 'parent');
    expect(res.status).toBe(403);
  });

  test('rejects a child trying to assign a task', async () => {
    const res = await asUser(app, 'post', baseUrl, 2, 'child')
      .send({
        title: 'Read',
        developmentArea: 'language',
        dueDate: '2026-12-01'
      });

    expect(res.status).toBe(403);
  });

  test('rejects invalid task data', async () => {
    const res = await asUser(app, 'post', baseUrl, 1, 'parent')
      .send({
        title: '',
        developmentArea: 'invalid',
        dueDate: 'not-a-date'
      });

    expect(res.status).toBe(400);
  });

  test('lists tasks filtered by assignedBy=me', async () => {
    db.prepare(`
      INSERT INTO tasks
        (childId, assignedBy, title, developmentArea, dueDate)
      VALUES (?, ?, ?, ?, ?)
    `).run(10, 1, 'Parent task', 'language', '2026-12-01');

    db.prepare(`
      INSERT INTO tasks
        (childId, assignedBy, title, developmentArea, dueDate)
      VALUES (?, ?, ?, ?, ?)
    `).run(10, 3, 'Specialist task', 'motor', '2026-12-02');

    const res = await asUser(
      app, 'get', `${baseUrl}?assignedBy=me`, 1, 'parent'
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Parent task');
  });

  test('filters tasks by Monday-starting week', async () => {
    const insert = db.prepare(`
      INSERT INTO tasks
        (childId, assignedBy, title, developmentArea, dueDate)
      VALUES (10, 1, ?, 'language', ?)
    `);

    insert.run('This week', '2026-12-01');
    insert.run('Next week', '2026-12-08');

    const res = await asUser(
      app, 'get', `${baseUrl}?week=2026-11-30`, 1, 'parent'
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('This week');
  });

  test('allows a child to complete a task', async () => {
    const result = db.prepare(`
      INSERT INTO tasks
        (childId, assignedBy, title, developmentArea, dueDate)
      VALUES (10, 1, 'Read', 'language', '2026-12-01')
    `).run();

    const res = await asUser(
      app, 'patch', `${baseUrl}/${result.lastInsertRowid}`, 2, 'child'
    ).send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.completedAt).toBeTruthy();
  });

  test('preserves completedAt when a task is completed twice', async () => {
    const result = db.prepare(`
      INSERT INTO tasks
        (childId, assignedBy, title, developmentArea, dueDate,
         status, completedAt)
      VALUES (10, 1, 'Read', 'language', '2026-12-01',
              'done', '2026-12-01 10:00:00')
    `).run();

    const res = await asUser(
      app, 'patch', `${baseUrl}/${result.lastInsertRowid}`, 2, 'child'
    ).send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.completedAt).toBe('2026-12-01 10:00:00');
  });

  test('rejects a parent trying to complete a task', async () => {
    const result = db.prepare(`
      INSERT INTO tasks
        (childId, assignedBy, title, developmentArea, dueDate)
      VALUES (10, 1, 'Read', 'language', '2026-12-01')
    `).run();

    const res = await asUser(
      app, 'patch', `${baseUrl}/${result.lastInsertRowid}`, 1, 'parent'
    ).send({ status: 'done' });

    expect(res.status).toBe(403);
  });
});
