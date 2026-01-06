import { useState, useEffect, useRef } from 'react'

export default function useWebSocket(url) {
  const [data, setData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const ws = useRef(null)
  const reconnectTimeout = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10

  const connect = () => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }

      ws.current.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`Reconnecting in ${delay}ms...`)
          
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        } else {
          setError('Failed to connect after multiple attempts')
        }
      }

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error')
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'initial') {
            console.log('Received initial data')
            setData(message.data)
          } else if (message.type === 'update') {
            console.log('Received update')
            setData(prevData => ({
              ...prevData,
              ...message.data,
            }))
          }
        } catch (err) {
          console.error('Failed to parse message:', err)
        }
      }
    } catch (err) {
      console.error('Failed to create WebSocket:', err)
      setError('Failed to create WebSocket connection')
    }
  }

  useEffect(() => {
    connect()

    // Ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send('ping')
      }
    }, 30000)

    return () => {
      clearInterval(pingInterval)
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [url])

  return { data, isConnected, error }
}
