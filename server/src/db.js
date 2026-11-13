const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.join(__dirname, 'schema');

// Opens the SQLite database. Tests use ':memory:' so they never touch the real file.
// Every module adds its tables as its own file in src/schema/ (e.g. 030-events.sql).
// Files run in name order, so tables that others reference (users, children) come first.
function openDb(file = process.env.DB_FILE || path.join(__dirname, '..', 'serpent.db')) {
  const db = new Database(file);
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_info (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL
    );
        CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('parent', 'specialist', 'child')),
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  db.prepare(
    "INSERT OR IGNORE INTO app_info (id, name, version) VALUES (1, 'Serpent', '0.0.0')"
  ).run();

  const schemaFiles = fs.existsSync(SCHEMA_DIR)
    ? fs.readdirSync(SCHEMA_DIR).filter((f) => f.endsWith('.sql')).sort()
    : [];
  for (const f of schemaFiles) {
    db.exec(fs.readFileSync(path.join(SCHEMA_DIR, f), 'utf8'));
  }
  return db;
}

module.exports = { openDb };
