/**
 * API Logger - Monitor and log API requests/responses for debugging
 * This helps track 500 errors and other issues
 */

const LOG_STORAGE_KEY = 'api_logs'
const MAX_LOGS = 100
const ENABLE_LOGGING = import.meta.env.DEV // Only in development

class APILogger {
  constructor() {
    this.logs = this.getStoredLogs()
  }

  // Get logs from localStorage
  getStoredLogs() {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Failed to retrieve logs:', e)
      return []
    }
  }

  // Save logs to localStorage
  saveLogs() {
    try {
      // Keep only the last MAX_LOGS entries
      const logsToSave = this.logs.slice(-MAX_LOGS)
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logsToSave))
    } catch (e) {
      console.error('Failed to save logs:', e)
    }
  }

  // Log a request
  logRequest(method, url, status) {
    if (!ENABLE_LOGGING) return

    const log = {
      timestamp: new Date().toISOString(),
      type: 'request',
      method: method.toUpperCase(),
      url: url.replace(/^.*\/api/, '/api'), // Remove domain for brevity
      status: status || 'pending'
    }

    this.logs.push(log)
    this.saveLogs()
   
  }

  // Log a response
  logResponse(method, url, status, data = null) {
    if (!ENABLE_LOGGING) return

    const log = {
      timestamp: new Date().toISOString(),
      type: 'response',
      method: method.toUpperCase(),
      url: url.replace(/^.*\/api/, '/api'),
      status,
      success: status >= 200 && status < 300,
      error: data?.error || null
    }

    this.logs.push(log)
    this.saveLogs()

    const emoji = status >= 200 && status < 300 ? '✅' : '❌'
    
  }

  // Log an error
  logError(method, url, status, error) {
    if (!ENABLE_LOGGING) return

    const log = {
      timestamp: new Date().toISOString(),
      type: 'error',
      method: method.toUpperCase(),
      url: url.replace(/^.*\/api/, '/api'),
      status,
      message: error?.message || String(error),
      retry: error?.config?._retryCount || 0
    }

    this.logs.push(log)
    this.saveLogs()

    console.error(`[API] ⚠️  ${method.toUpperCase()} ${url.replace(/^.*\/api/, '/api')} → ${status}`, {
      message: error?.message,
      retry: error?.config?._retryCount,
      timestamp: new Date().toISOString()
    })
  }

  // Get all logs
  getAllLogs() {
    return this.logs
  }

  // Get logs for a specific endpoint
  getLogsForEndpoint(endpoint) {
    return this.logs.filter(log => log.url.includes(endpoint))
  }

  // Get recent errors
  getRecentErrors(limit = 10) {
    return this.logs
      .filter(log => log.type === 'error' || (log.status && log.status >= 400))
      .slice(-limit)
  }

  // Clear all logs
  clearLogs() {
    this.logs = []
    localStorage.removeItem(LOG_STORAGE_KEY)
    console.log('[API] Logs cleared')
  }

  // Export logs for debugging
  exportLogs() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `api-logs-${timestamp}.json`
    const dataStr = JSON.stringify(this.logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    console.log(`[API] Logs exported to ${filename}`)
  }
}

export default new APILogger()
