# Development Environment Setup

**Last Updated**: 2026-04-13  
**Target**: Windows, macOS, Linux developers

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start-5-minutes)
2. [Prerequisites](#prerequisites)
3. [Full Setup with Docker](#full-setup-with-docker)
4. [Local Backend Development](#local-backend-development)
5. [Local Frontend Development](#local-frontend-development)
6. [Database Management](#database-management)
7. [Debugging & Testing](#debugging--testing)
8. [Common Tasks](#common-tasks)

---

## Quick Start (5 minutes)

```bash
# Clone repository
git clone https://github.com/your-org/climate-control-system.git
cd climate-control-system

# Start everything with Docker
docker-compose up

# Open in browser
open http://localhost:5173          # Frontend
# API available at: http://localhost:4000/api
# MySQL at: localhost:3306
# MQTT at: localhost:1883
```

**Done!** You now have a full environment running locally.

---

## Prerequisites

### System Requirements

| OS | Requirement | Command to verify |
|----|-------------|-------------------|
| **Any** | Docker + Docker Compose | `docker --version && docker-compose --version` |
| **Any** | Git | `git --version` |
| Optional | Node 20+ | `node --version` |
| Optional | MySQL Client | `mysql --version` |

### Install Docker

```bash
# Windows / macOS / Linux
# https://docs.docker.com/get-docker/

docker --version   # Verify (should be 24.0+)
docker-compose --version  # Verify (should be 2.20+)
```

### Clone Repository

```bash
# Start here
git clone https://github.com/your-org/climate-control-system.git
cd climate-control-system

# Or if already cloned:
git pull origin main
```

---

## Full Setup with Docker

### Option 1: Run Everything (Recommended for most developers)

```bash
# Copy environment template
cp .env.example .env

# Start all services (MySQL, MQTT, Backend, Frontend)
docker-compose up

# In another terminal, verify health
curl http://localhost:4000/api/health
# Expected: {"status": "ok"}
```

**Services ready at:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Database**: localhost:3306 (user: `climate_user`, password: `climate_password`)
- **MQTT**: localhost:1883

### Option 2: Run Services Only (Backend/Frontend development)

```bash
# Start only infrastructure (MySQL + MQTT)
docker-compose up mysql mqtt

# Then run backend/frontend locally (see next sections)
```

### Option 3: Stop & Clean Up

```bash
# Stop all services (data persists)
docker-compose stop

# Remove everything (data DELETED)
docker-compose down

# Reset with fresh database
docker-compose down -v
docker-compose up
```

---

## Local Backend Development

### Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment
cp .env.example .env

# Ensure MySQL & MQTT are running (via Docker)
# docker-compose up mysql mqtt &
```

### Run in Development

```bash
# Watch mode - auto-reload on code changes
npm run dev

# Starts at http://localhost:4000
# API at http://localhost:4000/api
```

### Build for Production

```bash
# Compile TypeScript
npm run build

# Output in: ./dist/
# Run with: node dist/server.js
```

### Available Scripts

```bash
npm run dev              # Development with hot reload
npm run build           # Compile TypeScript
npm start               # Run compiled code
npm test                # Run all tests
npm test:integration    # Run only integration tests
npm run lint            # Run ESLint
npm run typecheck       # Check TypeScript types
npm run migrate:up      # Apply pending migrations
npm run migrate:down    # Rollback last migration
npm run db:init         # Initialize local database
```

### Debugging Backend

#### Using VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "preLaunchTask": "npm: dev",
      "protocol": "inspector",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Then press **F5** or **Run → Start Debugging**

#### Console Logging

```typescript
// In backend code
import { logger } from "./utils/logger";

logger("info", "Payment processed", { userId: 123, amount: 50 });
// Output with timestamp, level, and metadata

// Or for quick debugging:
console.log("[PaymentService]", { userId, amount });
```

#### Inspect Requests/Responses

```bash
# Enable detailed logging
export LOG_LEVEL=debug
npm run dev

# Or with curl
curl -v http://localhost:4000/api/devices
```

---

## Local Frontend Development

### Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment
cp .env.example .env
# Edit .env to point to local backend:
# VITE_API_BASE_URL=http://localhost:4000/api
# VITE_SOCKET_URL=http://localhost:4000
```

### Run in Development

```bash
# Start dev server with hot reload
npm run dev

# Open http://localhost:5173
# Changes save instantly (HMR - Hot Module Replacement)
```

### Build for Production

```bash
npm run build
# Output in: ./dist/

# Preview production build locally
npm run preview
# Opens at http://localhost:4173
```

### Available Scripts

```bash
npm run dev              # Dev server with HMR
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # ESLint
npm run typecheck      # TypeScript check
```

### Debugging Frontend

#### Chrome DevTools

1. Open http://localhost:5173
2. Open DevTools (**F12** or **Cmd+Option+I**)
3. **Sources** tab → Set breakpoints
4. **Console** tab → View logs
5. **Network** tab → Inspect API calls
6. **Redux/Zustand DevTools** → Inspect state

#### VS Code Debugger

Install: [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Frontend Debug",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

Press **F5** to start debugging.

#### React DevTools

Install browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

Inspect components in **React** tab in DevTools.

---

## Database Management

### Access MySQL Directly

```bash
# From your machine
mysql -h 127.0.0.1 -u climate_user -p climate_control
# Password: climate_password

# From Docker container
docker exec -it climate-mysql mysql -u climate_user -p climate_control
```

### Useful Queries

```sql
-- View all devices
SELECT id, name, serial_number, device_type, status FROM devices;

-- View latest sensor readings
SELECT device_id, temperature, humidity, recorded_at 
FROM sensor_data 
ORDER BY recorded_at DESC 
LIMIT 10;

-- View active alerts
SELECT device_id, type, message, created_at 
FROM alerts 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Check migration status
SELECT version, name, applied_at FROM schema_migrations;
```

### Reset Database

```bash
# Delete all data and reset migrations
docker-compose down -v
docker-compose up mysql

# Then run migrations fresh
docker exec climate-backend npm run migrate:up
```

### Backup Database

```bash
# Local backup
docker exec climate-mysql mysqldump -u climate_user -p climate_control > backup.sql

# View backup
head -20 backup.sql
```

### Restore Database

```bash
# From backup
docker exec -i climate-mysql mysql -u climate_user -p climate_control < backup.sql
```

---

## Debugging & Testing

### Run Tests

```bash
# All tests
cd backend
npm test

# Watch mode
npm test -- --watch

# Integration tests only
npm run test:integration

# Coverage report
npm test -- --coverage
```

### Create a New Test

```typescript
// tests/integration/auth.integration.test.ts
import { api } from "../../src/services/api";

describe("Auth", () => {
  test("should register new user", async () => {
    const response = await api.post("/auth/register", {
      email: "test@example.com",
      password: "Test123!"
    });
    expect(response.status).toBe(201);
    expect(response.data.token).toBeDefined();
  });
});
```

### End-to-End Testing

Check `tests/integration/` for examples:

```bash
# Run specific test file
npm test -- auth.integration.test.ts

# Run with verbose output
npm test -- --verbose
```

### Simulate Offline Mode

```bash
# Disconnect MQTT (backend still works via REST)
docker-compose stop mqtt

# Test graceful degradation
npm test:integration

# Reconnect
docker-compose up mqtt
```

---

## Common Tasks

### Add a New Device Type

1. **Database migration**:
   ```bash
   # Create migration file
   touch database/mysql/migrations/003_add_device_type.up.sql
   touch database/mysql/migrations/003_add_device_type.down.sql
   ```

2. **Add to model**:
   ```typescript
   // src/models/device.model.ts
   type DeviceType = "ac" | "fan" | "humidifier" | "new_type";
   ```

3. **Run migration**:
   ```bash
   npm run migrate:up
   ```

### Add Frontend Component

```bash
# In frontend/src/components/
mkdir MyWidget
cat > MyWidget/MyWidget.tsx << 'EOF'
export function MyWidget() {
  return <div>Hello World</div>;
}
EOF

# Import in page
// frontend/src/pages/DashboardPage.tsx
import { MyWidget } from "../components/MyWidget/MyWidget";
```

### Change MQTT Topics

```typescript
// src/services/mqtt.service.ts
const SENSOR_TOPIC = "climate/sensor/data";     // Change here
const CONTROL_PREFIX = "climate/device/control"; // And here

// Also update ESP32 firmware:
// docs/esp32/ClimateDevice.ino
const char *MQTT_SENSOR_TOPIC = "climate/sensor/data";
```

### Increase API Rate Limits (Development)

```bash
# .env
API_RATE_LIMIT_MAX=1000  # Increase from 180
IOT_RATE_LIMIT_MAX=5000  # Increase from 240
```

### View Real-time Logs

```bash
# Backend
docker-compose logs -f backend

# Frontend (from browser console, F12)

# MQTT messages
docker exec climate-mqtt mosquitto_sub -h localhost -v -t 'climate/#'
```

### Test MQTT Manually

```bash
# Subscribe to sensor data
mosquitto_sub -h localhost -t 'climate/sensor/data' -v

# Publish device control (in another terminal)
mosquitto_pub -h localhost \
  -t 'climate/device/control/ESP32-ROOM-01' \
  -m '{"acStatus":"on","fanStatus":"off"}'
```

### Generate Device API Key

```bash
# Create random 32-char key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Add to backend .env
DEVICE_API_KEYS=key1,key2,key3
```

---

## Environment Variables Reference

### Backend (.env)

```bash
NODE_ENV=development
PORT=4000
MYSQL_HOST=localhost
MYSQL_USER=climate_user
MYSQL_PASSWORD=climate_password
MYSQL_DATABASE=climate_control

JWT_ACCESS_SECRET=dev-secret-change-me
JWT_REFRESH_SECRET=dev-secret-change-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

MQTT_ENABLED=true
MQTT_URL=mqtt://localhost:1883
MQTT_USERNAME=climate_mqtt
MQTT_PASSWORD=climate_mqtt_password

LOG_LEVEL=info
RATE_LIMIT_MAX=1000  # Relaxed for development
```

### Frontend (.env)

```bash
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

---

## Custom Configuration

### Use Your Own MQTT Broker

```bash
# .env
MQTT_URL=mqtt://your-mosquitto:1883
MQTT_USERNAME=myuser
MQTT_PASSWORD=mypass
```

### Use Remote Database

```bash
# .env
MYSQL_HOST=my-database.railway.app
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=<password>
MYSQL_DATABASE=climate_control

# Run migrations
npm run migrate:up
```

### Use Different Port

```bash
# .env
PORT=5000
# Run backend with:
npm run dev
# Now at http://localhost:5000/api
```

---

## Troubleshooting

**Q: "Cannot find module" errors**

```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Q: Port already in use**

```bash
# Find process using port 4000
lsof -i :4000

# Kill it
kill -9 <PID>

# Or use different port in .env
PORT=5000
npm run dev
```

**Q: Docker won't start**

```bash
# Check Docker daemon
docker ps

# Restart Docker service
# macOS: restart Docker app
# Linux: systemctl restart docker
# Windows: restart Docker Desktop
```

**Q: "Connection refused" to MQTT**

```bash
# Verify MQTT running
docker-compose ps mqtt

# Restart it
docker-compose restart mqtt
```

**Q: Git merge conflicts**

```bash
# Use VS Code to resolve
git pull origin main
# Conflicts marked with <<<< ==== >>>>

# After resolving
git add .
git commit -m "Resolve merge conflicts"
git push
```

---

## IDE Setup

### VS Code Extensions (Recommended)

```
# Install from VS Code Extensions (Ctrl+Shift+X)
ES7+ React/Redux/React-Native snippets
ESLint
Prettier - Code formatter
Thunder Client (REST client)
SQLTools (MySQL)
```

### VS Code Settings (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "search.exclude": {
    "**/node_modules": true,
    "**/.env": true
  }
}
```

---

## Performance Tips

- **Slow builds?** → Use `npm ci` instead of `npm install` (faster)
- **Slow tests?** → Run with `npm test -- --maxWorkers=2`
- **High CPU?** → Check `npm run dev` isn't compiling unnecessarily
- **Memory issues?** → Increase Node heap: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

---

**Last updated**: 2026-04-13  
**Maintained by**: Development Team
