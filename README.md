# ITSM Platform

Modern IT Service Management platform for a 7-company group.
Employees can request IT support via Web Portal, WhatsApp, or Email.
AI + n8n automation analyzes requests, creates tickets, classifies issues, and routes them to the right IT team.

## Structure

- `backend/` – Node.js + Express + TypeScript, Clean Architecture
- `frontend/` – React + TypeScript + Vite
- `database/` – MySQL schema & migrations
- `docs/` – Technical documentation
- `docker/` – Docker configuration
- `scripts/` – Automation scripts
- `.github/workflows/` – CI/CD

## Getting started

```bash
cp .env.example .env
cd backend && npm install
npm run build --workspaces --if-present
```