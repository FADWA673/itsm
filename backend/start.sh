#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."
sleep 8

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Running database seed (initial data)..."
npm run db:seed || echo "⚠️  Seed skipped (data may already exist)"

echo "🚀 Starting ITSM backend server..."
exec npm run dev
