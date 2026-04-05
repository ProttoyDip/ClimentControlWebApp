# Climate Control System

Production-ready full-stack starter for IoT-powered climate monitoring and control.

## Features

- Secure authentication with JWT access and refresh token flow
- Role-based authorization (Admin/User)
- Real-time dashboard updates via Socket.IO
- IoT telemetry ingest endpoint for hardware sensors
- Device control APIs for AC and fan state
- MySQL primary schema (users, devices, sensor data, logs)
- MongoDB alternative schema mapping included
- Optional MQTT integration (Mosquitto + mqtt.js)
- Enterprise folder boundaries across frontend, backend, database, and docs
- Docker Compose support for local and production-like workflows

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express
- TypeScript
- MySQL (mysql2)
- Zod validation
- JWT + bcrypt
- Socket.IO
- MQTT.js

### Database
- MySQL 8 (primary)
- MongoDB (documented alternative model)

### DevOps
- Docker + Docker Compose
- Environment-based configuration with .env.example templates

## Folder Structure

```text
climate-control-system/
├── .env.example
├── .gitignore
├── docker-compose.prod.yml
├── docker-compose.yml
├── package.json
├── README.md
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── db.ts
│       │   └── env.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── device.controller.ts
│       │   └── sensor.controller.ts
│       ├── middlewares/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── validate.middleware.ts
│       ├── models/
│       │   ├── device.model.ts
│       │   ├── log.model.ts
│       │   ├── sensorData.model.ts
│       │   └── user.model.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── device.routes.ts
│       │   ├── index.ts
│       │   └── sensor.routes.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── device.service.ts
│       │   ├── mqtt.service.ts
│       │   ├── realtime.service.ts
│       │   └── sensor.service.ts
│       ├── socket/
│       │   └── index.ts
│       ├── utils/
│       │   ├── apiError.ts
│       │   ├── asyncHandler.ts
│       │   └── logger.ts
│       └── validators/
│           ├── auth.validator.ts
│           ├── device.validator.ts
│           └── sensor.validator.ts
├── frontend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── assets/
│       ├── components/
│       │   ├── DashboardHeader.tsx
│       │   ├── DeviceStatusList.tsx
│       │   └── MetricCard.tsx
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── hooks/
│       │   └── useRealtimeReadings.ts
│       ├── pages/
│       │   ├── DashboardPage.tsx
│       │   ├── LoginPage.tsx
│       │   └── RegisterPage.tsx
│       ├── services/
│       │   ├── api.ts
│       │   └── socket.ts
│       ├── styles/
│       │   └── global.css
│       ├── types/
│       │   └── index.ts
│       └── utils/
├── database/
│   ├── mongodb/
│   │   └── collections.example.json
│   └── mysql/
│       ├── schema.sql
│       └── seed.sql
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── MQTT_TOPICS.md
│   ├── SECURITY.md
│   └── mosquitto.conf
└── scripts/
    ├── dev-start.sh
    └── prod-build.sh
```

## Folder Explanation

- frontend: React SPA with auth pages, dashboard modules, realtime hook, and API services.
- backend: Express API, role-aware auth, telemetry ingest, device control, and Socket.IO/MQTT services.
- database: SQL schema and seed scripts for MySQL, plus MongoDB alternative collection design.
- docs: Architecture notes, endpoint references, MQTT topic contracts, and security guide.
- scripts: Utility scripts for development startup and production build workflow.

## Installation

### Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (recommended)
- MySQL 8+ (if running without Docker)

### 1) Clone and enter project

```bash
git clone <your-repo-url>
cd climate-control-system
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment files

Create local .env files from examples:

- .env.example -> .env
- backend/.env.example -> backend/.env
- frontend/.env.example -> frontend/.env

## Environment Variables

### Root (.env)

- NODE_ENV: Environment mode
- FRONTEND_PORT: Frontend port
- BACKEND_PORT: Backend port
- API_URL: Backend base URL
- MYSQL_*: MySQL connection values
- JWT_*: JWT signing secrets and expiry values
- MQTT_*: Optional broker configuration

### Backend (backend/.env)

```bash
NODE_ENV=development
PORT=4000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=climate_user
MYSQL_PASSWORD=climate_password
MYSQL_DATABASE=climate_control
JWT_ACCESS_SECRET=replace_me_access_secret
JWT_REFRESH_SECRET=replace_me_refresh_secret
SOCKET_CORS_ORIGIN=http://localhost:5173
MQTT_ENABLED=true
MQTT_URL=mqtt://localhost:1883
```

### Frontend (frontend/.env)

```bash
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## Running the App

### Option A: Docker Compose

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000/api/health
- MySQL: localhost:3306
- MQTT broker: localhost:1883

### Option B: Local Development

```bash
npm run dev
```

This runs backend and frontend in parallel via npm workspaces.

## API Sample

### Register user

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Facility Operator",
  "email": "operator@climate.local",
  "password": "operator1234",
  "role": "user"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@climate.local",
  "password": "admin1234"
}
```

### Sensor ingest (IoT endpoint)

```http
POST /api/sensors/ingest
Content-Type: application/json

{
  "deviceSerial": "CCS-LOBBY-001",
  "temperature": 24.6,
  "humidity": 55.9,
  "fanStatus": "on",
  "acStatus": "off",
  "recordedAt": "2026-04-06T09:20:00.000Z"
}
```

### Device control

```http
POST /api/devices/1/control
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "fanStatus": "off",
  "acStatus": "on"
}
```

## Realtime Events

- sensor:update
- device:status

## Hardware Integration Notes

### HTTP path

- Devices or gateways POST telemetry to /api/sensors/ingest.
- Backend validates and stores data, then broadcasts via Socket.IO.

### MQTT path (optional)

- Inbound topic: climate/devices/{serial}/telemetry
- Command topic: climate/devices/{serial}/commands
- Heartbeat topic: climate/devices/{serial}/heartbeat

## Security and Best Practices

- JWT access/refresh token split
- Role-based access control for admin-only actions
- Zod input validation at route level
- Centralized error middleware with standardized responses
- Structured logging for operational visibility
- Environment validation on startup

## Screenshots

Add screenshots here once UI is deployed:

- docs/screenshots/dashboard.png
- docs/screenshots/login.png
- docs/screenshots/device-controls.png

## Future Improvements

1. Add refresh-token rotation and revocation store.
2. Add alert engine for threshold breaches and offline detection.
3. Add unit/integration tests and CI pipeline.
4. Add Timeseries aggregation endpoints for analytics dashboards.
5. Add WebAuthn/SSO for enterprise auth.
6. Add observability stack (Prometheus + Grafana).
7. Add Kubernetes deployment manifests and Helm chart.
