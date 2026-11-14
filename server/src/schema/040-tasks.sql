CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    childId INTEGER NOT NULL,
    assignedBy INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    developmentArea TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'done')),
    completedAt TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (childId) REFERENCES children(id),
    FOREIGN KEY (assignedBy) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_childId
ON tasks(childId);
