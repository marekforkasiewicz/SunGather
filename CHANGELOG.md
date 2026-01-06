# Changelog

All notable changes to SunGather will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Deployment Automation 🚀
- **Automated Installation Script** (`install.sh`)
  - One-line installation command
  - Automatic Docker & Docker Compose installation
  - System requirements checking
  - Interactive inverter configuration
  - Health check validation
  - Beautiful terminal UI with colors

- **Deployment Script** (`deploy.sh`)
  - Git pull automation
  - Container rebuild and restart
  - Health check validation
  - Service status display
  - Automatic cleanup of orphaned containers

- **Docker Compose Stack** (`compose.yaml`)
  - Multi-service orchestration
  - SunGather backend service
  - React dashboard with Nginx
  - Health checks for all services
  - Network isolation
  - Volume management
  - Automatic restart policies

- **Production Dockerfile for Dashboard** (`dashboard/Dockerfile.prod`)
  - Multi-stage build (Node.js + Nginx)
  - Optimized image size
  - Nginx configuration included
  - Health check support
  - Gzip compression
  - Static asset caching

- **Nginx Configuration** (`dashboard/nginx.conf`)
  - API proxy to backend
  - WebSocket support
  - Static asset caching
  - Gzip compression
  - Security headers
  - SPA routing support

- **Environment Configuration** (`.env.example`)
  - Timezone configuration
  - Port mappings
  - API URL configuration
  - Docker Compose settings

- **Quick Start Guide** (`QUICKSTART.md`)
  - Three installation options
  - Command reference
  - Troubleshooting guide
  - Configuration examples

### Added - Modern Web Dashboard 🎆
- **FastAPI Backend** (`SunGather/exports/api.py`)
  - RESTful API with 7 endpoints
  - WebSocket support for real-time updates
  - Swagger/OpenAPI documentation at `/api/docs`
  - CORS support for development
  - In-memory history storage (24h, 1440 points)
  - Automatic broadcast to WebSocket clients

- **React Frontend** (`dashboard/`)
  - Modern React 18 with Vite build tool
  - TailwindCSS for responsive styling
  - Recharts for interactive charts
  - Zustand for state management
  - Real-time WebSocket connection
  - Dark mode support
  - Mobile-responsive design
  - 15 component files
  - Complete UI/UX implementation

- **API Endpoints:**
  - `GET /api/v1/status` - System status
  - `GET /api/v1/registers` - All register values
  - `GET /api/v1/registers/{name}` - Single register
  - `GET /api/v1/summary` - Dashboard summary
  - `GET /api/v1/history/daily` - Historical data
  - `GET /api/v1/config` - Configuration
  - `WS /api/v1/ws` - WebSocket real-time updates

- **Dependencies:**
  - FastAPI ~=0.109.0
  - uvicorn[standard] ~=0.27.0
  - websockets ~=12.0

### Added - Health Check ❤️‍🩹
- Health check endpoint `/health` for basic application status monitoring
- Detailed health check endpoint `/health/detailed` with comprehensive metrics
- Docker HEALTHCHECK support in Dockerfile
- Health check documentation in `docs/HEALTHCHECK.md`
- Uptime tracking in webserver
- Last scrape time and status tracking
- Human-readable uptime formatting

### Changed
- Webserver now tracks application health status
- Added curl to Docker image for health checks
- Updated requirements.txt with FastAPI dependencies
- Dockerfile now supports multi-service architecture

### Documentation
- Complete health check documentation with examples (`docs/HEALTHCHECK.md`)
- Modern Web Dashboard architecture and guide (`docs/DASHBOARD.md`)
- Fork features overview (`FORK_FEATURES.md`)
- Quick start guide (`QUICKSTART.md`)
- API endpoint documentation with examples
- React component examples
- Docker, Docker Compose, and Kubernetes integration guides
- Deployment guide with Nginx configuration
- Troubleshooting sections
- Best practices and use cases

---

## Technical Details

### Deployment Features
- One-line installation: `curl -fsSL https://raw.githubusercontent.com/.../install.sh | bash`
- Automatic dependency installation (Docker, Docker Compose)
- System requirements validation (OS, disk space)
- Interactive configuration wizard
- Health check validation after installation
- Beautiful terminal UI with colors and progress indicators
- Automatic service discovery and URL display

### Docker Stack
- **Services:**
  - `sungather` - Python backend (ports 8000, 8080)
  - `dashboard` - React frontend with Nginx (port 3000)
- **Health Checks:**
  - SunGather: curl localhost:8080/health every 30s
  - Dashboard: curl localhost:80 every 30s
- **Networks:**
  - Isolated bridge network for inter-service communication
- **Volumes:**
  - Config file mounted read-only
  - Logs directory for persistence

### Health Check Features
- HTTP 200/503 status codes based on application health
- Tracks uptime, last scrape time, register count, inverter connection
- Compatible with Docker, Kubernetes, and monitoring systems
- Configurable health check intervals and timeouts

### Docker Integration
- HEALTHCHECK runs every 30 seconds
- 40 second start period for initialization
- 3 retry attempts before marking unhealthy
- Automatic container restart on health check failure

### Dashboard Features
- Real-time WebSocket updates (push-based)
- Live production/consumption metrics
- 24-hour historical data with charts
- Responsive design (mobile/tablet/desktop)
- Dark mode support
- Interactive charts with Recharts
- REST API with Swagger documentation

### Monitoring Integration
- Compatible with Prometheus blackbox_exporter
- Kubernetes liveness and readiness probes
- Load balancer health checks
- CI/CD pipeline integration

---

## Roadmap

### Phase 1 - Foundation ✅
- ✅ Health check endpoints
- ✅ FastAPI backend
- ✅ React dashboard structure
- ✅ Complete frontend implementation
- ✅ Deployment automation
- ✅ Docker Compose stack

### Phase 2 - Enhancement (Planned)
- [ ] Multi-day/week/month charts
- [ ] Energy flow diagram (Sankey chart)
- [ ] Financial statistics (savings, ROI)
- [ ] Alerts and notifications
- [ ] Export data (CSV, PDF)
- [ ] User settings panel
- [ ] Telegram Bot integration

### Phase 3 - Advanced (Future)
- [ ] Multiple inverter support
- [ ] Weather integration
- [ ] ML-based forecasting
- [ ] Mobile app (React Native)
- [ ] Persistent storage (PostgreSQL/TimescaleDB)
- [ ] Authentication & user management
- [ ] Cloud deployment templates (AWS, Azure, GCP)

---

## Previous Versions

For changes in versions before this fork, see:
- [bohdan-s/SunGather](https://github.com/bohdan-s/SunGather)
- [michbeck100/SunGather](https://github.com/michbeck100/SunGather)
