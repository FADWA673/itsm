# Environment Variables Guide

Ce guide décrit toutes les variables d'environnement utilisées dans le projet ITSM Platform et explique comment configurer son environnement local.

## Mise en place rapide

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env
```

Puis remplir les valeurs dans chaque `.env`.

## Variables Backend (`backend/.env`)

### Application

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur Express | `3000` |
| `NODE_ENV` | Environnement (`development`, `test`, `production`) | `development` |
| `APP_URL` | URL de base de l'application | `http://localhost:3000` |
| `API_PREFIX` | Préfixe des routes API | `/api/v1` |

### Base de données

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL complète Prisma/MySQL | `mysql://user:pass@localhost:3307/itsm_db` |
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3307` |
| `DB_NAME` | Nom de la base | `itsm_db` |
| `DB_USER` | Utilisateur MySQL | `user` |
| `DB_PASSWORD` | Mot de passe MySQL | — |
| `DB_ROOT_PASSWORD` | Mot de passe root MySQL (Docker) | — |

### Authentification (JWT)

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Clé secrète pour signer les tokens d'accès |
| `JWT_EXPIRES_IN` | Durée de validité du token (`7d`, `1h`...) |
| `JWT_REFRESH_SECRET` | Clé secrète pour les refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Durée de validité du refresh token |

### Email (SMTP)

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | Serveur SMTP |
| `SMTP_PORT` | Port SMTP (`587` TLS, `465` SSL) |
| `SMTP_USER` | Identifiant SMTP |
| `SMTP_PASSWORD` | Mot de passe SMTP |
| `SMTP_FROM` | Adresse d'envoi par défaut |

### WhatsApp Business API

| Variable | Description |
|----------|-------------|
| `WHATSAPP_TOKEN` | Token d'accès WhatsApp Business |
| `WHATSAPP_PHONE_ID` | ID du numéro de téléphone WhatsApp |
| `WHATSAPP_VERIFY_TOKEN` | Token de vérification webhook |

### AI / n8n

| Variable | Description |
|----------|-------------|
| `N8N_WEBHOOK_URL` | URL du webhook n8n |
| `AI_API_KEY` | Clé API OpenAI ou autre modèle |
| `AI_MODEL` | Modèle IA utilisé (`gpt-4`...) |

### Logging

| Variable | Description |
|----------|-------------|
| `LOG_LEVEL` | Niveau de log (`info`, `debug`, `error`) |
| `LOG_FILE` | Chemin du fichier de log |

---

## Variables Frontend (`frontend/.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_URL` | URL de l'API backend | `http://localhost:3000/api/v1` |
| `VITE_APP_NAME` | Nom de l'application | `ITSM Platform` |
| `VITE_ENABLE_AI` | Activer le module IA | `false` |
| `VITE_ENABLE_WHATSAPP` | Activer l'intégration WhatsApp | `false` |
| `VITE_ENABLE_NOTIFICATIONS` | Activer les notifications | `true` |

> Toutes les variables frontend doivent être préfixées par `VITE_` pour être accessibles dans le code React.

---

## Sécurité

- Ne jamais committer un fichier `.env` — il est dans `.gitignore`
- Seuls les `.env.example` (sans valeurs sensibles) sont versionnés
- Utiliser des secrets forts pour `JWT_SECRET` et `JWT_REFRESH_SECRET` (minimum 32 caractères)
- Séparer les configurations par environnement : `development`, `test`, `staging`, `production`
