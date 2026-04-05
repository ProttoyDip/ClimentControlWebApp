#!/usr/bin/env bash
set -e

npm install
npm run build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
