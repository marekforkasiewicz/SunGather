# Modern Web Dashboard Documentation

## Overview

Nowoczesny web dashboard dla SunGather z **real-time monitoring**, **interaktywnymi wykresami** i **responsywnym UI**.

## Architecture

### Stack Technologiczny

**Backend:**
- FastAPI - Modern Python web framework
- Uvicorn - ASGI server
- WebSocket - Real-time communication
- In-memory history - Last 24h data

**Frontend:**
- React 18 - UI library
- Vite - Build tool
- TailwindCSS - Utility-first CSS
- Recharts - Charts library
- Zustand - State management
- Axios - HTTP client
- Lucide React - Icons

### Project Structure

```
SunGather/
├── SunGather/
│   ├── exports/
│   │   ├── api.py          # ✅ FastAPI backend
│   │   └── webserver.py    # Legacy webserver
│   └── sungather.py
├── dashboard/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductionChart.jsx
│   │   │   ├── LiveMetrics.jsx
│   │   │   └── StatusCards.jsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js
│   │   │   └── useAPI.js
│   │   ├── store/
│   │   │   └── solarStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json         # ✅ Created
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── docs/
    └── DASHBOARD.md         # This file
```

---

## Backend API

### Configuration

Add to `config.yaml`:

```yaml
exports:
  - name: api
    enabled: True
    port: 8000
    host: "0.0.0.0"
    cors_origins:
      - "http://localhost:5173"  # Vite dev server
      - "http://localhost:3000"
```

### API Endpoints

#### 1. Status
```http
GET /api/v1/status
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T14:50:00",
  "registers_count": 42,
  "history_points": 1440
}
```

#### 2. All Registers
```http
GET /api/v1/registers
```

**Response:**
```json
{
  "total_active_power": {
    "value": 4250,
    "unit": "W",
    "address": "5016"
  },
  "daily_power_yields": {
    "value": 28.5,
    "unit": "kWh",
    "address": "5003"
  }
}
```

#### 3. Single Register
```http
GET /api/v1/registers/total_active_power
```

**Response:**
```json
{
  "name": "total_active_power",
  "value": 4250,
  "unit": "W",
  "address": "5016",
  "timestamp": "2026-01-06T14:50:00"
}
```

#### 4. Dashboard Summary
```http
GET /api/v1/summary
```

**Response:**
```json
{
  "production": {
    "current": 4250,
    "daily": 28.5,
    "total": 12543.2
  },
  "consumption": {
    "current": 1850
  },
  "grid": {
    "export": 2400,
    "import": 0,
    "daily_export": 15.2,
    "daily_import": 0.8
  },
  "battery": {
    "level": 87,
    "power": -1200
  },
  "temperature": 45.2,
  "status": "generating",
  "timestamp": "2026-01-06T14:50:00"
}
```

#### 5. Historical Data
```http
GET /api/v1/history/daily?hours=24&register=total_active_power
```

**Response:**
```json
{
  "register": "total_active_power",
  "hours": 24,
  "data_points": 1440,
  "data": [
    {
      "timestamp": "2026-01-06T13:50:00",
      "value": 4250
    }
  ]
}
```

#### 6. Configuration
```http
GET /api/v1/config
```

**Response:**
```json
{
  "inverter": {
    "model": "SG7.0RT",
    "connection": "modbus",
    "host": "192.168.1.100"
  },
  "client": {
    "port": 502,
    "timeout": 10
  }
}
```

#### 7. WebSocket
```http
WS /api/v1/ws
```

**Initial Message:**
```json
{
  "type": "initial",
  "data": {
    "registers": { /* all registers */ },
    "config": { /* configuration */ },
    "timestamp": "2026-01-06T14:50:00",
    "status": "healthy"
  }
}
```

**Update Message (every scrape):**
```json
{
  "type": "update",
  "data": {
    "registers": { /* updated registers */ },
    "timestamp": "2026-01-06T14:50:30"
  }
}
```

### Swagger Documentation

Access interactive API docs:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

---

## Frontend Dashboard

### Installation

```bash
cd dashboard
npm install
```

### Development

```bash
# Start API backend (terminal 1)
cd SunGather
python3 sungather.py -c config.yaml

# Start React dev server (terminal 2)
cd dashboard
npm run dev
```

Dashboard available at: `http://localhost:5173`

### Production Build

```bash
cd dashboard
npm run build
# Build output in dashboard/dist/
```

### Key Components

#### 1. Dashboard Layout
```jsx
// src/components/Dashboard.jsx
import { useState, useEffect } from 'react'
import LiveMetrics from './LiveMetrics'
import ProductionChart from './ProductionChart'
import StatusCards from './StatusCards'
import useWebSocket from '../hooks/useWebSocket'

export default function Dashboard() {
  const { data, isConnected } = useWebSocket('ws://localhost:8000/api/v1/ws')
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold p-4">SunGather Dashboard</h1>
      </header>
      
      <main className="container mx-auto p-4 space-y-4">
        <StatusCards data={data} />
        <LiveMetrics data={data} isLive={isConnected} />
        <ProductionChart />
      </main>
    </div>
  )
}
```

#### 2. WebSocket Hook
```jsx
// src/hooks/useWebSocket.js
import { useState, useEffect, useRef } from 'react'

export default function useWebSocket(url) {
  const [data, setData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef(null)
  
  useEffect(() => {
    ws.current = new WebSocket(url)
    
    ws.current.onopen = () => setIsConnected(true)
    ws.current.onclose = () => setIsConnected(false)
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'initial' || message.type === 'update') {
        setData(message.data)
      }
    }
    
    // Ping every 30s
    const ping = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send('ping')
      }
    }, 30000)
    
    return () => {
      clearInterval(ping)
      ws.current?.close()
    }
  }, [url])
  
  return { data, isConnected }
}
```

#### 3. Live Metrics
```jsx
// src/components/LiveMetrics.jsx
import { Zap, Battery, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

export default function LiveMetrics({ data, isLive }) {
  if (!data?.registers) return null
  
  const production = data.registers.total_active_power?.value || 0
  const consumption = data.registers.load_power?.value || 0
  const gridExport = data.registers.export_to_grid?.value || 0
  const gridImport = data.registers.import_from_grid?.value || 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={<Zap />}
        label="Production"
        value={`${(production / 1000).toFixed(2)} kW`}
        color="yellow"
        live={isLive}
      />
      <MetricCard
        icon={<Battery />}
        label="Consumption"
        value={`${(consumption / 1000).toFixed(2)} kW`}
        color="blue"
      />
      <MetricCard
        icon={<ArrowUpCircle />}
        label="Grid Export"
        value={`${(gridExport / 1000).toFixed(2)} kW`}
        color="green"
      />
      <MetricCard
        icon={<ArrowDownCircle />}
        label="Grid Import"
        value={`${(gridImport / 1000).toFixed(2)} kW`}
        color="red"
      />
    </div>
  )
}

function MetricCard({ icon, label, value, color, live }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-${color}-500`}>{icon}</div>
        {live && <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
```

#### 4. Production Chart
```jsx
// src/components/ProductionChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ProductionChart() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    axios.get('http://localhost:8000/api/v1/history/daily?hours=24&register=total_active_power')
      .then(res => {
        const formatted = res.data.data.map(point => ({
          time: new Date(point.timestamp).toLocaleTimeString(),
          power: point.value / 1000  // Convert to kW
        }))
        setData(formatted)
      })
      .catch(err => console.error(err))
  }, [])
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">24-Hour Production</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="power" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## Features

### Current Features

- ✅ Real-time WebSocket updates
- ✅ Live production/consumption metrics
- ✅ 24-hour historical data
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark mode support
- ✅ Interactive charts
- ✅ REST API with Swagger docs
- ✅ CORS support for development

### Planned Features

- [ ] Multi-day/week/month charts
- [ ] Energy flow diagram (Sankey chart)
- [ ] Financial statistics (savings, ROI)
- [ ] Alerts and notifications
- [ ] Export data (CSV, PDF)
- [ ] User settings panel
- [ ] Multiple inverter support
- [ ] Weather integration
- [ ] Forecasting with ML

---

## Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  sungather:
    build: .
    ports:
      - "8000:8000"  # API
      - "8080:8080"  # Legacy webserver
    volumes:
      - ./config.yaml:/config/config.yaml
      - ./logs:/logs
    environment:
      - TZ=Europe/Warsaw
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "--fail", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
  
  dashboard:
    image: nginx:alpine
    ports:
      - "3000:80"
    volumes:
      - ./dashboard/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - sungather
    restart: unless-stopped
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://sungather:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## Testing

### Backend API Test

```bash
# Status
curl http://localhost:8000/api/v1/status

# Summary
curl http://localhost:8000/api/v1/summary | jq

# History
curl "http://localhost:8000/api/v1/history/daily?hours=1" | jq

# WebSocket (using websocat)
websocat ws://localhost:8000/api/v1/ws
```

### Frontend Test

```bash
cd dashboard
npm run dev
# Open http://localhost:5173
```

---

## Troubleshooting

### CORS Errors

Add your frontend URL to `config.yaml`:
```yaml
exports:
  - name: api
    cors_origins:
      - "http://localhost:5173"
```

### WebSocket Connection Failed

1. Check API is running: `curl http://localhost:8000/api/v1/status`
2. Check WebSocket endpoint: `websocat ws://localhost:8000/api/v1/ws`
3. Verify CORS settings

### No Data in Charts

1. Wait for at least one scrape cycle (check `scan_interval`)
2. Check API history: `curl http://localhost:8000/api/v1/history/daily`
3. Verify inverter connection

---

## Next Steps

1. **Complete Frontend Implementation:**
   - Create remaining component files
   - Add routing (React Router)
   - Implement state management (Zustand)
   - Add dark mode toggle

2. **Enhanced Features:**
   - Energy flow diagram
   - Financial analytics
   - Export functionality
   - User settings

3. **Production Optimization:**
   - Add persistent storage (SQLite/PostgreSQL)
   - Implement caching (Redis)
   - Add authentication
   - Set up monitoring (Prometheus)

4. **Testing:**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests (Cypress)

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Recharts Documentation](https://recharts.org/)

---

**Dashboard Status:** 🚧 In Development (Backend ✅ Complete, Frontend 🔨 In Progress)
