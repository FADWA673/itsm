# Backend — ITSM Platform

API REST construite avec Node.js, Express 5 et TypeScript. Gère la logique métier, l'authentification et l'accès à la base de données via Prisma.

## Stack

| Outil | Version | Rôle |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 5 | Framework HTTP |
| TypeScript | 5.7 | Langage |
| Prisma | 5.20 | ORM / accès MySQL |
| dotenv | — | Variables d'environnement |
| tsx | — | Exécution TS en dev (hot-reload) |

## Démarrage

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Démarrer en développement (hot-reload)
npm run dev

# Compiler TypeScript
npm run build

# Démarrer en production (après build)
npm start
```

## Scripts npm

| Script | Commande | Description |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Développement avec hot-reload |
| `build` | `tsc` | Compilation TypeScript → `dist/` |
| `start` | `node dist/server.js` | Démarrage production |

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir les valeurs.

| Variable clé | Valeur par défaut | Description |
|---|---|---|
| `PORT` | `3000` | Port du serveur |
| `NODE_ENV` | `development` | Environnement |
| `DATABASE_URL` | `mysql://user:password@db:3306/itsm_db` | URL Prisma (Docker : `db`, local : `localhost`) |
| `JWT_SECRET` | — | Clé secrète JWT (min. 32 caractères) |
| `CORS_ORIGIN` | `http://localhost:5173` | Origine autorisée CORS |

Voir [ENV_VARIABLES.md](../docs/guides/ENV_VARIABLES.md) pour la liste complète.

## Structure `src/`

```
src/
├── app.ts            # Création de l'application Express (middlewares, routes)
├── server.ts         # Point d'entrée — charge .env et démarre le serveur
├── config/           # Configuration de l'application
├── controllers/      # Handlers de routes
├── services/         # Logique métier
├── repositories/     # Accès base de données (Prisma)
├── middlewares/      # Middlewares Express (auth, validation, erreurs)
├── modules/          # Modules fonctionnels (ticket, user, asset...)
├── routes/           # Définition des routes API
├── types/            # Types TypeScript partagés
└── utils/            # Fonctions utilitaires
```

## Endpoint disponible

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check — vérifie que le serveur tourne |

Réponse :
```json
{ "status": "OK", "message": "ITSM Backend is running" }
```
