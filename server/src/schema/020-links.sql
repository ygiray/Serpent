-- M2: which specialist is linked to which child (SCRUM-36)
CREATE TABLE IF NOT EXISTS specialist_links (
  id             INTEGER PRIMARY KEY,
  childId        INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  specialistId   INTEGER NOT NULL REFERENCES users(id),
  specialistType TEXT NOT NULL CHECK (specialistType IN
                   ('teacher', 'psychologist', 'doctor', 'special_education_teacher', 'coach')),
  createdAt      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (childId, specialistId)
);