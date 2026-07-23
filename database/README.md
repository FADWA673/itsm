# ITSM Database

This folder holds database-related resources outside of Prisma (Prisma now lives in `backend/prisma/`).

- `schema/` — raw SQL schema references or exports
- `migrations/` — manual SQL migration scripts (if needed outside Prisma Migrate)
- `seeders/` — data seeding scripts
- `scripts/` — database utility scripts (backup, reset, etc.)

Prisma schema, client generation, and migrations are managed in `backend/prisma/`.