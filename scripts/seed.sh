#!/bin/bash
# seed.sh - Peuple la base de données avec des données de test

set -e

echo "🌱 Seed de la base de données..."
cd backend
npx prisma db seed
cd ..

echo "✅ Seed terminé."
