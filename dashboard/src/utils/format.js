/**
 * Format power value in watts to appropriate unit
 * @param {number} watts - Power in watts
 * @returns {string} Formatted power with unit
 */
export function formatPower(watts) {
  if (watts === null || watts === undefined) return 'N/A'
  
  const absWatts = Math.abs(watts)
  
  if (absWatts >= 1000000) {
    return `${(watts / 1000000).toFixed(2)} MW`
  } else if (absWatts >= 1000) {
    return `${(watts / 1000).toFixed(2)} kW`
  } else {
    return `${Math.round(watts)} W`
  }
}

/**
 * Format number with appropriate decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return 'N/A'
  return Number(value).toFixed(decimals)
}

/**
 * Format timestamp to readable date
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted date
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'N/A'
  
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format duration in seconds to human readable
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds) return '0s'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  
  return parts.join(' ')
}
