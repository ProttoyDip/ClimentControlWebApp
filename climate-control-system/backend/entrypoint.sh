#!/bin/sh
# ============================================================
# Backend Entrypoint Script
# ============================================================
# Runs database migrations before starting the Node.js server
# This ensures schema is up-to-date before application starts
# ============================================================

set -e

LOG_PREFIX="[ENTRYPOINT]"

echo "$LOG_PREFIX Starting backend application..."

# Wait for MySQL to be ready (max 30 seconds)
echo "$LOG_PREFIX Waiting for MySQL to be ready..."
MYSQL_READY=false
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if node -e "
    const mysql = require('mysql2');
    const conn = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    conn.connect((err) => {
      if (err) process.exit(1);
      conn.end();
      process.exit(0);
    });
  " 2>/dev/null; then
    MYSQL_READY=true
    echo "$LOG_PREFIX MySQL is ready"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  echo "$LOG_PREFIX MySQL not ready, retrying... ($ATTEMPT/$MAX_ATTEMPTS)"
  sleep 1
done

if [ "$MYSQL_READY" = false ]; then
  echo "$LOG_PREFIX FATAL: MySQL failed to respond after $MAX_ATTEMPTS attempts"
  exit 1
fi

# Run database migrations using the compiled migration script
echo "$LOG_PREFIX Running database migrations..."
if ! node dist/scripts/migrate.js --direction=up; then
  echo "$LOG_PREFIX Migrations failed"
  exit 1
fi

echo "$LOG_PREFIX Migrations completed successfully"

# Start the Node.js server
echo "$LOG_PREFIX Starting Node.js server..."
exec node dist/server.js

