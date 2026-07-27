# ITSM Platform

Plateforme de gestion de tickets IT (ITSM) — système complet de ticketing avec gestion des incidents, demandes de service, et intégrations (WhatsApp, IA, email).

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Node.js 20, Express 5, TypeScript 5.7 |
| Frontend | React 19, Vite 8, TypeScript 6 |
| Base de données | MySQL 8.0, Prisma 5.20 |
| Conteneurs | Docker, Docker Compose |
| Auth | JWT (access + refresh tokens) |

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommandé)
- Node.js 20+ (pour le développement local sans Docker)
- Git

## Démarrage rapide (Docker)

```bash
# 1. Cloner le projet
git clone https://github.com/FADWA673/itsm.git
cd itsm

# 2. Copier les fichiers d'environnement
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

# 3. Lancer tous les services
docker-compose up --build
```

Les services démarrent sur :

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |
| MySQL | localhost:3306 |

## Structure du projet

```
itsm/
├── backend/          # API Node.js/Express
│   ├── src/          # Code source TypeScript
│   └── prisma/       # Schéma et migrations Prisma
├── frontend/         # App React/Vite
│   └── src/          # Code source React
├── database/         # Scripts SQL et seeders
├── docker/           # Dockerfiles (production)
├── docs/             # Documentation
└── docker-compose.yml
```

## Documentation

| Doc | Description |
|---|---|
| [Guide d'installation](./docs/guides/SETUP.md) | Installation complète Docker et local |
| [Variables d'environnement](./docs/guides/ENV_VARIABLES.md) | Toutes les variables `.env` |
| [Conventions](./docs/CONVENTIONS.md) | Standards de code et commits |
| [Branching](./docs/architecture/BRANCHING.md) | Stratégie Git |
| [Structure](./docs/architecture/FOLDER_STRUCTURE.md) | Organisation des dossiers |
| [Backend](./backend/README.md) | Documentation backend |
| [Frontend](./frontend/README.md) | Documentation frontend |

## Commandes utiles

```bash
# Démarrer en développement
docker-compose up

# Rebuild complet
docker-compose up --build

# Arrêter les conteneurs
docker-compose down

# Voir les logs d'un service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Contribution

1. Lire [CONVENTIONS.md](./docs/CONVENTIONS.md) avant de contribuer
2. Créer une branche depuis `develop` : `git checkout -b feature/ma-feature`
3. Ouvrir une Pull Request vers `develop`
