// M3 – Weekly schedule (SCRUM-37)
// GET  /api/children/:childId/events?week=YYYY-MM-DD   events of one week (week = date of its Monday)
// POST /api/children/:childId/events                   add an event { title, description?, startsAt, endsAt }
const express = require('express');
// Access control (SCRUM-39): enable when middleware/auth.js and middleware/childAccess.js are in main.
// const { authenticate, requireRole } = require('../middleware/auth');
// const { requireChildAccess } = require('../middleware/childAccess');

// '2026-11-10T09:00' (seconds are optional)
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateTime(value) {
  return typeof value === 'string' && DATE_TIME.test(value) && Number.isFinite(Date.parse(value));
}

// Monday of the current week as 'YYYY-MM-DD' (FR-M3-04: current week by default)
function currentMonday() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  const daysSinceMonday = (d.getUTCDay() + 6) % 7; // Sunday = 0 -> 6
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

module.exports = {
  path: '/api/children/:childId/events',

  createRouter(db) {
    const router = express.Router({ mergeParams: true });

    // router.use(authenticate, requireChildAccess(db));

    router.use((req, res, next) => {
      const childId = Number(req.params.childId);
      if (!Number.isInteger(childId) || childId <= 0) {
        return res.status(400).json({ error: 'Invalid childId' });
      }
      req.childId = childId;
      next();
    });

    // Events of one week, ordered by start time (FR-M3-03, FR-M3-05)
    router.get('/', (req, res) => {
      const week = req.query.week === undefined ? currentMonday() : req.query.week;
      if (typeof week !== 'string' || !DATE.test(week) || !Number.isFinite(Date.parse(week))) {
        return res.status(400).json({ error: 'Invalid week, use YYYY-MM-DD' });
      }

      const start = new Date(`${week}T00:00:00Z`);
      if (start.getUTCDay() !== 1) {
        return res.status(400).json({ error: 'Week must start on Monday' });
      }
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 7);

      // Monday 00:00 (inclusive) to next Monday 00:00 (exclusive)
      const events = db
        .prepare(`
          SELECT * FROM events
          WHERE childId = ? AND startsAt >= ? AND startsAt < ?
          ORDER BY startsAt, id
        `)
        .all(req.childId, week, end.toISOString().slice(0, 10));
      res.json(events);
    });

    // Add an event (FR-M3-01, FR-M3-02). Only parents and linked specialists.
    router.post('/', /* requireRole('parent', 'specialist'), */ (req, res) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      if (!['parent', 'specialist'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Only parents and specialists can add events' });
      }

      const { title, description, startsAt, endsAt } = req.body || {};

      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (description !== undefined && description !== null && typeof description !== 'string') {
        return res.status(400).json({ error: 'Invalid description' });
      }
      if (!isValidDateTime(startsAt) || !isValidDateTime(endsAt)) {
        return res.status(400).json({ error: 'startsAt and endsAt are required, use YYYY-MM-DDTHH:MM' });
      }
      if (Date.parse(endsAt) <= Date.parse(startsAt)) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      const info = db
        .prepare(`
          INSERT INTO events (childId, createdBy, title, description, startsAt, endsAt)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(req.childId, req.user.id, title.trim(), description || null, startsAt, endsAt);

      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(event);
    });

    return router;
  },
};
