# ITSM Database

MySQL 8.x + Prisma ORM.

## Setup

1. Copy `.env.example` to `.env` and fill in your MySQL credentials.
2. Start MySQL: `docker compose up -d mysql` (from project root).
3. Run:
   \`\`\`
   npm install
   npx prisma generate
   \`\`\`

## Migrations

\`\`\`
npx prisma migrate dev --name init
\`\`\`

Business models (User, Ticket, Asset, etc.) are out of scope for this initial setup and will be added in future tickets.