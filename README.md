# Serpent – AI-Assisted Child Development Platform

SENG 383 Software Project III – Fall 2026 – Team Serpent (Group 11)

A web-based decision support platform where parents and linked specialists share one schedule,
task list and observation record for a child. An AI summary supports, but never makes, decisions.

**Stack:** React (Vite) · Node.js + Express · SQLite · Jest + Supertest · Vitest · GitHub Actions

**Jira board:** https://serpent0seng383.atlassian.net/jira/software/projects/SCRUM/boards/1

## Requirements

- Node.js 22 or newer (`node -v` to check)
- npm (comes with Node.js)

## Install

```bash
git clone https://github.com/ygiray/Serpent.git
cd Serpent
cd server && npm install
cd ../client && npm install
```

## Run

Open two terminals.

**Terminal 1 – backend** (http://localhost:3001):

```bash
cd server
npm run dev
```

**Terminal 2 – frontend** (http://localhost:5173):

```bash
cd client
npm run dev
```

Open http://localhost:5173 in the browser. You should see **Backend status: ok**.

## Test

```bash
cd server && npm test    # backend: Jest + Supertest, with coverage
cd client && npm test    # frontend: Vitest, with coverage
```

Tests also run automatically on every push and pull request (GitHub Actions).

## Project structure

```
client/     React frontend (Vite)
server/     Express backend + SQLite
docs/       SRS, SDD, PMP, meeting notes
.github/    CI workflow
```

## Team

| Name | GitHub | Role |
|---|---|---|
| Yusuf Giray Çakıcı | ygiray | Project Manager |
| İlker Bulut | ilkerbdev | Developer |
| Kerem Elmacı | keremelmaci | Developer |
| Rahman Ateş | rahmanats10 | Developer |
| Rasül Hakan Fidan | RHF29 | Tester |
