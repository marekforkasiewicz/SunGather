# 🚀 SunGather - Quick Start Guide

## Option 1: Automated Installation (Recommended)

### One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/marekforkasiewicz/SunGather/main/install.sh | bash
```

This will:
- ✅ Check system requirements
- ✅ Install Docker & Docker Compose (if needed)
- ✅ Clone SunGather repository
- ✅ Create configuration files
- ✅ Build and start the stack
- ✅ Display access URLs

**Installation time:** ~5 minutes

---

## Option 2: Manual Installation

### Prerequisites

- Linux (Ubuntu/Debian recommended) or macOS
- Docker 20.10+
- Docker Compose 2.0+
- Git
- 2GB+ free disk space

### Step 1: Clone Repository

```bash
git clone https://github.com/marekforkasiewicz/SunGather.git
cd SunGather
```

### Step 2: Configure

```bash
# Copy config template
cp SunGather/config-example.yaml config.yaml

# Copy environment template
cp .env.example .env

# Edit inverter settings
nano config.yaml
```

**Minimum required in config.yaml:**

```yaml
inverter:
  host: 192.168.1.100        # Your inverter IP
  connection: modbus          # or http/sungrow

exports:
  - name: webserver
    enabled: True
  
  - name: api
    enabled: True
    port: 8000
```

### Step 3: Start Services

```bash
# Build and start
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 4: Access Dashboards

- **Modern Dashboard:** http://localhost:3000
- **API Documentation:** http://localhost:8000/api/docs
- **Legacy Webserver:** http://localhost:8080
- **Health Check:** http://localhost:8080/health

---

## Option 3: Development Mode

### Backend Only

```bash
# Install Python dependencies
pip3 install -r requirements.txt

# Run SunGather
python3 sungather.py -c config.yaml
```

Access:
- API: http://localhost:8000/api/docs
- Webserver: http://localhost:8080

### Frontend Only

```bash
cd dashboard
npm install
npm run dev
```

Access:
- Dashboard: http://localhost:5173

---

## Quick Commands

### Update to Latest Version

```bash
cd SunGather
./deploy.sh
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f sungather
docker compose logs -f dashboard
```

### Restart Services

```bash
# All services
docker compose restart

# Specific service
docker compose restart sungather
```

### Stop Services

```bash
docker compose down
```

### Rebuild After Changes

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## Troubleshooting

### No Data Showing

```bash
# Check inverter connection in config.yaml
# Wait 30 seconds for first scrape
# Check logs:
docker compose logs sungather
```

### WebSocket Not Connecting

```bash
# Verify API is running:
curl http://localhost:8000/api/v1/status

# Check CORS settings in config.yaml
```

### Container Won't Start

```bash
# Check Docker:
docker ps -a

# View container logs:
docker logs sungather_backend

# Rebuild:
docker compose build --no-cache
```

### Permission Errors

```bash
# Add user to docker group:
sudo usermod -aG docker $USER

# Log out and back in
```

---

## Configuration Examples

### Minimal Config (Modbus)

```yaml
inverter:
  host: 192.168.1.100
  connection: modbus

exports:
  - name: webserver
    enabled: True
  - name: api
    enabled: True
```

### With MQTT (Home Assistant)

```yaml
inverter:
  host: 192.168.1.100
  connection: modbus

exports:
  - name: mqtt
    enabled: True
    host: 192.168.1.200
    homeassistant: True
  
  - name: api
    enabled: True
```

### With InfluxDB

```yaml
inverter:
  host: 192.168.1.100
  connection: modbus

exports:
  - name: influxdb
    enabled: True
    url: "http://localhost:8086"
    token: "your-token"
    org: "Default"
    bucket: "SunGather"
  
  - name: api
    enabled: True
```

---

## What's Included

### Services

| Service | Port | Description |
|---------|------|-------------|
| SunGather | 8000 | FastAPI backend |
| Dashboard | 3000 | React dashboard |
| Webserver | 8080 | Legacy UI + health |

### Features

- ✅ Real-time monitoring via WebSocket
- ✅ 24-hour historical charts
- ✅ REST API with Swagger docs
- ✅ Health checks for all services
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Docker & Docker Compose ready
- ✅ MQTT integration
- ✅ Home Assistant support
- ✅ InfluxDB export

---

## Next Steps

1. **Configure Inverter** - Edit `config.yaml` with your settings
2. **Explore API** - Visit http://localhost:8000/api/docs
3. **Customize Dashboard** - Edit dashboard colors/layout
4. **Add Integrations** - MQTT, InfluxDB, PVOutput
5. **Set Up Monitoring** - Prometheus, Grafana, alerts

---

## Documentation

- [Fork Features](FORK_FEATURES.md) - What's new in this fork
- [Health Check](docs/HEALTHCHECK.md) - Health monitoring guide
- [Dashboard](docs/DASHBOARD.md) - Dashboard architecture
- [Changelog](CHANGELOG.md) - Version history
- [Original README](README.md) - Full documentation

---

## Support

- **Issues:** https://github.com/marekforkasiewicz/SunGather/issues
- **Discussions:** https://github.com/marekforkasiewicz/SunGather/discussions
- **Original Project:** https://github.com/bohdan-s/SunGather

---

**Happy Monitoring! ☀️**
