const Database = require('better-sqlite3');
const path = require('path');

// Opens the SQLite database. Tests use ':memory:' so they never touch the real file.
function openDb(file = process.env.DB_FILE || path.join(__dirname, '..', 'serpent.db')) {
  const db = new Database(file);
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
  return db;
}

module.exports = { openDb };
