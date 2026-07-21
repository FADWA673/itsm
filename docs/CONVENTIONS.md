# ITSM Project — Naming & Structure Conventions

## Folder structure

- `backend/src/config/` — environment & app configuration
- `backend/src/modules/` — feature modules (ticketing, users, assets...), each self-contained
- `backend/src/controllers/` — route handlers
- `backend/src/services/` — business logic
- `backend/src/repositories/` — data access layer
- `backend/src/middleware/` — Express middlewares
- `backend/src/utils/` — shared helper functions
- `backend/src/types/` — shared TypeScript types

- `frontend/src/components/` — reusable UI components
- `frontend/src/pages/` — route-level views
- `frontend/src/layouts/` — page layout wrappers
- `frontend/src/features/` — feature-based modules (ticket management, dashboards...)
- `frontend/src/services/` — API calls (axios)
- `frontend/src/hooks/` — custom React hooks
- `frontend/src/store/` — global state management
- `frontend/src/utils/` — shared helper functions

- `database/prisma/` — Prisma schema, generated client, auto-managed migrations
- `database/migrations/` — manual SQL scripts (if ever needed outside Prisma)
- `database/scripts/` — database utility scripts (backup, reset, etc.)

## Naming conventions

- **Files**: kebab-case for non-component files (`ticket-service.ts`), PascalCase for React components (`TicketList.tsx`)
- **Folders**: kebab-case (`use-cases`, `ticket-management`)
- **Branches**: `feature/ITSM-XXX-short-description`
- **Commits**: Conventional Commits style — `feat:`, `fix:`, `chore:`, `docs:`
- **Variables/functions**: camelCase
- **Classes/Types/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE

## Backend modules (future convention)

Each module under `backend/src/modules/<module-name>/` will contain its own:
```
modules/ticket/
├── ticket.controller.ts
├── ticket.service.ts
├── ticket.repository.ts
└── ticket.routes.ts
```
## Commit message convention (Conventional Commits)

Format: `<type>(<scope>): <description>`

Types allowed: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(backend): add ticket creation endpoint`
- `fix(frontend): correct login form validation`
- `chore: update dependencies`

Enforced automatically via Commitlint + Husky `commit-msg` hook.

## Pre-commit checks

Husky runs ESLint on `backend/` and `frontend/` before every commit.
A commit is blocked if linting fails — fix the reported issues and commit again.

## Branch naming

Format: `feature/SCRUM-XXX-short-description`

Examples:
- `feature/SCRUM-30-dev-standards`
- `fix/SCRUM-45-login-bug`

## Environment variables standards

- Never commit `.env` files — only `.env.example` (with placeholder values) is tracked in Git.
- Each package (`backend/`, `frontend/`, `database/`) has its own `.env.example` documenting required variables.
- Development and production use separate `.env` files (never shared or committed).