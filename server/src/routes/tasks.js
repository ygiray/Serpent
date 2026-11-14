
const express = require('express');
const { authenticate } = require('../middleware/auth');

const AREAS = [
  'language',
  'motor',
  'cognitive',
  'social_emotional',
  'self_care'
];

module.exports = {
  path: '/api/children/:childId/tasks',

  createRouter(db) {
    const router = express.Router({ mergeParams: true });

    function getChild(req, res) {
      const childId = Number(req.params.childId);

      if (!Number.isInteger(childId) || childId <= 0) {
        res.status(400).json({ error: 'Invalid childId' });
        return null;
      }

      const child = db.prepare(
        'SELECT * FROM children WHERE id = ?'
      ).get(childId);

      if (!child) {
        res.status(404).json({ error: 'Child not found' });
        return null;
      }

      return child;
    }

    function hasAccess(user, child) {
      if (user.role === 'parent') {
        return child.parentId === user.id;
      }

      if (user.role === 'child') {
        return child.userId === user.id;
      }

      if (user.role === 'specialist') {
        const link = db.prepare(`
          SELECT id
          FROM specialist_links
          WHERE childId = ? AND specialistId = ?
        `).get(child.id, user.id);

        return Boolean(link);
      }

      return false;
    }

    // Authenticate JWT before checking child access.
    router.use(authenticate);

    router.use((req, res, next) => {
      const child = getChild(req, res);
      if (!child) return;

      if (!hasAccess(req.user, child)) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      req.childRecord = child;
      next();
    });

    // List tasks, optionally filtered by week and assigner.
    router.get('/', (req, res) => {
      const { week, assignedBy } = req.query;

      let sql = 'SELECT * FROM tasks WHERE childId = ?';
      const params = [req.childRecord.id];

      if (week !== undefined) {
        if (
          typeof week !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(week)
        ) {
          return res.status(400).json({
            error: 'Invalid week'
          });
        }

        const start = new Date(`${week}T00:00:00Z`);

        if (
          !Number.isFinite(start.getTime()) ||
          start.toISOString().slice(0, 10) !== week
        ) {
          return res.status(400).json({
            error: 'Invalid week'
          });
        }

        if (start.getUTCDay() !== 1) {
          return res.status(400).json({
            error: 'Week must start on Monday'
          });
        }

        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 7);

        sql += ' AND dueDate >= ? AND dueDate < ?';
        params.push(
          week,
          end.toISOString().slice(0, 10)
        );
      }

      if (assignedBy !== undefined) {
        if (assignedBy !== 'me') {
          return res.status(400).json({
            error: 'Invalid assignedBy filter'
          });
        }

        sql += ' AND assignedBy = ?';
        params.push(req.user.id);
      }

      sql += ' ORDER BY dueDate ASC, id ASC';

      const tasks = db.prepare(sql).all(...params);
      return res.json(tasks);
    });

    // Assign a task (parent or linked specialist).
    router.post('/', (req, res) => {
      if (!['parent', 'specialist'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Only parents and specialists can assign tasks'
        });
      }

      const {
        title,
        description,
        developmentArea,
        dueDate
      } = req.body || {};

      if (
        typeof title !== 'string' ||
        !title.trim() ||
        typeof developmentArea !== 'string' ||
        !AREAS.includes(developmentArea) ||
        typeof dueDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)
      ) {
        return res.status(400).json({
          error: 'Invalid task data'
        });
      }

      const parsedDate = new Date(`${dueDate}T00:00:00Z`);

      if (
        !Number.isFinite(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== dueDate
      ) {
        return res.status(400).json({
          error: 'Invalid dueDate'
        });
      }

      if (
        description !== undefined &&
        description !== null &&
        typeof description !== 'string'
      ) {
        return res.status(400).json({
          error: 'Invalid description'
        });
      }

      const result = db.prepare(`
        INSERT INTO tasks (
          childId,
          assignedBy,
          title,
          description,
          developmentArea,
          dueDate
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.childRecord.id,
        req.user.id,
        title.trim(),
        description ?? null,
        developmentArea,
        dueDate
      );

      const task = db.prepare(
        'SELECT * FROM tasks WHERE id = ?'
      ).get(result.lastInsertRowid);

      return res.status(201).json(task);
    });

    // Mark a task as completed (child only).
    router.patch('/:taskId', (req, res) => {
      const taskId = Number(req.params.taskId);

      if (!Number.isInteger(taskId) || taskId <= 0) {
        return res.status(400).json({
          error: 'Invalid taskId'
        });
      }

      if (req.user.role !== 'child') {
        return res.status(403).json({
          error: 'Only a child can complete a task'
        });
      }

      if (
        !req.body ||
        req.body.status !== 'done' ||
        Object.keys(req.body).length !== 1
      ) {
        return res.status(400).json({
          error: 'Only status "done" is supported'
        });
      }

      const task = db.prepare(`
        SELECT * FROM tasks
        WHERE id = ? AND childId = ?
      `).get(taskId, req.childRecord.id);

      if (!task) {
        return res.status(404).json({
          error: 'Task not found'
        });
      }

      // Already completed: preserve the original completion time.
      if (task.status === 'done') {
        return res.json(task);
      }

      db.prepare(`
        UPDATE tasks
        SET status = 'done',
            completedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND childId = ?
      `).run(taskId, req.childRecord.id);

      const updatedTask = db.prepare(
        'SELECT * FROM tasks WHERE id = ?'
      ).get(taskId);

      return res.json(updatedTask);
    });

    return router;
  }
};
