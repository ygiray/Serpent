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
| FR-M3-01 | The system shall allow a parent or a linked specialist to add an event to a child's schedule with a title, date, start time, end time and an optional description. | Must |
| FR-M3-02 | The system shall not save an event that has no title or whose end time is not later than its start time, and shall show an error message. | Must |
| FR-M3-03 | The system shall display the events of a selected week in a weekly view, grouped by day from Monday to Sunday and sorted by start time. | Must |
| FR-M3-04 | The system shall open the weekly view on the current week and let the user go to the previous or next week. | Should |
| FR-M3-05 | The system shall show a child their own weekly schedule and upcoming events in read-only mode, without add, edit or delete options. | Must |
| FR-M3-06 | The system shall allow only the user who created an event to edit or delete it. | Should |
| FR-M3-07 | The system shall provide a monthly view of the schedule. | Could |

### M4 – Tasks

**Owner:** Kerem (SCRUM-66)

> Acceptance level: Parent and linked specialists assign tasks; the child marks them done; the assigner sees the status. Release: v0.1.

| ID | Requirement | Priority |
|---|---|---|
| FR-M4-01 | A parent or a specialist linked to the child can create a task by entering its title, description, development area, and due date. | Must |
| FR-M4-02 | The system must display an error and prevent task creation if the title, development area, or due date is missing. | Must |
| FR-M4-03 | Every newly assigned task starts with a pending status, and the system records who assigned it. | Must |
| FR-M4-04 | A child can view their own tasks, including the title, description, due date, and current status. | Must |
| FR-M4-05 | A child can complete their own pending task, and the system records when it was completed. | Must |
| FR-M4-06 | Parents and linked specialists can check the current status of tasks they assigned to a child. | Must |
| FR-M4-07 | A parent can view all tasks assigned to their child, regardless of who created them. | Must |
| FR-M4-08 | As an optional feature, an assigner can set a task to repeat on a regular schedule, such as daily or weekly. | Could |

### M5 – Specialist Entries

**Owner:** Kerem (SCRUM-66)

> Acceptance level: Linked specialists add dated observations; edited entries are marked "edited"; the child cannot see them. Release: v0.2.

| ID | Requirement | Priority |
|---|---|---|
| FR-M5-01 | A specialist linked to a child can write an observation with a date, text, and an optional development area. | Must |
| FR-M5-02 | Parents and linked specialists can view the child's observations, ordered from newest to oldest, with the date, author's name, and specialist type. | Must |
| FR-M5-03 | Only the specialist who created an observation can edit it; editing attempts by other users are denied with HTTP 403. | Must |
| FR-M5-04 | When an observation is updated, the system displays an edited label and records the time of the most recent change. | Must |
| FR-M5-05 | Children cannot view specialist observations, and the API denies their requests with HTTP 403. | Must |
| FR-M5-06 | As an optional feature, the system can store and display the complete edit history of an observation. | Could |

### M6 – Documents

**Owner:** Rasül (SCRUM-82)

> Acceptance level: Upload, list and download PDF or image files; the child cannot see them. Release: v0.2.

| ID | Requirement | Priority |
|---|---|---|
| FR-M6-01 | The system shall allow a parent or a linked specialist to upload a document about a child as a PDF, JPEG or PNG file. | Must |
| FR-M6-02 | The system shall reject files of unsupported types or files larger than 10 MB and show an error message. | Must |
| FR-M6-03 | The system shall list the child's documents with file name, file type, uploader and upload date for the parent and linked specialists. | Must |
| FR-M6-04 | The system shall allow the parent and linked specialists to view a document in the browser and download it. | Must |
| FR-M6-05 | The system shall not show documents to the child; document requests from a child account shall be rejected with HTTP 403. | Must |
| FR-M6-06 | The system shall allow the uploader to choose which linked specialists can see a document. | Could |

### M7 – Weekly Statistics

**Owner:** Rasül (SCRUM-82)

> Acceptance level: Task completion rate for a selected week, in total and by development area. Release: v0.2.

| ID | Requirement | Priority |
|---|---|---|
| FR-M7-01 | The system shall allow the parent and linked specialists to select a week for the child's statistics; the current week shall be selected by default. | Must |
| FR-M7-02 | The system shall show the task completion rate for the selected week as a percentage: tasks with a due date in that week and status "done", divided by all tasks with a due date in that week. | Must |
| FR-M7-03 | The system shall show the completion rate of the selected week separately for each development area that has at least one task in that week. | Must |
| FR-M7-04 | The system shall show "No tasks this week" instead of a percentage when the selected week has no tasks. | Should |
| FR-M7-05 | The system shall not show weekly statistics to the child. | Should |

### M8 – Role-based AI Summary

**Owner:** Rahman (SCRUM-80)

> Acceptance level: A summary of the week's records, with separate prompts for parent and specialist; labelled "AI-generated" and linked to its source records. Release: v0.2.
> Remember the safety constraints: the AI never makes decisions or suggests a diagnosis or treatment, receives only data the reader may see, and has a mock mode for tests and CI.

| ID | Requirement | Priority |
|---|---|---|
| FR-M8-01 | The system shall allow a parent or a linked specialist to request an AI summary of a child's records for a selected week. | Must |
| FR-M8-02 | The system shall send to the AI service only the records of the selected week that the requesting user is allowed to see (tasks with their status, events and entries), without names, email addresses or other account data. | Must |
| FR-M8-03 | The system shall use a different prompt for each reader: everyday, simple language for parents and short, professional language for specialists. | Must |
| FR-M8-04 | The system shall display every summary with an "AI-generated" label and links to the records the summary is based on. | Must |
| FR-M8-05 | The prompts shall tell the AI to use only the given records, to state when information is missing, and never to make decisions or suggest a diagnosis or treatment. | Must |
| FR-M8-06 | The system shall let the reader mark a summary as "helpful" or "incorrect" and shall save this feedback. | Must |
| FR-M8-07 | The system shall show an error message when the AI service is not available, while all other functions keep working. | Must |
| FR-M8-08 | The system shall not show AI summaries to a child; summary requests from a child account shall be rejected with HTTP 403. | Must |
| FR-M8-09 | The system shall suggest new tasks based on the week's records as pending suggestions that a human must accept or reject. | Could |

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
| Flow 1: Login and role-based screens | FR-M1-01, FR-M1-02, FR-M1-03, FR-M1-04, FR-M1-05 | **Given** a seeded parent account and a seeded child account **When** the parent logs in with the correct email and password **Then** the parent's weekly dashboard is shown. **When** the child logs in **Then** only the "My tasks" screen and the child's menu are shown, and opening a parent screen redirects back to "My tasks". **When** a user enters a wrong password **Then** an error message is shown and the user stays on the login screen. |
| Flow 2: Parent links and unlinks a specialist; an unlinked specialist is denied access | FR-M2-01, FR-M2-02, FR-M2-03, FR-M2-04, FR-M2-05, FR-M2-07 | **Given** a logged-in parent and a registered specialist who is not linked to the child **When** the parent enters the specialist's email and type and saves **Then** the specialist appears in the parent's linked-specialists list and the child appears in the specialist's list of children. **When** the parent enters an unregistered email **Then** an error is shown and no link is created. **When** the parent unlinks the specialist and confirms **Then** the specialist's next request about the child returns HTTP 403 and no child data, although the specialist's token is still valid. |
| Flow 3: Specialist assigns a task, the child marks it done, the specialist sees the status | FR-M4-01, FR-M4-03, FR-M4-04, FR-M4-05, FR-M4-06 | **Given** a specialist linked to a child **When** the specialist assigns the task "Read for 20 minutes" with development area Language and a due date this week **Then** the child sees the task in "My tasks" with status "pending". **When** the child marks the task as done **Then** the specialist's list of assigned tasks shows the task with status "done". |

---

## 5. Use Case Diagram

**Owner:** Rasül (SCRUM-82)
```mermaid
flowchart LR
    Parent[Parent]
    Specialist[Specialist]
    Child[Child]

    subgraph Serpent
        M1([M1: Log in / log out])
        M2([M2: Link / unlink specialist and view linked children])
        M3([M3: View weekly schedule and add events])
        M4([M4: Assign tasks, mark done and view task status])
        M5([M5: Add / edit specialist entries])
        M6([M6: Upload / view / download documents])
        M7([M7: View weekly statistics])
        M8([M8: Request AI summary])
    end

    Parent --> M1
    Parent --> M2
    Parent --> M3
    Parent --> M4
    Parent --> M6
    Parent --> M7
    Parent --> M8

    Specialist --> M1
    Specialist --> M2
    Specialist --> M3
    Specialist --> M4
    Specialist --> M5
    Specialist --> M6
    Specialist --> M7
    Specialist --> M8

    Child --> M1
    Child --> M3
    Child --> M4
```

> Draw it in Mermaid (renders on GitHub). Actors: Parent, Specialist, Child. Show the main use case of each module M1–M8.

---

## 6. Change Log

| Date | Change | By |
|---|---|---|
| 2026-11-06 | First version: skeleton, introduction, FR M2, non-functional requirements | Giray |
