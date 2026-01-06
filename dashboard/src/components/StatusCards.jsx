import { Sun, Battery, Zap, TrendingUp } from 'lucide-react'
import { formatNumber } from '../utils/format'

export default function StatusCards({ data }) {
  const registers = data?.registers || {}
  
  const dailyProduction = registers.daily_power_yields?.value || 0
  const totalProduction = registers.total_power_yields?.value || 0
  const batteryLevel = registers.battery_level?.value || null
  const temperature = registers.internal_temperature?.value || null

  const cards = [
    {
      icon: <Sun className="w-6 h-6" />,
      label: 'Daily Production',
      value: `${formatNumber(dailyProduction)} kWh`,
      color: 'yellow',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Total Production',
      value: `${formatNumber(totalProduction)} kWh`,
      color: 'green',
    },
    ...(batteryLevel !== null ? [{
      icon: <Battery className="w-6 h-6" />,
      label: 'Battery Level',
      value: `${Math.round(batteryLevel)}%`,
      color: 'blue',
    }] : []),
    ...(temperature !== null ? [{
      icon: <Zap className="w-6 h-6" />,
      label: 'Temperature',
      value: `${formatNumber(temperature)}°C`,
      color: 'red',
    }] : []),
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className={`text-${card.color}-500 mb-2`}>
            {card.icon}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.label}</p>
          <p className="text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
