#!/bin/sh
set -e

echo "🚀 Starting Goodveen application..."

# Start nginx in background
echo "📦 Starting nginx..."
nginx

# Start backend
echo "🔧 Starting backend server..."
cd /app/server
exec node --import tsx src/index.ts
