#!/bin/bash
# deploy.sh - Déploie l'application (build + démarrage des conteneurs)

set -e

echo "🔨 Build des images Docker..."
docker-compose build

echo "🚀 Démarrage des services..."
docker-compose up -d

echo "✅ Déploiement terminé. Services en cours d'exécution."
docker-compose ps
