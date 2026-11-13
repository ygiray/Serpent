
const express = require('express');

module.exports = {
  path: '/api/children/:childId/tasks',

  createRouter(db) {
    const router = express.Router({ mergeParams: true });

    // GET /api/children/:childId/tasks
    router.get('/', (req, res) => {
      const childId = Number(req.params.childId);

      if (!Number.isInteger(childId) || childId <= 0) {
        return res.status(400).json({ error: 'Invalid childId' });
      }

      const { week, assignedBy } = req.query;
      let sql = 'SELECT * FROM tasks WHERE childId = ?';
      const params = [childId];

      if (week !== undefined) {
        if (
          typeof week !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(week) ||
          !Number.isFinite(Date.parse(week))
        ) {
          return res.status(400).json({ error: 'Invalid week' });
        }

        const start = new Date(`${week}T00:00:00Z`);

        if (start.getUTCDay() !== 1) {
          return res.status(400).json({
            error: 'Week must start on Monday'
          });
        }

        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 7);

        sql += ' AND dueDate >= ? AND dueDate < ?';
        params.push(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        );
      }

      if (assignedBy !== undefined) {
        // "me" requires an authenticated user.
        if (assignedBy !== 'me') {
          return res.status(400).json({
            error: 'Invalid assignedBy filter'
          });
        }

        if (!req.user || !req.user.id) {
          return res.status(401).json({
            error: 'Authentication required'
          });
        }

        sql += ' AND assignedBy = ?';
        params.push(req.user.id);
      }

      sql += ' ORDER BY dueDate ASC, id ASC';

      const tasks = db.prepare(sql).all(...params);
      return res.json(tasks);
    });

    // POST /api/children/:childId/tasks
    router.post('/', (req, res) => {
      const childId = Number(req.params.childId);
      const {
        title,
        description,
        developmentArea,
        dueDate
      } = req.body || {};

      if (!Number.isInteger(childId) || childId <= 0) {
        return res.status(400).json({ error: 'Invalid childId' });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      if (!['parent', 'specialist'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Only parents and specialists can assign tasks'
        });
      }

      if (
        typeof title !== 'string' ||
        !title.trim() ||
        typeof developmentArea !== 'string' ||
        !developmentArea.trim() ||
        typeof dueDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
        !Number.isFinite(Date.parse(dueDate))
      ) {
        return res.status(400).json({
          error: 'Invalid task data'
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
        childId,
        req.user.id,
        title.trim(),
        description ?? null,
        developmentArea.trim(),
        dueDate
      );

      const task = db.prepare(
        'SELECT * FROM tasks WHERE id = ?'
      ).get(result.lastInsertRowid);

      return res.status(201).json(task);
    });

    // PATCH /api/children/:childId/tasks/:taskId
    router.patch('/:taskId', (req, res) => {
      const childId = Number(req.params.childId);
      const taskId = Number(req.params.taskId);

      if (
        !Number.isInteger(childId) ||
        childId <= 0 ||
        !Number.isInteger(taskId) ||
        taskId <= 0
      ) {
        return res.status(400).json({
          error: 'Invalid task ID'
        });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: 'Authentication required'
        });
      }

      const task = db.prepare(
        'SELECT * FROM tasks WHERE id = ? AND childId = ?'
      ).get(taskId, childId);

      if (!task) {
        return res.status(404).json({
          error: 'Task not found'
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

      if (req.user.role !== 'child') {
        return res.status(403).json({
          error: 'Only a child can complete a task'
        });
      }

      if (req.user.id !== childId) {
        return res.status(403).json({
          error: 'Cannot complete another child’s task'
        });
      }

      db.prepare(`
        UPDATE tasks
        SET status = 'done',
            completedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND childId = ?
      `).run(taskId, childId);

      const updatedTask = db.prepare(
        'SELECT * FROM tasks WHERE id = ?'
      ).get(taskId);

      return res.json(updatedTask);
    });

    return router;
  }
};
