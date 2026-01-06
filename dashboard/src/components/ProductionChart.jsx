import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { TrendingUp, Loader } from 'lucide-react'

export default function ProductionChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hours, setHours] = useState(24)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [hours])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/v1/history/daily?hours=${hours}&register=total_active_power`)
      
      const formatted = response.data.data.map(point => {
        const date = new Date(point.timestamp)
        return {
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          power: (point.value / 1000).toFixed(2), // Convert to kW
          timestamp: point.timestamp,
        }
      })
      
      setData(formatted)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch history:', err)
      setError('Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  const timeRanges = [6, 12, 24]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary-500" />
          <h3 className="text-xl font-bold">Production History</h3>
        </div>
        
        <div className="flex gap-2">
          {timeRanges.map(range => (
            <button
              key={range}
              onClick={() => setHours(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                hours === range
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range}h
            </button>
          ))}
        </div>
      </div>

      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available yet. Waiting for first scrape...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="time" 
              className="text-xs"
              stroke="currentColor"
            />
            <YAxis 
              label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
              className="text-xs"
              stroke="currentColor"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="power" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={false}
              name="Solar Power (kW)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
