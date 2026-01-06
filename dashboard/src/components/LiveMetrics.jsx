import { Zap, Home, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { formatPower } from '../utils/format'

export default function LiveMetrics({ data, isLive }) {
  const registers = data?.registers || {}
  
  const production = registers.total_active_power?.value || 0
  const consumption = registers.load_power?.value || 0
  const gridExport = registers.export_to_grid?.value || 0
  const gridImport = registers.import_from_grid?.value || 0

  const metrics = [
    {
      icon: <Zap className="w-8 h-8" />,
      label: 'Solar Production',
      value: formatPower(production),
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      icon: <Home className="w-8 h-8" />,
      label: 'House Consumption',
      value: formatPower(consumption),
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: <ArrowUpCircle className="w-8 h-8" />,
      label: 'Grid Export',
      value: formatPower(gridExport),
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      icon: <ArrowDownCircle className="w-8 h-8" />,
      label: 'Grid Import',
      value: formatPower(gridImport),
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Live Metrics</h3>
        {isLive && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Real-time</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className={`metric-card ${metric.bgColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={metric.textColor}>{metric.icon}</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
            <p className={`text-3xl font-bold ${metric.textColor}`}>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
