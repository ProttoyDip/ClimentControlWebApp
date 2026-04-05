# API Documentation (Sample)

Base URL: /api

## Health

GET /health
- Response: 200 OK

## Auth

POST /auth/register
- Body:
  {
    "name": "Facility Operator",
    "email": "operator@climate.local",
    "password": "operator1234",
    "role": "user"
  }

POST /auth/login
- Body:
  {
    "email": "admin@climate.local",
    "password": "admin1234"
  }
- Response includes accessToken and refreshToken.

## Sensors

POST /sensors/ingest
- Purpose: IoT device telemetry ingest endpoint.
- Body:
  {
    "deviceSerial": "CCS-LOBBY-001",
    "temperature": 24.6,
    "humidity": 55.9,
    "fanStatus": "on",
    "acStatus": "off",
    "recordedAt": "2026-04-06T09:20:00.000Z"
  }

GET /sensors/latest?limit=30
- Auth required.

GET /sensors/device/:deviceId?limit=100
- Auth required.

## Devices

GET /devices
- Auth required.

POST /devices/:deviceId/control
- Auth required (admin role).
- Body:
  {
    "fanStatus": "off",
    "acStatus": "on"
  }

## WebSocket Events

- sensor:update
- device:status
