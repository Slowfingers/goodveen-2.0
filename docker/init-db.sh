#!/bin/bash
set -e

echo "🔧 Initializing Goodveen database..."

# Database is already created by POSTGRES_DB env var
# This script runs only on first container start

echo "✅ Database ready!"
