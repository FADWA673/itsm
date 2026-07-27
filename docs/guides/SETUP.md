# Guide d'installation — ITSM Platform

Ce guide décrit comment installer et démarrer le projet en local, avec ou sans Docker.

---

## Option 1 — Docker (recommandée)

### Prérequis
- Docker Desktop installé et démarré

### Étapes

**1. Cloner le projet**
```bash
git clone https://github.com/FADWA673/itsm.git
cd itsm
```

**2. Copier les fichiers d'environnement**
```bash
copy .env.example .env
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

**3. Vérifier `backend/.env`**

S'assurer que `DATABASE_URL` pointe vers le service Docker `db` :
```
DATABASE_URL="mysql://user:password@db:3306/itsm_db"
```

**4. Lancer les conteneurs**
```bash
docker-compose up --build
```

**5. Vérifier que tout fonctionne**

| Vérification | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend health | http://localhost:3000/api/health |

Réponse attendue du health check :
```json
{ "status": "OK", "message": "ITSM Backend is running" }
```

---

## Option 2 — Local (sans Docker)

### Prérequis
- Node.js 20+
- MySQL 8.0 installé localement

### Étapes

**1. Installer les dépendances backend**
```bash
cd backend
npm install
```

**2. Installer les dépendances frontend**
```bash
cd frontend
npm install
```

**3. Configurer les variables d'environnement**
```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Modifier `backend/.env` pour pointer vers MySQL local :
```
DATABASE_URL="mysql://user:password@localhost:3306/itsm_db"
DB_HOST=localhost
DB_PORT=3306
```

**4. Générer le client Prisma**
```bash
cd backend
npx prisma generate
```

**5. Démarrer le backend**
```bash
cd backend
npm run dev
```

**6. Démarrer le frontend** (dans un autre terminal)
```bash
cd frontend
npm run dev
```

---

## Commandes Docker utiles

```bash
# Démarrer les services
docker-compose up

# Rebuild des images
docker-compose up --build

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer les conteneurs + volumes (reset DB)
docker-compose down -v

# Voir les logs en temps réel
docker-compose logs -f backend
docker-compose logs -f db

# Accéder au shell d'un conteneur
docker exec -it itsm-backend sh
docker exec -it itsm-db mysql -u user -p
```

---

## Résolution de problèmes

**Le backend ne se connecte pas à la DB**
- Vérifier que `DATABASE_URL` utilise `db` comme hôte (pas `localhost`) dans `backend/.env`
- Attendre que `itsm-db` soit `healthy` avant que le backend démarre (géré automatiquement par le healthcheck)

**Port déjà utilisé**
- Modifier `BACKEND_PORT` ou `FRONTEND_PORT` dans `.env`

**Modules non trouvés dans le conteneur**
- Supprimer les `node_modules` locaux et reconstruire : `docker-compose up --build`
