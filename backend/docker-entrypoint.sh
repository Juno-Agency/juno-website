#!/bin/sh
set -e

# Mongoose creates the collections and indexes on first use — no schema push.
if [ "$RUN_SEED" = "true" ]; then
  echo "[entrypoint] Seeding admin user…"
  node dist/seed.js || echo "[entrypoint] seed skipped/failed (continuing)"
fi

echo "[entrypoint] Starting API…"
exec node dist/index.js
