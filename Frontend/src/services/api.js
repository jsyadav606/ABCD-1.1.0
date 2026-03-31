/**
 * API Service (Axios Wrapper)
 * 
 * Logics:
 * - Base Instance:
 *   Creates axios instance with baseURL from VITE_API_URL and JSON headers; withCredentials for cookies.
 * - Request Interceptor:
 *   Adds Authorization header from accessToken in localStorage.
 * - Response Interceptor:
 *   On 401 (non-auth endpoints), attempts token refresh using /auth/refresh and deviceId from sessionStorage.
 *   Queues concurrent 401s while refresh is in progress; redirects to /login on failure.
 *   Handles 429 (account lock) and 403 (forbidden) gracefully without auto-logout.
 * - Utility:
 *   clearAuthHeaders() to purge default Authorization.
 * - Exported API Groups:
 *   authAPI (login, logout, profile, changePassword, etc.),
 *   userAPI (CRUD),
 *   organizationAPI, branchAPI, roleAPI.
 */

import axios from 'axios'
import apiLogger from '../utils/apiLogger'

// Dev: always use relative path to leverage Vite proxy (avoids HTTPS->HTTP mixed-content + CORS).
// Prod: allow VITE_API_URL override (separate backend domain) else fall back to relative.
const API_BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : (import.meta.env.VITE_API_URL || '/api/v1')

// Create axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important: Allow cookies (refreshToken) to be sent
})

// Track if we're currently refreshing token to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

// Retry configuration
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  isRefreshing = false
  failedQueue = []
}

const getCookieValue = (name) => {
  if (typeof document === 'undefined') return null
  const parts = String(document.cookie || '').split(';').map(s => s.trim())
  const match = parts.find(p => p.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.slice(name.length + 1))
}

// Request interceptor - Add token to every request
API.interceptors.request.use(
  config => {
    let token = localStorage.getItem('accessToken')
    // Fallback: support legacy storage format { accessToken } under "authData"
    if (!token) {
      try {
        const authDataStr = localStorage.getItem('authData')
        if (authDataStr && authDataStr !== 'undefined' && authDataStr !== 'null') {
          const authData = JSON.parse(authDataStr)
          if (authData?.accessToken) token = authData.accessToken
        }
      } catch {
        // ignore parse errors
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const method = String(config.method || 'get').toLowerCase()
    const isWrite = method === 'post' || method === 'put' || method === 'patch' || method === 'delete'
    if (isWrite && config.withCredentials) {
      const csrf = getCookieValue('csrfToken')
      if (csrf) {
        config.headers['x-csrf-token'] = csrf
      }
    }
    
    // Log the request
    apiLogger.logRequest(method, config.url)
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * Clear auth state from axios (e.g. on logout).
 * Removes cached Authorization header.
 */
export const clearAuthHeaders = () => {
  delete API.defaults.headers.common.Authorization
}

// Response interceptor - Handle token refresh, retries, and common errors
API.interceptors.response.use(
  response => {
    // Log successful response
    const method = response.config?.method || 'get'
    const url = response.config?.url
    apiLogger.logResponse(method, url, response.status, response.data)
    return response
  },
  async error => {
    const originalRequest = error.config
    const method = originalRequest?.method || 'get'
    const url = originalRequest?.url

    // Handle 401 - Try to refresh token if not already refreshing
    // But skip refresh logic for login/register endpoints - let them fail normally
    const isAuthEndpoint = url?.includes('/auth/login') || 
                          url?.includes('/auth/register')
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return API(originalRequest)
          })
          .catch(err => {
            apiLogger.logError(method, url, err.response?.status, err)
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const deviceId = sessionStorage.getItem('deviceId') || undefined
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { deviceId },
          {
            withCredentials: true // Send refreshToken cookie
          }
        )

        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        
        API.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)
        return API(originalRequest)
      } catch (err) {
        // Refresh failed - clear auth and redirect to login
        clearAuthHeaders()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        sessionStorage.removeItem('deviceId')
        processQueue(err, null)
        apiLogger.logError('POST', '/auth/refresh', err.response?.status, err)
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }

    // Handle 500 - Server errors with exponential backoff retry
    if (error.response?.status === 500 && !originalRequest._retryCount) {
      originalRequest._retryCount = 0
    }

    if (error.response?.status === 500 && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retryCount += 1
      const delay = Math.min(RETRY_DELAY_MS * Math.pow(2, originalRequest._retryCount - 1), 5000)
      
      apiLogger.logError(method, url, 500, new Error(`Server error - Retry ${originalRequest._retryCount}/${MAX_RETRIES}`))
      
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Retry the request
      try {
        return API(originalRequest)
      } catch (retryErr) {
        apiLogger.logError(method, url, retryErr.response?.status, retryErr)
        return Promise.reject(retryErr)
      }
    }

    // Handle 429 - Too many requests (account locked)
    if (error.response?.status === 429) {
      const message = error.response?.data?.message || 'Too many login attempts. Account temporarily locked.'
      error.message = message
      apiLogger.logError(method, url, 429, error)
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      // Do NOT log out on 403. This just means the user lacks permission for a specific resource.
      // The component (e.g., ProtectedRoute) will handle this by showing a 404/403 page.
      console.warn("Access Denied (403) - You do not have permission for this action.");
      apiLogger.logError(method, url, 403, error)
      return Promise.reject(error);
    }

    // Enhanced error messaging for user feedback
    if (error.response?.status && error.response.status >= 400) {
      // Use backend message if available, else generic message
      const backendMessage = error.response?.data?.message
      if (!error.message || error.message === 'Network Error') {
        error.message = backendMessage || `Error: ${error.response.status}`
      }
      apiLogger.logError(method, url, error.response.status, error)
    } else {
      apiLogger.logError(method, url, 'unknown', error)
    }

    return Promise.reject(error)
  }
)

export default API

// Auth API endpoints
export const authAPI = {
  login: (loginId, password, deviceId) =>
    API.post('/auth/login', { loginId, password, deviceId }),
  reauth: (password, deviceId) =>
    API.post('/auth/reauth', { password, deviceId }),
  register: (userData) =>
    API.post('/auth/register', userData),
  logout: (deviceId) =>
    API.post('/auth/logout', { deviceId }),
  logoutAll: () =>
    API.post('/auth/logout-all'),
  getProfile: () =>
    API.get('/auth/profile'),
  refreshToken: (deviceId) =>
    API.post('/auth/refresh', { deviceId }),
  changePassword: (oldPassword, newPassword, confirmPassword) =>
    API.post('/auth/change-password', { oldPassword, newPassword, confirmPassword }),
  getDevices: () =>
    API.get('/auth/devices'),
  validateToken: (token) =>
    API.post('/auth/validate', { token })
}

// User API endpoints
export const userAPI = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  create: (userData) => API.post('/users', userData),
  update: (id, userData) => API.put(`/users/${id}`, userData),
  delete: (id) => API.delete(`/users/${id}`)
}

// Organization API endpoints
export const organizationAPI = {
  getAll: () => API.get('/organizations'),
  getById: (id) => API.get(`/organizations/${id}`),
  create: (data) => API.post('/organizations', data),
  update: (id, data) => API.put(`/organizations/${id}`, data),
  delete: (id) => API.delete(`/organizations/${id}`)
}

// Branch API endpoints
export const branchAPI = {
  getAll: () => API.get('/branches'),
  getById: (id) => API.get(`/branches/${id}`),
  create: (data) => API.post('/branches', data),
  update: (id, data) => API.put(`/branches/${id}`, data),
  delete: (id) => API.delete(`/branches/${id}`)
}

// Role API endpoints
export const roleAPI = {
  getAll: () => API.get('/roles'),
  getById: (id) => API.get(`/roles/${id}`),
  create: (data) => API.post('/roles', data),
  update: (id, data) => API.put(`/roles/${id}`, data),
  delete: (id) => API.delete(`/roles/${id}`)
}

// Vendor API endpoints
export const vendorAPI = {
  getDropdown: () => API.get('/vendors/dropdown'),
  getAll: (params = {}) => API.get('/vendors', { params }),
  getById: (id) => API.get(`/vendors/${id}`),
  create: (data) => API.post('/vendors', data),
  update: (id, data) => API.put(`/vendors/${id}`, data),
  remove: (id) => API.delete(`/vendors/${id}`),
  toggleActive: (id) => API.post(`/vendors/${id}/toggle-active`)
}

// Lookup API endpoints
export const lookupAPI = {
  // Fetch lookups by category (e.g., 'ram_type')
  getByCategory: (category) => API.get('/lookups/category', { params: { category } }),
  // List all lookups (paginated)
  getAll: (params = {}) => API.get('/lookups', { params }),
  // Search available categories (autocomplete)
  searchCategories: (search = '') => API.get('/lookups/categories/search', { params: { search } }),
}
