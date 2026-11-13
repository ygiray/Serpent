const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, 'routes');

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

  // Every module adds its own file in src/routes/ that exports { path, createRouter }.
  // The file is mounted here automatically, so nobody has to edit this file.
  const routeFiles = fs.existsSync(ROUTES_DIR)
    ? fs.readdirSync(ROUTES_DIR).filter((f) => f.endsWith('.js')).sort()
    : [];
  for (const f of routeFiles) {
    const { path: mountPath, createRouter } = require(path.join(ROUTES_DIR, f));
    app.use(mountPath, createRouter(db));
  }

  // Unknown API paths
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  // Errors thrown in a route (Express 5 also catches async errors) end up here.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
