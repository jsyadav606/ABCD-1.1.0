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

// Response interceptor - Handle token refresh and common errors
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle 401 - Try to refresh token if not already refreshing
    // But skip refresh logic for login/register endpoints - let them fail normally
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register')
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return API(originalRequest)
          })
          .catch(err => Promise.reject(err))
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
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }

    // Handle 429 - Too many requests (account locked)
    if (error.response?.status === 429) {
      const message = error.response?.data?.message || 'Too many login attempts. Account temporarily locked.'
      error.message = message
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      // Do NOT log out on 403. This just means the user lacks permission for a specific resource.
      // The component (e.g., ProtectedRoute) will handle this by showing a 404/403 page.
      console.warn("Access Denied (403) - You do not have permission for this action.");
      return Promise.reject(error);
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
