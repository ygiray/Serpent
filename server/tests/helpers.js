const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const { openDb } = require('../src/db');
const { JWT_SECRET } = require('../src/config');

// A fresh app with an empty in-memory database for each test.
function createTestApp() {
  const db = openDb(':memory:');
  return { app: createApp(db), db };
}

// A valid login token for a user, in the same format as POST /api/auth/login returns.
function makeToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { createTestApp, makeToken };
