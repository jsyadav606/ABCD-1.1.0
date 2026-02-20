import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

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

// Request interceptor - Add token to every request
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh and common errors
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle 401 - Try to refresh token if not already refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
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
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
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

    // Handle 403 - Forbidden (user not allowed to login)
    if (error.response?.status === 403) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }

    return Promise.reject(error)
  }
)

export default API

// Auth API endpoints
export const authAPI = {
  login: (loginId, password, deviceId) =>
    API.post('/auth/login', { loginId, password, deviceId }),
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
