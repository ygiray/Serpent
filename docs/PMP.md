# Project Management Plan (PMP)

**Team:** Serpent (Group 11, Section 1)  
**Last updated:** 2026-11-03

| Section | Content | Required by | Status |
|---|---|---|---|
| PMP-1 | Project, Jira setup, team and roles | Week 5 | Done |
| PMP-2 | Work packages (epics) and sprint plan | Week 5 / 6 | Done |
| PMP-3 | Progress review: mid-term (v0.1) | Week 7 | Not started |
| PMP-4 | Progress review: v0.2 | Week 9 | Not started |
| PMP-5 | Progress review: final (v1.0) | Week 11 | Not started |
| PMP-6 | Retrospective | Week 12 | Not started |

---

## PMP-1. Project and Team

### Project and Jira Setup

**Project in one sentence:** A web-based decision support platform where parents and the specialists they link (teachers, psychologists, doctors, coaches) share one schedule, task list and observation record for a child, with an AI summary that supports, but never makes, decisions.  
**Jira project key:** SCRUM  
**Jira board link:** https://serpent0seng383.atlassian.net/jira/software/projects/SCRUM/boards/1  
**GitHub repository:** https://github.com/ygiray/Serpent  
**CI pipeline:** https://github.com/ygiray/Serpent/actions

### Team and Roles

| Name | Jira / GitHub username | Role |
|---|---|---|
| Yusuf Giray Çakıcı | ygiray | Project Manager and developer (full stack): Jira board, PMP; owner of M2 |
| İlker Bulut | ilkerbdev | Developer (full stack), team contact person; owner of M1 |
| Kerem Elmacı | keremelmaci | Developer (full stack); owner of M4, M5 |
| Rahman Ateş | rahmanats10 | Developer (full stack); owner of M3, M8 |
| Rasül Hakan Fidan | RHF29 | Tester and developer (full stack): test planning, weekly meeting notes; owner of M6, M7 |

### Working Agreements

- Every task has exactly one assignee and belongs to one epic.
- Commit messages and branch names start with the Jira key, e.g. `SCRUM-12 Add login API`, branch `SCRUM-12-login-api`.
- All changes go to `main` through a pull request reviewed by at least one other member.
- A task is **Done** only when its pull request is merged into `main`.
- Weekly team meeting; notes are committed to `docs/meetings/`.
- Every member owns at least one module and writes its requirements (SRS), design part (SDD), code and tests.

---

## PMP-2. Plan

### Work Packages (Epics)

| Epic | Owner | Number of tasks | Planned sprint(s) |
|---|---|---|---|
| M1 – Login and roles | İlker Bulut | 9 | Sprint 1, 2, 4 |
| M2 – Linking specialists | Yusuf Giray Çakıcı | 6 | Sprint 2, 4 |
| M3 – Weekly schedule | Rahman Ateş | 5 | Sprint 2, 4 |
| M4 – Tasks | Kerem Elmacı | 6 | Sprint 2, 4 |
| M5 – Specialist entries | Kerem Elmacı | 5 | Sprint 3, 4 |
| M6 – Documents | Rasül Hakan Fidan | 5 | Sprint 3, 4 |
| M7 – Weekly statistics | Rasül Hakan Fidan | 4 | Sprint 3, 4 |
| M8 – Role-based AI summary | Rahman Ateş | 6 | Sprint 3, 4 |
| SRS – Requirements specification | Yusuf Giray Çakıcı | 5 | Sprint 1 |
| DESIGN – Software design document | Yusuf Giray Çakıcı | 5 | Sprint 1 |
| PMP-1 … PMP-6 | Yusuf Giray Çakıcı | 3 each | Sprint 1 (PMP-1, 2), 2 (PMP-3), 3 (PMP-4), 4 (PMP-5, 6) |

### Sprint Plan

Two-week sprints aligned with the course schedule.

| Sprint | Weeks | Sprint goal | Ends with |
|---|---|---|---|
| Sprint 1 | Week 5–6 (24 Oct – 7 Nov) | Set up repo, CI and a walking skeleton (React → Express → SQLite); write SRS and SDD | Walking skeleton (v0.0), Week 5; SRS + SDD, Week 6 |
| Sprint 2 | Week 7–8 (8 Nov – 21 Nov) | Login with roles, linking specialists, weekly schedule and tasks (M1–M4); first E2E test in CI | Release v0.1, mid-term (Week 8) |
| Sprint 3 | Week 9–10 (22 Nov – 5 Dec) | Specialist entries, documents, weekly statistics and AI summary (M5–M8); branch coverage ≥ 40%; E2E tests for 3 critical flows | Release v0.2, Week 10 |
| Sprint 4 | Week 11–12 (6 Dec – 19 Dec) | Fix bugs found in testing, E2E test for each of M1–M8, branch coverage ≥ 60%, final report and demo | Release v1.0, final (Week 12) |

---

## PMP-3. Progress Review: Mid-term (v0.1)

**Jira board screenshot:**  

| Epic | Planned for this point | Status (Done / In progress / Not started) |
|---|---|---|
| | | |

**Changes to the plan (if any):**

---

## PMP-4. Progress Review: v0.2

**Jira board screenshot:**  

| Epic | Planned for this point | Status (Done / In progress / Not started) |
|---|---|---|
| | | |

**Changes to the plan (if any):**

---

## PMP-5. Progress Review: Final (v1.0)

**Jira board screenshot:**  

| Epic | Planned for this point | Status (Done / In progress / Not started) |
|---|---|---|
| | | |

**Changes to the plan (if any):**

---

## PMP-6. Retrospective

- What worked well in using Jira:
- What we would do differently:
