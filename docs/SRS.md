# Software Requirements Specification (SRS)

**Team name:** Serpent (Group 11)  
**Version:** ☒ First version (Week 6) ☐ Final (Week 10)  
**Last updated:** 2026-11-06

> **How to fill in this file (delete this note before the final version)**
> - Each section has an **Owner** line. Edit only your own section, in your own branch (`SCRUM-xx-...`), and open a PR with Giray as reviewer. Deadline: **Saturday 7 November, 20:00**.
> - Requirement IDs: `FR-M<module>-<two digits>` (e.g. `FR-M1-01`) and `NFR-<two digits>`. Never renumber an ID once it is merged; IDs are used in Jira, commits and tests.
> - Write each requirement as "The system shall …" and make it testable (someone can write a test that passes or fails).
> - Priority: **Must** (required for v1.0) / **Should** (planned) / **Could** (bonus, only after all eight modules pass).
> - Use the same terms everywhere: **Parent**, **Specialist**, **Child**, **linked specialist**, **task**, **event**, **entry** (specialist observation), **document**, **AI summary**.
> - The "Acceptance level" notes under each module are copied from the assignment; your Must requirements together must cover them.

---

## 1. Introduction

**Owner:** Giray (SCRUM-46)

**Purpose of the system:**  
Serpent is a web-based decision support platform that brings together the people who follow a child's development (parents, teachers, psychologists, doctors, special education teachers and coaches) around one shared weekly schedule, task list and record of observations. An AI component summarizes the week's records for each reader according to their role. The AI only supports decisions: every summary is labelled "AI-generated", is linked to the records it is based on, and a human decides what to do.

**Users of the system:**

| User type | Description |
|---|---|
| Parent | Owns the child's data. Sees all of the child's records, links and unlinks specialists, adds events and tasks, uploads documents and reads the parent version of the AI summary. |
| Specialist | A teacher, psychologist, doctor, special education teacher or coach. Works only with the children they are currently linked to: adds events, tasks and dated entries, uploads documents and reads the specialist version of the AI summary. |
| Child | Sees only their own tasks and weekly schedule, and marks their tasks as done. Cannot see specialist entries, documents or AI summaries. |

Roles come from the account; a user does not choose a role at login. All data in the system is synthetic and created by a seed script.

---

## 2. Functional Requirements

### M1 – Login and Roles

**Owner:** İlker (SCRUM-79)

> Acceptance level: Email and password login; each role sees only its own screens. Release: v0.1.

| ID | Requirement | Priority |
|---|---|---|
| FR-M1-01 | | |

### M2 – Linking Specialists

**Owner:** Giray (SCRUM-46)

| ID | Requirement | Priority |
|---|---|---|
| FR-M2-01 | The system shall allow a parent to link a registered specialist to their child by entering the specialist's email address and specialist type (teacher, psychologist, doctor, special education teacher or coach). | Must |
| FR-M2-02 | The system shall reject a link request, show an error message and create no link when the email does not belong to a registered specialist account. | Must |
| FR-M2-03 | The system shall list the specialists linked to a child, with name, email and specialist type, on the parent's "Linked specialists" screen. | Must |
| FR-M2-04 | The system shall allow a parent to unlink a specialist from their child only after the parent confirms the action. | Must |
| FR-M2-05 | The system shall check, on every API request about a child, that a specialist is currently linked to that child, and shall return an error (HTTP 403) and no child data otherwise, even if the specialist's login token is still valid. | Must |
| FR-M2-06 | The system shall allow only the child's parent to link or unlink specialists; such requests from a specialist or a child shall be rejected with HTTP 403. | Must |
| FR-M2-07 | The system shall show a specialist the list of children they are currently linked to. | Must |
| FR-M2-08 | The system shall reject linking a specialist who is already linked to the same child and show an error message. | Should |

### M3 – Weekly Schedule

**Owner:** Rahman (SCRUM-80)

> Acceptance level: Parent and linked specialists add events; events are listed in a weekly view. Release: v0.1.

| ID | Requirement | Priority |
|---|---|---|
| FR-M3-01 | | |

### M4 – Tasks

**Owner:** Kerem (SCRUM-66)

> Acceptance level: Parent and linked specialists assign tasks; the child marks them done; the assigner sees the status. Release: v0.1.

| ID | Requirement | Priority |
|---|---|---|
| FR-M4-01 | | |

### M5 – Specialist Entries

**Owner:** Kerem (SCRUM-66)

> Acceptance level: Linked specialists add dated observations; edited entries are marked "edited"; the child cannot see them. Release: v0.2.

| ID | Requirement | Priority |
|---|---|---|
| FR-M5-01 | | |

### M6 – Documents

**Owner:** Rasül (SCRUM-82)

> Acceptance level: Upload, list and download PDF or image files; the child cannot see them. Release: v0.2.

| ID | Requirement | Priority |
|---|---|---|
| FR-M6-01 | | |

### M7 – Weekly Statistics

**Owner:** Rasül (SCRUM-82)

> Acceptance level: Task completion rate for a selected week, in total and by development area. Release: v0.2.

| ID | Requirement | Priority |
|---|---|---|
| FR-M7-01 | | |

### M8 – Role-based AI Summary

**Owner:** Rahman (SCRUM-80)

> Acceptance level: A summary of the week's records, with separate prompts for parent and specialist; labelled "AI-generated" and linked to its source records. Release: v0.2.
> Remember the safety constraints: the AI never makes decisions or suggests a diagnosis or treatment, receives only data the reader may see, and has a mock mode for tests and CI.

| ID | Requirement | Priority |
|---|---|---|
| FR-M8-01 | | |

---

## 3. Non-Functional Requirements

**Owner:** Giray (SCRUM-46)

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Security | Passwords are stored only as bcrypt hashes; no API response or log contains a password or password hash. |
| NFR-02 | Security | Every API endpoint except login and health requires a valid JWT and returns HTTP 401 without one; every endpoint about a child additionally checks the user's access to that child (parent of the child, currently linked specialist, or the child themself) and returns HTTP 403 otherwise. Verified by API tests for each child endpoint. |
| NFR-03 | AI safety | The AI module receives only records the requesting user is allowed to see, its prompts forbid diagnosis and treatment suggestions, and every summary is shown with the "AI-generated" label and links to its source records. |
| NFR-04 | Testability | The AI module has a mock mode that returns a fixed summary without any network call; all automated tests and the CI pipeline run in mock mode and pass without an API key. |
| NFR-05 | Performance | With the seed data on a developer laptop, each API request responds in under 500 ms and each page loads in under 2 seconds (excluding the time of a real AI call). |

---

## 4. Critical Flows and Acceptance Criteria

**Owner:** Rasül (SCRUM-82). The three flows below are fixed; Rahman draws the same three flows as sequence diagrams in SDD Section 5. Fill in the related requirement IDs and the Given / When / Then criteria.

| Flow | Related requirements | Acceptance criteria |
|---|---|---|
| Flow 1: Login and role-based screens | FR-M1-… | **Given** … **When** … **Then** … |
| Flow 2: Parent links and unlinks a specialist; an unlinked specialist is denied access | FR-M2-01, FR-M2-04, FR-M2-05, … | **Given** … **When** … **Then** … |
| Flow 3: Specialist assigns a task, the child marks it done, the specialist sees the status | FR-M4-… | **Given** … **When** … **Then** … |

---

## 5. Use Case Diagram

**Owner:** Rasül (SCRUM-82)

> Draw it in Mermaid (renders on GitHub). Actors: Parent, Specialist, Child. Show the main use case of each module M1–M8.

---

## 6. Change Log

| Date | Change | By |
|---|---|---|
| 2026-11-06 | First version: skeleton, introduction, FR M2, non-functional requirements | Giray |
