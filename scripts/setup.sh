#!/bin/bash
# setup.sh - Initialise l'environnement de développement du projet ITSM

set -e

echo "🚀 Initialisation du projet ITSM..."

echo "📦 Installation des dépendances backend..."
cd backend && npm install && cd ..

echo "📦 Installation des dépendances frontend..."
cd frontend && npm install && cd ..

echo "🗄️  Génération du client Prisma..."
cd backend && npx prisma generate && cd ..

echo "📋 Copie des fichiers .env.example..."
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env

echo "✅ Setup terminé. Pense à remplir tes fichiers .env avant de lancer le projet."
