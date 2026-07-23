# ITSM Platform

Modern IT Service Management platform for a 7-company group.
Employees can request IT support via Web Portal, WhatsApp, or Email.
AI + n8n automation analyzes requests, creates tickets, classifies issues, and routes them to the right IT team.

## Structure

- `backend/` – Node.js + Express + TypeScript API, includes Prisma ORM (`backend/prisma/`)
- `frontend/` – React + TypeScript + Vite client
- `database/` – Non-Prisma database resources (raw schema, manual migrations, seeders, scripts)
- `docs/` – Technical documentation (`architecture/`, `api/`, `guides/`, `diagrams/`)
- `docker/` – Docker configuration per service (`backend/`, `frontend/`, `database/`)
- `scripts/` – Automation scripts
- `.github/workflows/` – CI/CD

## Getting started

### 1. Start the database
\`\`\`bash
docker compose up -d mysql
\`\`\`

### 2. Backend (includes Prisma)
\`\`\`bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npm run dev
\`\`\`
API available at `http://localhost:3000/api/health`

### 3. Frontend
\`\`\`bash
cd frontend
npm install
cp .env.example .env
npm run dev
\`\`\`
App available at `http://localhost:5173`

## Documentation

See `docs/index.md` for the full documentation index, and `docs/CONVENTIONS.md` for coding standards and Git conventions.