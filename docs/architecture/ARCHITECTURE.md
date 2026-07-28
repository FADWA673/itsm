# Architecture Technique — ITSM Platform

## Vue d'ensemble

ITSM Platform est une solution de gestion de tickets IT (IT Service Management) multi-tenant, construite sur une architecture moderne découplée : API REST (backend) + SPA (frontend) + MySQL.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                    http://localhost:5173                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────────┐
│              Frontend — React 19 / Vite 8                    │
│  Router │ MUI Theme │ Zustand Store │ Axios API Client       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST /api/v1/*
┌──────────────────────────▼──────────────────────────────────┐
│              Backend — Node.js 20 / Express 5               │
│  Helmet │ CORS │ Rate Limit │ JWT Auth │ Winston Logger      │
│                                                             │
│  Routes /api/v1 → Controllers → Services → Repositories    │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────────┐
│                   MySQL 8.0 (Docker)                         │
│           itsm_db : organizations, users, ...               │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Technique

| Couche | Technologie | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Backend Framework | Express | 5 |
| Langage | TypeScript | 5.7 (backend) / 6 (frontend) |
| ORM | Prisma | 5.20 |
| Base de données | MySQL | 8.0 |
| Frontend Framework | React | 19 |
| Build Tool | Vite | 8 |
| UI Library | Material UI | 9 |
| State Management | Zustand | latest |
| HTTP Client | Axios | latest |
| Auth | JWT (jsonwebtoken) | 9 |
| Password | bcrypt | 6 |
| Conteneurs | Docker + Docker Compose | latest |
| CI/CD | GitHub Actions | — |

---

## Structure du projet

```
itsm/
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── config/             # Configuration centralisée (env, DB)
│   │   ├── controllers/        # Route handlers
│   │   ├── middlewares/        # Auth, error handler, 404
│   │   ├── modules/            # Modules fonctionnels futurs
│   │   ├── repositories/       # Accès base de données (Prisma)
│   │   ├── routes/v1/          # Routes API versionnées
│   │   ├── services/           # Logique métier
│   │   ├── types/              # Types TypeScript partagés
│   │   ├── utils/              # JWT, bcrypt, logger, audit
│   │   ├── app.ts              # Configuration Express
│   │   └── server.ts           # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma       # Schéma base de données
│   │   ├── seed.ts             # Données initiales
│   │   └── validate.ts         # Script de validation
│   └── Dockerfile
│
├── frontend/                   # SPA React/Vite
│   └── src/
│       ├── components/         # Composants réutilisables
│       │   ├── layout/         # Header, Sidebar, Notifications
│       │   └── ui/             # PageLoader, ErrorBoundary
│       ├── layouts/            # MainLayout, AuthLayout
│       ├── pages/              # Pages de l'application
│       ├── routes/             # AppRouter, ProtectedRoute, paths
│       ├── services/           # Axios API client
│       ├── store/              # Zustand stores (auth, theme, notifications)
│       ├── styles/             # Thème MUI, CSS global
│       └── types/              # Types TypeScript partagés
│
├── database/                   # Scripts SQL et documentation
├── docker/                     # Dockerfiles production (multi-stage)
├── docs/                       # Documentation technique
├── .github/workflows/          # CI/CD GitHub Actions
├── .husky/                     # Git hooks (pre-commit, commit-msg)
└── docker-compose.yml          # Orchestration développement
```

---

## Installation et démarrage

### Prérequis
- Docker Desktop
- Node.js 20+
- Git

### Démarrage rapide (Docker)

```bash
# 1. Cloner le projet
git clone https://github.com/FADWA673/itsm.git
cd itsm
git checkout develop

# 2. Copier les fichiers d'environnement
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

# 3. Lancer tous les services
docker-compose up --build

# 4. Initialiser la base de données (première fois)
docker exec -it itsm-backend npm run db:push
docker exec -it itsm-backend npm run db:seed
```

### URLs

| Service | URL | Description |
|---|---|---|
| Frontend | http://localhost:5173 | Interface utilisateur React |
| Backend API | http://localhost:3000 | API REST Express |
| Health Check | http://localhost:3000/api/v1/health | Statut du système |
| Prisma Studio | http://localhost:5555 | Interface DB (npm run db:studio) |

### Comptes par défaut (développement)

| Rôle | Email | Mot de passe |
|---|---|---|
| Super Admin | admin@logismar.com | Admin@1234 |
| User | user@logismar.com | User@1234 |

---

## Architecture Backend

### Pattern Clean Architecture

```
Request → Route → Middleware → Controller → Service → Repository → DB
                    ↓
              Auth / Validation
```

### Middlewares (ordre d'application)

1. `helmet()` — headers de sécurité HTTP
2. `rateLimit()` — protection brute-force
3. `cors()` — politique cross-origin
4. `express.json()` — parsing JSON
5. `morgan()` — logging HTTP
6. Routes `/api/v1/*`
7. `notFoundHandler` — 404
8. `errorHandler` — erreurs centralisées

### API Versioning

Toutes les routes sont préfixées `/api/v1/` :

| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/health` | Non | Health check complet |

Les futurs modules ajouteront leurs routes dans `src/routes/v1/index.ts`.

### Sécurité

- **JWT** : access token (7j) + refresh token (30j), algorithme HS256
- **Bcrypt** : salt rounds 12 pour les mots de passe
- **Rate limiting** : 100 req/15min par IP sur `/api`
- **Helmet** : CSP, HSTS, X-Frame-Options, etc.
- **Audit logs** : tous les événements d'auth tracés via Winston

---

## Architecture Frontend

### Routing

```
/                → HomePage (publique)
/login           → AuthLayout → LoginPage
/dashboard       → ProtectedRoute → MainLayout → DashboardPage
/tickets         → ProtectedRoute → MainLayout → TicketsPage (futur)
/assets          → ProtectedRoute → MainLayout → AssetsPage (futur)
/admin           → ProtectedRoute (admin) → MainLayout → AdminPage (futur)
```

### State Management (Zustand)

| Store | Fichier | Contenu |
|---|---|---|
| `useAuthStore` | `store/useAuthStore.ts` | user, tokens, isAuthenticated, hasRole() |
| `useThemeStore` | `store/useThemeStore.ts` | mode light/dark (persisté localStorage) |
| `useNotificationStore` | `store/useNotificationStore.ts` | toasts/alerts |

### API Client (Axios)

- Base URL : `VITE_API_URL` (défaut: `http://localhost:3000/api/v1`)
- Intercepteur request : injecte automatiquement le Bearer token JWT
- Intercepteur response : gère les 401 (logout automatique)
- Helpers typés : `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `del<T>()`

---

## Base de données

### Modèles actuels

```
Organization (organizations)
├── id          String  @id @default(cuid())
├── name        String
├── slug        String  @unique
├── domain      String?
├── status      OrganizationStatus
├── createdAt   DateTime
├── updatedAt   DateTime
├── deletedAt   DateTime?  (soft delete)
└── users       User[]

User (users)
├── id             String  @id @default(cuid())
├── email          String  @unique
├── passwordHash   String
├── firstName      String
├── lastName       String
├── role           UserRole
├── status         UserStatus
├── organizationId String
├── createdAt      DateTime
├── updatedAt      DateTime
└── deletedAt      DateTime?  (soft delete)
```

### Conventions

- IDs : `cuid()` — collision-resistant, URL-safe
- Tables : `snake_case` via `@@map`
- Champs : `camelCase`
- Timestamps : `createdAt` + `updatedAt` sur tous les modèles
- Soft delete : `deletedAt DateTime?` sur les modèles critiques

### Commandes utiles

```bash
npm run db:push          # Synchronise le schéma (dev)
npm run db:migrate       # Crée une migration
npm run db:seed          # Peuple la DB
npm run db:validate      # Valide l'environnement DB
npm run db:studio        # Interface graphique Prisma Studio
```

---

## Docker

### Services

| Service | Image | Port | Description |
|---|---|---|---|
| `db` | mysql:8.0 | 3306 | Base de données MySQL |
| `backend` | node:20-alpine | 3000 | API Node.js (hot-reload) |
| `frontend` | node:20-alpine | 5173 | Vite dev server (hot-reload) |

### Réseau

Tous les services communiquent via le réseau interne `itsm-network`. Le backend accède à la DB via `db:3306` (nom du service Docker, pas `localhost`).

### Volumes

- `db_data` — données MySQL persistantes
- `./backend:/app` — hot-reload backend
- `./frontend:/app` — hot-reload frontend
- `/app/node_modules` — évite l'écrasement par les node_modules Windows

---

## Standards de développement

### Commits (Conventional Commits)

```
feat(scope): description       # Nouvelle fonctionnalité
fix(scope): description        # Correction de bug
docs(scope): description       # Documentation
chore(scope): description      # Tâches de maintenance
refactor(scope): description   # Refactoring
```

### Branches

```
main          → Code en production
develop       → Intégration des features
feature/*     → Développement de fonctionnalités
bugfix/*      → Corrections de bugs
hotfix/*      → Corrections urgentes en production
```

### Workflow

1. Créer une branche depuis `develop`
2. Développer + commiter (hooks Husky vérifient lint + format)
3. Ouvrir une PR vers `develop`
4. CI GitHub Actions valide (lint + tsc + build)
5. Merge après validation

### CI/CD

GitHub Actions (`ci.yml`) déclenché sur push/PR vers `develop` et `main` :
- Backend : ESLint + TypeScript compile
- Frontend : ESLint + TypeScript compile + Vite build

---

## Variables d'environnement

Voir [ENV_VARIABLES.md](../guides/ENV_VARIABLES.md) pour la liste complète.

Variables critiques à configurer :

| Variable | Où | Description |
|---|---|---|
| `DATABASE_URL` | `backend/.env` | `mysql://user:pass@db:3306/itsm_db` |
| `JWT_SECRET` | `backend/.env` | Min. 32 caractères |
| `JWT_REFRESH_SECRET` | `backend/.env` | Min. 32 caractères |
| `VITE_API_URL` | `frontend/.env` | `http://localhost:3000/api/v1` |

---

## Modules futurs prévus

| Module | Description |
|---|---|
| Auth (ITSM-008) | Login, register, refresh token, reset password |
| Organizations | Gestion multi-tenant |
| Users | CRUD utilisateurs, rôles, permissions |
| Tickets | Création, assignation, suivi des tickets IT |
| Assets | Inventaire des équipements |
| Notifications | Email, WhatsApp, in-app |
| AI Integration | n8n + OpenAI pour l'automatisation |
| Reporting | Tableaux de bord et statistiques |
