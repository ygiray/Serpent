-- M3: events in a child's weekly schedule (SCRUM-37)
-- startsAt / endsAt are local date-times like '2026-11-10T09:00'.
-- Text in this format sorts in time order, so the week query can compare strings.
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY,
  childId     INTEGER NOT NULL,
  createdBy   INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  startsAt    TEXT NOT NULL,
  endsAt      TEXT NOT NULL,
  createdAt   TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (endsAt > startsAt)
);

CREATE INDEX IF NOT EXISTS idx_events_child_start ON events (childId, startsAt);
