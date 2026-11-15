const bcrypt = require('bcryptjs');
const { openDb } = require('./db');

const db = openDb();
const hash = bcrypt.hashSync('password', 10);

const addUser = db.prepare(
  'INSERT OR IGNORE INTO users (email, passwordHash, name, role) VALUES (?, ?, ?, ?)'
);

const idOf = (email) =>
  db.prepare('SELECT id FROM users WHERE email = ?').get(email).id;

db.transaction(() => {
  addUser.run('parent@serpent.test', hash, 'Ayşe Demo', 'parent');
  addUser.run('teacher@serpent.test', hash, 'Mehmet Teacher', 'specialist');
  addUser.run(
    'psychologist@serpent.test',
    hash,
    'Zeynep Psychologist',
    'specialist'
  );
  addUser.run('child@serpent.test', hash, 'Can Demo', 'child');

  db.prepare(`
    INSERT OR IGNORE INTO children
      (id, parentId, userId, name, birthDate)
    VALUES (1, ?, ?, ?, ?)
  `).run(
    idOf('parent@serpent.test'),
    idOf('child@serpent.test'),
    'Can Demo',
    '2016-04-12'
  );
})();

console.log('Seed completed. Password for all demo users: password');
db.close();
