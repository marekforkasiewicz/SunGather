# SunGather Dashboard

Modern React dashboard for SunGather solar monitoring system.

## Features

- ✅ Real-time WebSocket updates
- ✅ Live production/consumption metrics
- ✅ 24-hour historical charts
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark mode support
- ✅ Beautiful UI with TailwindCSS

## Prerequisites

- Node.js 18+ 
- npm or yarn
- SunGather API running on port 8000

## Installation

```bash
# Install dependencies
npm install

# or with yarn
yarn install
```

## Configuration

The dashboard expects the SunGather API to be running on `http://localhost:8000`.

If your API is on a different host/port, update `vite.config.js`:

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://your-api-host:8000',  // Change this
        changeOrigin: true,
      },
    },
  },
})
```

And update the WebSocket URL in `src/components/Dashboard.jsx`:

```jsx
const { data, isConnected, error } = useWebSocket('ws://your-api-host:8000/api/v1/ws')
```

## Development

```bash
# Start development server
npm run dev

# Dashboard will be available at:
# http://localhost:5173
```

The dev server includes:
- Hot Module Replacement (HMR)
- API proxy to avoid CORS issues
- Fast refresh on code changes

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Build output will be in `dist/` directory.

## Deployment

### Option 1: Static Hosting

Deploy `dist/` folder to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Option 2: Docker with Nginx

See `docs/DASHBOARD.md` for complete Docker Compose setup.

### Option 3: Serve with Node.js

```bash
npm install -g serve
serve -s dist -l 3000
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx        # Main dashboard page
│   ├── Layout.jsx           # App layout with header/footer
│   ├── StatusCards.jsx      # Daily/total production cards
│   ├── LiveMetrics.jsx      # Real-time power metrics
│   └── ProductionChart.jsx  # Historical chart
├── hooks/
│   └── useWebSocket.js      # WebSocket connection hook
├── store/
│   └── solarStore.js        # Zustand state management
├── utils/
│   └── format.js            # Formatting utilities
├── App.jsx                  # App router
├── main.jsx                 # React entry point
└── index.css                # Global styles
```

## Troubleshooting

### WebSocket Connection Failed

1. Ensure SunGather API is running:
   ```bash
   curl http://localhost:8000/api/v1/status
   ```

2. Check API has WebSocket enabled in `config.yaml`:
   ```yaml
   exports:
     - name: api
       enabled: True
       port: 8000
   ```

3. Check browser console for errors

### No Data in Charts

- Wait for at least one scrape cycle (default 30s)
- Check API history endpoint:
  ```bash
  curl http://localhost:8000/api/v1/history/daily
  ```

### CORS Errors

- In development, Vite proxy handles CORS
- In production, configure Nginx or API CORS settings

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Charts
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

## Contributing

See main project README for contribution guidelines.

## License

Same as main SunGather project.
