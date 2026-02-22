#!/bin/sh
set -e

echo "🔍 Checking database migrations..."

npx prisma migrate deploy

echo "✅ Database ready"
echo "🚀 Starting application..."

exec node server.js
