import LiveMetrics from './LiveMetrics'
import ProductionChart from './ProductionChart'
import StatusCards from './StatusCards'
import useWebSocket from '../hooks/useWebSocket'
import { AlertCircle, Wifi, WifiOff } from 'lucide-react'

export default function Dashboard() {
  const { data, isConnected, error } = useWebSocket('ws://localhost:8000/api/v1/ws')

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <p className="font-medium text-red-900 dark:text-red-200">Connection Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <StatusCards data={data} />

      {/* Live Metrics */}
      <LiveMetrics data={data} isLive={isConnected} />

      {/* Production Chart */}
      <ProductionChart />
    </div>
  )
}
