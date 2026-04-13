# Climate Control SaaS Architecture

## Text Diagram
```
                    +-----------------------+
                    |      React App        |
                    | Admin/User Dashboards |
                    +----------+------------+
                               |
                               | HTTPS + JWT / Socket.io
                               v
+--------------------+   +-----+----------------------------+   +------------------+
| ESP32 Devices      |-->| Node.js API + Socket Gateway     |-->| MySQL (current)  |
| DHT telemetry      |   | - REST ingest                    |   | Timeseries + auth|
| MQTT control client|   | - MQTT bridge                    |   +------------------+
+---------+----------+   | - RBAC + alerts + predictions    |
          |              +-----+----------------------------+
          | MQTT publish/sub   |
          v                    v
   +------+-------------------------+        +---------------------------+
   | Mosquitto Broker               |        | Optional Workers          |
   | climate/sensor/data            |        | Redis + BullMQ            |
   | climate/device/control/<serial>|        | batch analytics/anomalies |
   +--------------------------------+        +---------------------------+
```

## Data Flow
1. ESP32 reads DHT telemetry every interval.
2. Device sends telemetry via REST `POST /api/sensors/data` and MQTT `climate/sensor/data`.
3. Backend validates `x-device-key`, stores reading, emits socket events:
   - `sensor:update`
   - `alert`
4. User/admin dashboard receives websocket events and updates charts/cards instantly.
5. Device control path:
   - Frontend calls `POST /api/devices/:deviceId/control`
   - Backend updates DB and emits `device:update`
   - Backend publishes MQTT command to `climate/device/control/<serial>`
   - ESP32 executes relay action.

## RBAC Model
- `admin`: global analytics, automation rules, device management, logs/alerts.
- `user`: dashboard access, assigned-device control, limited analytics.
- Backend guard: `authenticate` + `authorize("admin")` where needed.
- Frontend guard: role-based route protection (`/admin` admin only).

## AI Prediction Strategy
### Option A (implemented baseline)
- Node.js lightweight regression using latest 24h points.
- Predict 2-hour temperature/humidity trend and energy spike risk.
- Emit predictive recommendations via alerts/socket + `/api/analytics/prediction`.

### Option B (upgrade path)
- Python FastAPI microservice (Prophet/LSTM).
- Consume readings stream and return richer forecasts:
  - confidence intervals
  - anomaly scoring
  - optimized control windows.

## Security Controls
- Device authentication via `x-device-key` (`DEVICE_API_KEYS`).
- JWT user authentication for APIs and socket handshake.
- Route-level RBAC checks.
- API + IoT ingress rate-limiting.
- Helmet/CORS in API gateway.

## Scalability
- Socket scaling: add Redis adapter for Socket.io.
- Async jobs: BullMQ for heavy analytics/reporting.
- Service split ready:
  - `ingestion-service`
  - `control-service`
  - `analytics-service`
  - `notification-service`

## Deployment Targets
- Frontend: Vercel
- Backend API/Socket: Render, AWS ECS, or VPS Docker
- MQTT Broker: Mosquitto on VPS/K8s
- DB: MySQL (current) or PostgreSQL managed instance
- Redis: managed Redis for queue + socket adapter
