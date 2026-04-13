# Deployment Guide: Smart Room Climate Control System

**Last Updated**: 2026-04-13  
**Status**: Production Ready

## Table of Contents

1. [Overview](#overview)
2. [Deployment Options](#deployment-options)
3. [Pre-Flight Checklist](#pre-flight-checklist)
4. [Local Docker Deployment](#local-docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
   - [Render + Railway + Vercel](#render--railway--vercel-recommended)
   - [Self-Hosted Docker on VPS](#self-hosted-docker-on-vps)
6. [Health Checks & Monitoring](#health-checks--monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## Overview

The Smart Room Climate Control System consists of three independent components:

| Component | Purpose | Typical Hosting |
|-----------|---------|-----------------|
| **Backend API** | Node.js Express server, handles all business logic | Render, Railway, Docker |
| **Frontend** | React + Vite SPA, user dashboard | Vercel, Netlify, Nginx |
| **Database** | MySQL with migrations | Railway, PlanetScale, Self-hosted |
| **Message Broker** | MQTT (optional but recommended) | HiveMQ Cloud, Mosquitto, Docker |
| **ESP32 Devices** | IoT firmware running on microcontrollers | Local network or remote via backend |

---

## Deployment Options

### Option A: Local Docker (Development/Staging)
**Best for**: Local testing, CI/CD integration, internal staging

- **Pros**: All services in one docker-compose, no external dependencies
- **Cons**: Not suitable for production load, requires local machine
- **Tools**: Docker, docker-compose

### Option B: Managed Cloud Services (Recommended for Production)
**Best for**: Production, auto-scaling, minimal DevOps

- **Backend**: Render.com or Railway.app
- **Database**: Railway MySQL or PlanetScale
- **Frontend**: Vercel or Netlify
- **MQTT**: HiveMQ Cloud or Mosquitto.org
- **Pros**: Auto-scaling, managed backups, CDN, minimal ops
- **Cons**: Vendor lock-in, pay-per-usage costs

### Option C: Self-Hosted Docker on VPS
**Best for**: Full control, cost optimization, custom requirements

- **VPS**: DigitalOcean, Linode, AWS EC2, Azure
- **Orchestration**: Docker Compose or Kubernetes
- **Reverse Proxy**: Nginx with Let's Encrypt SSL
- **Pros**: Full control, predictable costs
- **Cons**: DevOps overhead, manual scaling

---

## Pre-Flight Checklist

Before deploying to production, verify:

- [ ] **Secrets**: All sensitive values in `.env` or secrets manager, NEVER hardcoded
- [ ] **Database**: Backup strategy planned (daily snapshots minimum)
- [ ] **SSL/TLS**: HTTPS configured and valid certificates installed
- [ ] **Rate Limits**: Tuned for expected traffic (see `.env.production`)
- [ ] **CORS Origins**: Whitelist only trusted frontend domains
- [ ] **Device API Keys**: Unique keys per ESP32 device generated
- [ ] **Logs**: Centralized logging configured (Papertrail, Datadog, CloudWatch)
- [ ] **Monitoring**: Alerts configured for critical services (down, high error rate)
- [ ] **DNS**: Domain records pointing to correct services
- [ ] **Health Checks**: Verified `/api/health` endpoint responds within SLA

---

## Local Docker Deployment

### Prerequisites

```bash
# Install Docker and Docker Compose
# https://docs.docker.com/get-docker/
# https://docs.docker.com/compose/install/

docker --version      # v24+
docker-compose --version  # v2.20+
```

### Steps

<details open>
<summary><b>1. Clone and Configure</b></summary>

```bash
# Clone repository
git clone https://github.com/your-org/climate-control-system.git
cd climate-control-system

# Copy environment template
cp .env.example .env

# Edit .env with your values (development defaults are OK for local testing)
# nano .env  or  code .env

# IMPORTANT: Change JWT secrets to random values
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

</details>

<details>
<summary><b>2. Start All Services</b></summary>

```bash
# Build and start (development stack)
docker-compose up -d

# Follow logs
docker-compose logs -f backend

# Verify services are healthy
docker-compose ps
# Expected output:
# NAME              STATUS
# climate-mysql     Up (healthy)
# climate-mqtt      Up
# climate-backend   Up
# climate-frontend  Up
```

</details>

<details>
<summary><b>3. Verify</b></summary>

```bash
# Test backend health
curl http://localhost:4000/api/health
# Expected: {"status": "ok"}

# Test frontend
open http://localhost:5173
# Should load React app

# Test MQTT
docker exec climate-mqtt mosquitto_sub -h localhost -t 'climate/#' &
# Should connect without errors
```

</details>

<details>
<summary><b>4. Stop Services</b></summary>

```bash
# Stop without removing volumes (data persists)
docker-compose stop

# Stop and remove (data DELETED, use volume backup first)
docker-compose down
```

</details>

---

## Cloud Deployment

### Render + Railway + Vercel (Recommended)

**Architecture**:
- **Render**: Backend API server
- **Railway**: MySQL database + MQTT broker
- **Vercel**: Frontend (React SPA)
- **Cloudflare** (optional): DNS + CDN + DDoS protection

#### Step 1: Database Setup (Railway)

<details>
<summary><b>Click to expand</b></summary>

1. **Create Railway account**: https://railway.app
2. **Create MySQL database**:
   - New Project → Database → MySQL
   - Copy connection URL
   - **Settings** → Save password securely
3. **Create MQTT broker**:
   - New Service → Source → Docker
   - Image: `eclipse-mosquitto:2.0`
   - Expose port 1883 (MQTT)
   - Save credentials
4. **Migrate schema**:
   ```bash
   # Run migrations against Railway MySQL
   # Option A: Via CLI connection
   export DATABASE_URL="mysql://user:pass@host:port/climate_control"
   npm run migrate:up
   
   # Option B: Import SQL directly
   #   1. Export from local: mysqldump -u root climate_control < backup.sql
   #   2. Connect to Railway MySQL and import
   ```

</details>

#### Step 2: Backend Deployment (Render)

<details>
<summary><b>Click to expand</b></summary>

1. **Create Render account**: https://render.com
2. **Connect GitHub repo**:
   - New → Web Service → GitHub
   - Select `SmartRoomClimateControlWebApp/climate-control-system`
3. **Configure**:
   - **Name**: climate-backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Region**: Choose closest to users
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=4000
   MYSQL_HOST=<railway-mysql-host>
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=<railway-password>
   MYSQL_DATABASE=climate_control
   JWT_ACCESS_SECRET=<generate-random-32-char>
   JWT_REFRESH_SECRET=<generate-random-32-char>
   MQTT_URL=mqtt://<railway-mqtt-host>:1883
   MQTT_USERNAME=<mqtt-user>
   MQTT_PASSWORD=<mqtt-pass>
   API_CORS_ORIGIN=https://yourapp.vercel.app
   SOCKET_CORS_ORIGIN=https://yourapp.vercel.app
   LOG_LEVEL=info
   ```
5. **Deploy**: Click "Create Web Service"
6. **Verify**: Wait for build to complete, test `/api/health`

</details>

#### Step 3: Frontend Deployment (Vercel)

<details>
<summary><b>Click to expand</b></summary>

1. **Create Vercel account**: https://vercel.com
2. **Import GitHub repo**:
   - New Project → Import Git Repository
   - Select your repo
3. **Configure**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://climate-backend.onrender.com/api
   VITE_SOCKET_URL=https://climate-backend.onrender.com
   ```
5. **Deploy**: Click "Deploy"
6. **Verify**: Wait for build, app should be live at `*.vercel.app`

</details>

#### Step 4: Connect ESP32 Device

<details>
<summary><b>Click to expand</b></summary>

After deploying backend to Render, configure ESP32:

```cpp
// In ClimateDevice.ino, update:
const char *API_BASE_URL = "https://climate-backend.onrender.com/api";
const char *DEVICE_API_KEY = "<your-device-key>";
const char *MQTT_HOST = "<railway-mqtt-host>";
const char *MQTT_USER = "<mqtt-user>";
const char *MQTT_PASS = "<mqtt-pass>";

// Compile and flash to ESP32
```

</details>

---

### Self-Hosted Docker on VPS

<details>
<summary><b>Click to expand deployment steps</b></summary>

#### Prerequisites: Ubuntu 20.04+ VPS

```bash
# SSH into VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /opt/climate-control && cd /opt/climate-control
```

#### Clone & Configure

```bash
# Clone repo with shallow history (faster)
git clone --depth 1 https://github.com/your-org/climate-control-system.git .

# Copy production environment
cp .env.example .env.production
nano .env.production  # Edit with real production values

# SSL Certificates (using Let's Encrypt)
apt install -y certbot
certbot certonly --standalone -d climate-api.yourdomain.com
# Certs saved to /etc/letsencrypt/live/climate-api.yourdomain.com/
```

#### Deploy with docker-compose.prod.yml

```bash
# Create override file for production mounts
cat > docker-compose.override.yml <<'EOF'
version: "3.9"
services:
  frontend:
    volumes:
      - /etc/letsencrypt/live/climate-api.yourdomain.com/fullchain.pem:/etc/nginx/ssl/cert.pem:ro
      - /etc/letsencrypt/live/climate-api.yourdomain.com/privkey.pem:/etc/nginx/ssl/key.pem:ro

volumes:
  mysql_data_prod:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /var/lib/climate-mysql
EOF

# Create backups directory
mkdir -p /var/backups/climate-mysql

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

#### Setup Reverse Proxy (Optional Nginx)

```bash
# If using separate nginx:
cat > /etc/nginx/sites-available/climate-api <<'EOF'
server {
    listen 443 ssl http2;
    server_name climate-api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/climate-api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/climate-api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name climate-api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
EOF

ln -s /etc/nginx/sites-available/climate-api /etc/nginx/sites-enabled/
systemctl restart nginx
```

#### Database Backups

```bash
# Daily backup cron job
cat > /usr/local/bin/backup-climate-db.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/climate-mysql"
docker exec climate-mysql-prod mysqldump -u root -p$MYSQL_PASSWORD climate_control > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF
chmod +x /usr/local/bin/backup-climate-db.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-climate-db.sh" | crontab -

# Test backup
/usr/local/bin/backup-climate-db.sh
ls -lh /var/backups/climate-mysql/
```

</details>

---

## Health Checks & Monitoring

### Backend Health Check

```bash
# Should return within 5 seconds
curl -X GET http://localhost:4000/api/health \
  -H "X-Request-ID: $(uuidgen)" \
  -w "\nStatus: %{http_code}\n"

# Expected response:
# {"status": "ok", "timestamp": "2026-04-13T10:30:00Z"}
```

### Database Connectivity

```bash
# From backend container
docker exec climate-backend mysqladmin -h mysql -u climate_user -p ping
# Expected: mysqld is alive

# Or directly
mysql -h localhost -u climate_user -pclimate_password -e "SELECT 1"
```

### MQTT Broker Status

```bash
# Check if listening on 1883
docker exec climate-mqtt mosquitto_sub -h localhost -v -t '$SYS/#' | head -20

# Publish test message
docker exec climate-mqtt mosquitto_pub -h localhost -t "test/topic" -m "hello"
```

### Frontend React App

```bash
# Should serve React app
curl -I http://localhost:5173
# Expected: 200 OK, Content-Type: text/html

# Check console for errors (in browser DevTools)
```

---

## Troubleshooting

### Backend won't start: "Cannot find module"

```bash
# Issue: Missing dependencies after docker build
# Solution: Rebuild without cache
docker-compose build --no-cache backend
docker-compose up backend
```

### "Connection refused" to MySQL

```bash
# Issue: Backend starts before MySQL is healthy
# Solution: Check MySQL health
docker-compose ps mysql
# Should show "Up (healthy)"

# Check logs
docker-compose logs mysql | tail -50
```

### Migrations not running

```bash
# Issue: Schema not created on container start
# Solution: Verify entrypoint.sh runs
docker exec climate-backend cat /app/entrypoint.sh
docker logs climate-backend | grep -i migration

# Manual migration
docker exec climate-backend node dist/scripts/migrate.js --direction=up
```

### MQTT connection errors on ESP32

```bash
# Issue: ESP32 can't reach MQTT broker
# Verify MQTT host is reachable
ping <mqtt-host>

# Check MQTT port open
nc -zv <mqtt-host> 1883

# Test MQTT connection
mosquitto_pub -h <mqtt-host> -u <user> -P <pass> -t test -m "hello"
```

### Rate limiting too strict

```bash
# Issue: Too many "429 Too Many Requests" errors
# Solution: Adjust in .env
API_RATE_LIMIT_MAX=300          # Increase from 180
IOT_RATE_LIMIT_MAX=480          # Increase from 240
```

### WebSocket connection fails

```bash
# Issue: Real-time updates not working
# Check CORS
# Verify SOCKET_CORS_ORIGIN matches frontend domain exactly
echo $SOCKET_CORS_ORIGIN  # Should be https://yourapp.vercel.app

# Check network tab (browser DevTools)
# Look for /socket.io/ connection
```

---

## Rollback Procedures

### Quick Rollback (Last Known Good)

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml stop

# List available backups
ls -lh /var/data/mysql/backups/

# Restore database from backup
mysql -u root -p climate_control < /var/data/mysql/backups/backup_2026-04-12_02-00-00.sql

# Deploy previous tag
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Version Tagging Strategy

```bash
# Tag releases
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0

# Deploy specific version
docker build -t climate-backend:v1.0.0 ./backend
docker push climate-backend:v1.0.0

# Update docker-compose
# image: climate-backend:v1.0.0
```

---

## Post-Deployment

1. **Verify all services**: Run full end-to-end test
2. **Monitor logs**: Check for errors in first hour
3. **Load test**: Simulate 100+ concurrent users
4. **Test ESP32**: Verify device can connect and push sensor data
5. **Backup immediately**: Capture database snapshot after deployment
6. **Document secrets**: Store in secrets manager with access logs

---

## Support & Escalation

- **Backend errors**: Check logs at `docker logs climate-backend`
- **Database issues**: Review MySQL slow query log
- **Real-time lag**: Monitor MQTT message latency
- **High CPU**: Profile with Docker stats `docker stats`
- **Memory leak**: Check for unclosed database connections

---

**Last updated**: 2026-04-13  
**Maintained by**: DevOps Team
