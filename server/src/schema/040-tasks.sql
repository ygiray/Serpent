
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  childId INTEGER NOT NULL
    REFERENCES children(id) ON DELETE CASCADE,

  assignedBy INTEGER NOT NULL
    REFERENCES users(id),

  title TEXT NOT NULL,
  description TEXT,

  developmentArea TEXT NOT NULL
    CHECK (
      developmentArea IN (
        'language',
        'motor',
        'cognitive',
        'social_emotional',
        'self_care'
      )
    ),

  dueDate TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'done')),

  completedAt TEXT,

  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_childId
ON tasks(childId);
