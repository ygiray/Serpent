
const { openDb } = require("./db");

const DEMO_PASSWORD_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

function seed() {
  const db = openDb();

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, passwordHash, name, role)
    VALUES (?, ?, ?, ?)
  `);

  const users = [
    {
      email: "parent@serpent.test",
      name: "Demo Parent",
      role: "parent",
    },
    {
      email: "specialist@serpent.test",
      name: "Demo Specialist",
      role: "specialist",
    },
    {
      email: "child@serpent.test",
      name: "Demo Child",
      role: "child",
    },
  ];

  const insertMany = db.transaction((items) => {
    for (const user of items) {
      insertUser.run(
        user.email,
        DEMO_PASSWORD_HASH,
        user.name,
        user.role
      );
    }
  });

  insertMany(users);

  console.log("Seed completed.");
  console.log("Demo users:");
  console.log("  parent@serpent.test");
  console.log("  specialist@serpent.test");
  console.log("  child@serpent.test");
  console.log("Demo password: password");

  db.close();
}

seed();
