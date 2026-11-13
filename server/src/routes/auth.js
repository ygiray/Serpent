const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const { authenticate } = require('../middleware/auth');

module.exports = {
  path: '/api/auth',
  createRouter(db) {
    const router = express.Router();

    // POST /api/auth/login (FR-M1-01, FR-M1-02)
    router.post('/login', (req, res) => {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = db
        .prepare('SELECT id, email, passwordHash, name, role FROM users WHERE email = ?')
        .get(email);

      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });

    // GET /api/auth/me (NFR-01: passwordHash asla dönmez)
    router.get('/me', authenticate, (req, res) => {
      const user = db
        .prepare('SELECT id, email, name, role FROM users WHERE id = ?')
        .get(req.user.id);

      if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      return res.status(200).json(user);
    });

    return router;
  },
};