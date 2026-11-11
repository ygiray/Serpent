# Database schema

One `.sql` file per module. `src/db.js` runs every file in name order when the database opens.

| File | Tables | Owner |
|---|---|---|
| `010-users.sql` | `users`, `children` | SCRUM-27 |
| `020-links.sql` | `specialist_links` | SCRUM-36 |
| `030-events.sql` | `events` | SCRUM-37 |
| `040-tasks.sql` | `tasks` | SCRUM-68 |

Rules: use `CREATE TABLE IF NOT EXISTS`; names follow the ER diagram in `docs/SDD.md` Section 3; a table may only reference tables from files with a lower number.
