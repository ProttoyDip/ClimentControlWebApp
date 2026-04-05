# Architecture Overview

## Layers

1. Frontend (React + TypeScript)
- Operator dashboard, auth views, and device controls.
- Consumes REST APIs and receives real-time updates via Socket.IO.

2. Backend (Node.js + Express + TypeScript)
- REST APIs for authentication, ingest, telemetry querying, and control commands.
- Socket.IO event broadcasting for telemetry and state changes.
- Optional MQTT subscriber for hardware telemetry topics.

3. Database (MySQL primary)
- Normalized relational model for users, devices, sensor_data, and logs.
- Indexed for device-time query patterns.

4. IoT integration
- HTTP ingest endpoint for direct hardware or gateway posting.
- Optional MQTT ingestion path through broker topics.

## Request and Event Flow

1. Device sends telemetry via HTTP or MQTT.
2. Backend validates payload and resolves device identity.
3. Data persists to MySQL and device status is updated.
4. Realtime service emits sensor/device events to dashboards.
5. Frontend updates cards and control panel instantly.

## Security Baseline

- JWT access tokens on protected APIs.
- Role-based authorization for privileged actions.
- Input validation with Zod.
- Standardized error handling and structured logging.
