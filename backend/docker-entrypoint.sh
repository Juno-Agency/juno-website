#!/bin/sh
set -e

echo "[entrypoint] Syncing database schema (prisma db push)…"
# Idempotent: creates/updates tables to match schema.prisma. Swap for
# `prisma migrate deploy` once you commit migration files.
npx prisma db push --skip-generate --accept-data-loss

if [ "$RUN_SEED" = "true" ]; then
  echo "[entrypoint] Seeding admin user…"
  node dist/seed.js || echo "[entrypoint] seed skipped/failed (continuing)"
fi

echo "[entrypoint] Starting API…"
exec node dist/index.js
