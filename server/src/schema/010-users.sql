CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY,
  email        TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('parent', 'specialist', 'child')),
  createdAt    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS children (
  id        INTEGER PRIMARY KEY,
  parentId  INTEGER NOT NULL REFERENCES users(id),
  userId    INTEGER UNIQUE REFERENCES users(id),
  name      TEXT NOT NULL,
  birthDate TEXT
);
