const bcrypt = require('bcryptjs');

function seedFixtures(db) {
  const hash = bcrypt.hashSync('password', 4);

  const addUser = db.prepare(
    'INSERT INTO users (email, passwordHash, name, role) VALUES (?, ?, ?, ?)'
  );

  const user = (email, name, role) => ({
    id: Number(addUser.run(email, hash, name, role).lastInsertRowid),
    role
  });

  const parent = user('parent@test.com', 'Test Parent', 'parent');
  const otherParent = user('other-parent@test.com', 'Other Parent', 'parent');
  const specialist = user(
    'specialist@test.com',
    'Linked Specialist',
    'specialist'
  );
  const otherSpecialist = user(
    'other-specialist@test.com',
    'Unlinked Specialist',
    'specialist'
  );
  const childUser = user('child@test.com', 'Test Child', 'child');

  const childId = Number(
    db
      .prepare(
        'INSERT INTO children (parentId, userId, name) VALUES (?, ?, ?)'
      )
      .run(parent.id, childUser.id, 'Test Child').lastInsertRowid
  );

  return {
    parent,
    otherParent,
    specialist,
    otherSpecialist,
    childUser,
    childId
  };
}

module.exports = { seedFixtures };
