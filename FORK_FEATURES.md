# 🌟 Fork Features - SunGather Extended

This is a fork of [bohdan-s/SunGather](https://github.com/bohdan-s/SunGather) with additional features and improvements.

## ✨ New Features in This Fork

### 1. ❤️‍🩹 Health Check Endpoints

**Status:** ✅ Complete

**What's New:**
- REST API endpoint `/health` for monitoring
- Detailed health endpoint `/health/detailed` with metrics
- Docker HEALTHCHECK support
- Kubernetes liveness/readiness probe support
- Uptime tracking
- Last scrape status monitoring

**Quick Start:**
```yaml
# Enable webserver export (required)
exports:
  - name: webserver
    enabled: True
```

Then access:
- Basic: `http://localhost:8080/health`
- Detailed: `http://localhost:8080/health/detailed`

**Documentation:** See [docs/HEALTHCHECK.md](docs/HEALTHCHECK.md)

---

### 2. 🚀 Modern Web Dashboard

**Status:** ✅ Backend Complete | 🔨 Frontend Ready

**What's New:**
- **FastAPI Backend** with RESTful API
- **WebSocket** for real-time updates
- **React Dashboard** with modern UI
- **Interactive Charts** with Recharts
- **Dark Mode** support
- **Responsive Design** (mobile/tablet/desktop)
- **Historical Data** (24h in-memory)
- **Swagger/OpenAPI** documentation

#### Backend API Endpoints

```
GET  /api/v1/status          - System status
GET  /api/v1/registers       - All register values
GET  /api/v1/registers/{name} - Single register
GET  /api/v1/summary         - Dashboard summary
GET  /api/v1/history/daily   - Historical data (24h)
GET  /api/v1/config          - Configuration
WS   /api/v1/ws              - WebSocket live updates
```

#### Quick Start

**1. Enable API in config.yaml:**
```yaml
exports:
  - name: api
    enabled: True
    port: 8000
    cors_origins:
      - "http://localhost:5173"
```

**2. Start backend:**
```bash
python3 sungather.py -c config.yaml
```

**3. Start frontend:**
```bash
cd dashboard
npm install
npm run dev
```

**4. Open dashboard:**
- Frontend: `http://localhost:5173`
- API Docs: `http://localhost:8000/api/docs`

**Documentation:** See [docs/DASHBOARD.md](docs/DASHBOARD.md)

---

## 📊 Dashboard Screenshots

### Features

✅ **Real-time Monitoring**
- Live power production/consumption
- Grid export/import tracking
- Battery level (if available)
- Inverter temperature

✅ **Historical Charts**
- 6/12/24 hour production history
- Interactive charts with Recharts
- Auto-refresh every minute

✅ **Modern UI**
- TailwindCSS styling
- Dark mode toggle
- Mobile responsive
- Beautiful animations

✅ **Developer Friendly**
- Hot Module Replacement (HMR)
- API proxy in dev mode
- TypeScript ready
- ESLint configured

---

## 🐳 Docker Improvements

**Health Check:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1
```

**Check container status:**
```bash
docker ps  # See STATUS column
docker inspect --format='{{.State.Health.Status}}' sungather
```

---

## 📦 New Dependencies

### Backend
- `fastapi ~=0.109.0` - Modern web framework
- `uvicorn[standard] ~=0.27.0` - ASGI server
- `websockets ~=12.0` - WebSocket support

### Frontend (dashboard/)
- React 18
- Vite
- TailwindCSS
- Recharts
- React Router
- Zustand
- Axios
- Lucide React

---

## 📈 Architecture

```
SunGather/
├── SunGather/
│   ├── exports/
│   │   ├── api.py          ✅ NEW - FastAPI backend
│   │   ├── webserver.py    ✅ UPDATED - Health checks
│   │   └── ...
│   └── sungather.py
├── dashboard/               ✅ NEW - React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── HEALTHCHECK.md   ✅ NEW
│   └── DASHBOARD.md     ✅ NEW
├── Dockerfile           ✅ UPDATED - Healthcheck
├── requirements.txt     ✅ UPDATED - New deps
└── CHANGELOG.md         ✅ NEW
```

---

## 🛣️ Roadmap

### Phase 1 - Foundation ✅
- [x] Health check endpoints
- [x] FastAPI backend
- [x] React dashboard structure
- [x] WebSocket real-time updates
- [x] Basic charts and metrics

### Phase 2 - Enhancement (In Progress)
- [ ] Complete frontend polish
- [ ] Multi-day/week/month charts
- [ ] Energy flow diagram
- [ ] Financial statistics
- [ ] Export functionality (CSV/PDF)

### Phase 3 - Advanced (Planned)
- [ ] Multiple inverter support
- [ ] Weather integration
- [ ] ML-based forecasting
- [ ] Persistent storage (PostgreSQL/TimescaleDB)
- [ ] User authentication
- [ ] Mobile app (React Native)
- [ ] Telegram bot notifications
- [ ] Email reports

---

## 📚 Documentation

- **Health Check:** [docs/HEALTHCHECK.md](docs/HEALTHCHECK.md)
- **Dashboard:** [docs/DASHBOARD.md](docs/DASHBOARD.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Original README:** [README.md](README.md)

---

## 🚀 Quick Start Guide

### Option 1: Just Health Checks
```yaml
# config.yaml
exports:
  - name: webserver
    enabled: True
```

```bash
python3 sungather.py -c config.yaml
curl http://localhost:8080/health
```

### Option 2: Full Dashboard Experience

**Terminal 1 - Backend:**
```bash
# Add to config.yaml:
# exports:
#   - name: api
#     enabled: True

python3 sungather.py -c config.yaml
```

**Terminal 2 - Frontend:**
```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:5173
```

### Option 3: Docker
```bash
# Build
docker build -t sungather:latest .

# Run with health check
docker run -d --name sungather \
  --restart unless-stopped \
  -v $(pwd)/config.yaml:/config/config.yaml \
  -p 8000:8000 \
  -p 8080:8080 \
  sungather:latest

# Check health
docker ps  # See STATUS column
```

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 Credits

**Original Project:** [bohdan-s/SunGather](https://github.com/bohdan-s/SunGather)

**Fork Maintainer:** [@marekforkasiewicz](https://github.com/marekforkasiewicz)

**New Features:**
- Health Check System
- FastAPI Backend
- React Dashboard
- WebSocket Integration
- Modern UI/UX

---

## ❓ FAQ

**Q: Can I use this fork as a drop-in replacement?**  
A: Yes! All original features work exactly the same. New features are opt-in.

**Q: Do I need Node.js if I don't want the dashboard?**  
A: No, the dashboard is optional. Backend API and health checks work standalone.

**Q: Will this be merged upstream?**  
A: Potentially! I'm open to contributing these features back to the main project.

**Q: How do I update from the original?**  
A: Just change your git remote and pull. Config is 100% backward compatible.

---

## 🐛 Known Issues

None currently! 🎉

Report issues at: https://github.com/marekforkasiewicz/SunGather/issues

---

**⭐ If you find this fork useful, please star the repository!**
