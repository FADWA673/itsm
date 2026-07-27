# ITSM Database — MySQL + Prisma

## Configuration

| Paramètre | Valeur |
|---|---|
| Moteur | MySQL 8.0 |
| ORM | Prisma 5.20 |
| Charset | utf8mb4 (UTF-8 complet, supporte les emojis) |
| Collation | utf8mb4_unicode_ci |
| Port Docker | 3306 |

## Démarrage rapide

```bash
# Démarrer MySQL via Docker
docker-compose up db

# Générer le client Prisma
cd backend && npm run db:generate

# Créer et appliquer les migrations
npm run db:migrate

# Peupler la DB avec les données initiales
npm run db:seed
```

## Scripts disponibles

| Script | Commande | Description |
|---|---|---|
| `db:generate` | `prisma generate` | Génère le client Prisma depuis le schéma |
| `db:migrate` | `prisma migrate dev` | Crée et applique une migration (dev) |
| `db:migrate:deploy` | `prisma migrate deploy` | Applique les migrations en production |
| `db:migrate:reset` | `prisma migrate reset` | Reset complet de la DB (⚠️ efface les données) |
| `db:push` | `prisma db push` | Push le schéma sans créer de migration |
| `db:seed` | `tsx prisma/seed.ts` | Peuple la DB avec les données initiales |
| `db:studio` | `prisma studio` | Interface graphique Prisma Studio |

## Variables d'environnement

```env
# En développement Docker (host = nom du service Docker)
DATABASE_URL="mysql://user:password@db:3306/itsm_db"

# En développement local (sans Docker)
DATABASE_URL="mysql://user:password@localhost:3306/itsm_db"
```

## Structure

```
database/
├── migrations/     # Scripts SQL manuels (hors Prisma Migrate)
├── schema/         # Références SQL du schéma
├── seeders/        # Scripts de seeding
└── scripts/        # Utilitaires (backup, reset...)

backend/prisma/
├── schema.prisma   # Schéma Prisma (source de vérité)
├── seed.ts         # Script de seeding TypeScript
└── migrations/     # Migrations générées par Prisma (auto)
```

## Workflow de migration

1. Modifier `backend/prisma/schema.prisma`
2. Lancer `npm run db:migrate` → entrer un nom descriptif
3. Prisma génère le fichier SQL dans `backend/prisma/migrations/`
4. Commiter le fichier de migration avec le code

## Conventions du schéma

- Modèles : **PascalCase** (`User`, `Ticket`)
- Champs : **camelCase** (`firstName`, `createdAt`)
- Tables DB : **snake_case** via `@@map` (`users`, `tickets`)
- IDs : **cuid()** (collision-resistant unique identifier)
- Timestamps : `createdAt` + `updatedAt` sur tous les modèles
- Soft delete : `deletedAt DateTime?` sur les modèles critiques
