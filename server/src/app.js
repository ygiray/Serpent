const express = require('express');
const cors = require('cors');

// Builds the Express app. The database is passed in so tests can use an in-memory one.
function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Walking skeleton: proves frontend -> backend -> database works end to end.
  app.get('/api/health', (req, res) => {
    const row = db.prepare('SELECT name, version FROM app_info WHERE id = 1').get();
    res.json({ status: 'ok', app: row.name, version: row.version });
  });

  return app;
}

module.exports = { createApp };
