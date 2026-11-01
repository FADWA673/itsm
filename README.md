# 🎫 ITSM Platform - IT Service Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

Plateforme complète de gestion des services IT (ITSM) avec intégration d'intelligence artificielle pour optimiser le support technique.

**📖 Documentation complète**: [PRESENTATION_PROJET.md](./PRESENTATION_PROJET.md)

---

## 🎯 Fonctionnalités Principales

### 🎫 Gestion des Tickets
- Création, assignation, et suivi complet des tickets
- Workflow automatisé: OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
- Système de priorités (LOW, MEDIUM, HIGH, CRITICAL)
- Commentaires, pièces jointes, et historique complet
- Notifications en temps réel

### ⏱️ Système SLA
- Configuration de SLA par priorité
- Calcul automatique des deadlines
- Monitoring et alertes de dépassement
- Métriques de performance et rapports

### 💻 Gestion des Actifs IT
- Inventaire complet des équipements
- Assignation aux utilisateurs
- Suivi du cycle de vie
- Historique des mouvements

### 📚 Base de Connaissances
- Articles techniques avec système de révision
- Recherche intelligente avec IA
- Catégorisation et tags
- Statistiques de consultation

### 🤖 Intelligence Artificielle (3 fonctionnalités)
1. **Création Assistée de Tickets** - Extraction automatique des informations
2. **Assistant Chat IA** - Réponses contextuelles et suggestions
3. **Recherche Intelligente** - Recherche sémantique dans la KB

### 📊 Dashboard et Rapports
- Statistiques en temps réel
- Graphiques d'évolution
- Export de données (CSV, Excel)
- Filtres avancés

---

## 🏗️ Architecture

### Stack Technologique

**Backend**
- Node.js 20 + Express.js + TypeScript
- Prisma ORM + MySQL 8.0
- JWT Authentication (Access + Refresh tokens)
- Helmet, CORS, Rate Limiting

**Frontend**
- React 19 + TypeScript
- Material-UI (MUI)
- React Context API
- Axios + React Router v6

**Infrastructure**
- Docker + Docker Compose
- Nginx (production)
- GitHub Actions (CI/CD)

### Architecture Multi-tenant
- Isolation complète des données par organisation
- 6 rôles utilisateur avec permissions granulaires
- RBAC (Role-Based Access Control)

---

## 🚀 Installation et Démarrage

### Prérequis
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (développement local uniquement)

### Installation Rapide (Docker - Recommandé)

```bash
# 1. Cloner le repository
git clone [URL_DU_REPO]
cd itsm_ticket

# 2. Copier les fichiers de configuration
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Lancer l'application
docker-compose up -d

# 4. Vérifier les logs
docker-compose logs -f

# 5. Accéder à l'application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# API Documentation: http://localhost:3000/api/v1/health
```

### Installation Développement Local

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev

# Frontend (nouveau terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 👤 Comptes de Démonstration

| Rôle | Email | Mot de passe | Permissions |
|------|-------|--------------|-------------|
| **Super Admin** | fadwazr12@gmail.com | Admin@1234 | Accès complet système |
| **Admin** | admin@itsm.com | Admin@123 | Gestion organisation |
| **Technicien** | tech1@itsm.com | Tech@123 | Traitement tickets |
| **Employé** | user1@itsm.com | User@123 | Création tickets |

---

## 📁 Structure du Projet

```
itsm_ticket/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/            # Configuration (DB, JWT, etc.)
│   │   ├── modules/           # Modules métier
│   │   │   ├── auth/          # Authentification
│   │   │   ├── tickets/       # Gestion tickets
│   │   │   ├── assets/        # Gestion actifs
│   │   │   ├── kb/            # Base de connaissances
│   │   │   ├── users/         # Gestion utilisateurs
│   │   │   └── sla/           # Système SLA
│   │   ├── middlewares/       # Middlewares Express
│   │   ├── utils/             # Utilitaires
│   │   └── routes/            # Routage API
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma base de données
│   │   └── migrations/        # Migrations SQL
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Application React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages principales
│   │   │   ├── admin/         # Interface administration
│   │   │   ├── employee/      # Interface employé
│   │   │   └── technician/    # Interface technicien
│   │   ├── contexts/          # Context API (Auth, etc.)
│   │   ├── services/          # API clients
│   │   └── types/             # Types TypeScript
│   ├── Dockerfile
│   └── package.json
│
├── database/                   # Scripts SQL
│   └── init.sql               # Initialisation
│
├── docs/                       # Documentation
│   ├── api/                   # Documentation API
│   ├── architecture/          # Diagrammes architecture
│   └── user-guide/            # Guides utilisateur
│
├── docker-compose.yml          # Configuration Docker
├── .gitignore
├── README.md                   # Ce fichier
└── PRESENTATION_PROJET.md      # Documentation complète
```

---

## 🔧 Configuration

### Variables d'Environnement Backend (.env)

```env
# Base de données
DATABASE_URL="mysql://root:password@localhost:3306/itsm_db"

# JWT
JWT_SECRET="votre_secret_jwt_super_securise"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="votre_refresh_secret"
JWT_REFRESH_EXPIRES_IN="30d"

# Serveur
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre.email@gmail.com"
SMTP_PASSWORD="votre_mot_de_passe_app"
SMTP_FROM="ITSM Platform <no-reply@itsm.com>"
```

### Variables d'Environnement Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME="ITSM Platform"
```

---

## 🧪 Tests

### Lancer les Tests

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test

# Tests E2E
npm run test:e2e
```

### Couverture de Tests
Les tests couvrent:
- ✅ Authentification et autorisation
- ✅ CRUD des entités principales
- ✅ Workflow des tickets
- ✅ Calcul SLA
- ✅ Fonctionnalités IA

---

## 📊 Base de Données

### Modèles Principaux
- **User** - Utilisateurs et authentification
- **Organization** - Multi-tenant
- **Ticket** - Tickets de support
- **TicketCategory** - Catégories hiérarchiques
- **Asset** - Actifs IT
- **KBArticle** - Articles de connaissances
- **SLAConfig** - Configuration SLA
- **Notification** - Notifications

### Migrations

```bash
# Créer une migration
cd backend
npm run db:migrate:create -- --name nom_migration

# Appliquer les migrations
npm run db:migrate

# Générer le client Prisma
npm run db:generate

# Reset de la base (ATTENTION: supprime toutes les données)
npm run db:reset
```

---

## 🔒 Sécurité

### Authentification
- JWT avec rotation de tokens (Access + Refresh)
- Hash bcrypt pour les mots de passe
- Validation de force de mot de passe

### Autorisation
- RBAC avec 6 rôles
- Middleware de vérification par route
- Isolation multi-tenant

### Protection
- CORS configuré
- Helmet pour headers HTTP
- Rate limiting
- Validation des entrées
- Protection contre injection SQL (Prisma)

---

## 📈 Monitoring et Logs

### Logs Application
```bash
# Logs Docker
docker-compose logs -f backend
docker-compose logs -f frontend

# Logs dans le container
docker exec -it itsm-backend tail -f /var/log/app.log
```

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

---

## 🚢 Déploiement en Production

### Build et Deploy

```bash
# Build des images
docker-compose -f docker-compose.prod.yml build

# Déploiement
docker-compose -f docker-compose.prod.yml up -d

# Vérification
docker-compose -f docker-compose.prod.yml ps
```

### Checklist Pré-déploiement
- [ ] Variables d'environnement production configurées
- [ ] Base de données backupée
- [ ] Certificat SSL configuré
- [ ] Domaine configuré (DNS)
- [ ] Firewall configuré
- [ ] Monitoring activé
- [ ] Logs centralisés configurés

---

## 🐛 Résolution de Problèmes

### La base de données ne démarre pas
```bash
# Vérifier les logs
docker logs itsm-db

# Recréer le container
docker-compose down -v
docker-compose up -d
```

### Le backend ne se connecte pas à la DB
```bash
# Vérifier la configuration
cat backend/.env | grep DATABASE_URL

# Attendre que MySQL soit prêt
docker-compose restart backend
```

### Le frontend ne charge pas
```bash
# Vérifier les variables d'environnement
cat frontend/.env

# Rebuild le frontend
docker-compose up -d --build frontend
```

### Erreurs CORS
```bash
# Vérifier CORS_ORIGIN dans backend/.env
# Redémarrer le backend
docker-compose restart backend
```

---

## 📚 Documentation Additionnelle

- Documentation complète du projet
- **[docs/api/](./docs/api/)** - Documentation API détaillée
- **[docs/architecture/](./docs/architecture/)** - Diagrammes d'architecture
- **[DIAGRAMMES_UML_README.md](./DIAGRAMMES_UML_README.md)** - Guide des diagrammes UML

---

## 🤝 Contribution

Ce projet a été développé dans un cadre académique. Pour toute question:

**Fadwa Zariji**  
📧 Email: fadwazr12@gmail.com  
🎓 Projet: PFA / Stage  
🏢 Organisation: LOGISMAR

---

## 📄 Licence

Projet académique - Tous droits réservés © 2026

---

## 🙏 Remerciements

- Encadrant académique pour le suivi et les conseils
- Organisation LOGISMAR pour le contexte professionnel
- Communauté Open Source pour les outils utilisés

---

**Note**: Ce projet démontre des compétences en développement full-stack, architecture logicielle, et intégration de technologies modernes (IA, Docker, TypeScript, React, Node.js).
