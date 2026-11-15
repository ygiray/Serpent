// M2 – Linking specialists (SCRUM-36)
// GET    /api/children/:childId/links           list the child's linked specialists
// POST   /api/children/:childId/links           link a registered specialist { email, specialistType }
// DELETE /api/children/:childId/links/:linkId   unlink a specialist
const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');

const SPECIALIST_TYPES = ['teacher', 'psychologist', 'doctor', 'special_education_teacher', 'coach'];

module.exports = {
  path: '/api/children/:childId/links',

  createRouter(db) {
    const router = express.Router({ mergeParams: true });

    // Only a logged-in parent may manage links (FR-M2-06) ...
    router.use(authenticate, requireRole('parent'));

    // ... and only for their own child.
    router.use((req, res, next) => {
      const child = db.prepare('SELECT * FROM children WHERE id = ?').get(Number(req.params.childId));
      if (!child) return res.status(404).json({ error: 'Child not found' });
      if (child.parentId !== req.user.id) return res.status(403).json({ error: 'No access to this child' });
      req.child = child;
      next();
    });

    // List linked specialists (FR-M2-03)
    router.get('/', (req, res) => {
      const links = db.prepare(`
        SELECT l.id, l.specialistType, l.createdAt,
               u.id AS specialistId, u.name, u.email
        FROM specialist_links l
        JOIN users u ON u.id = l.specialistId
        WHERE l.childId = ?
        ORDER BY l.createdAt
      `).all(req.child.id);
      res.json(links);
    });

    // Link a specialist by email (FR-M2-01, FR-M2-02, FR-M2-08)
    router.post('/', (req, res) => {
      const { email, specialistType } = req.body || {};
      if (!email || !SPECIALIST_TYPES.includes(specialistType)) {
        return res.status(400).json({ error: 'A valid email and specialist type are required' });
      }

      const specialist = db
        .prepare("SELECT id, name, email FROM users WHERE email = ? AND role = 'specialist'")
        .get(email);
      if (!specialist) {
        return res.status(404).json({ error: 'No registered specialist with this email' });
      }

      const existing = db
        .prepare('SELECT 1 FROM specialist_links WHERE childId = ? AND specialistId = ?')
        .get(req.child.id, specialist.id);
      if (existing) {
        return res.status(409).json({ error: 'This specialist is already linked to the child' });
      }

      const info = db
        .prepare('INSERT INTO specialist_links (childId, specialistId, specialistType) VALUES (?, ?, ?)')
        .run(req.child.id, specialist.id, specialistType);

      res.status(201).json({
        id: Number(info.lastInsertRowid),
        specialistId: specialist.id,
        name: specialist.name,
        email: specialist.email,
        specialistType,
      });
    });

    // Unlink a specialist (FR-M2-04). The confirmation dialog is in the frontend.
    router.delete('/:linkId', (req, res) => {
      const info = db
        .prepare('DELETE FROM specialist_links WHERE id = ? AND childId = ?')
        .run(Number(req.params.linkId), req.child.id);
      if (info.changes === 0) return res.status(404).json({ error: 'Link not found' });
      res.status(204).end();
    });

    return router;
  },
};