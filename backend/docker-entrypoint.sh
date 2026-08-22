#!/bin/sh
set -e

# Mongoose creates the collections and indexes on first use — no schema push.
# The back-office admin is authenticated from ADMIN_EMAIL / ADMIN_PASSWORD env
# vars, so there is no seed step.

echo "[entrypoint] Starting API…"
exec node dist/index.js
