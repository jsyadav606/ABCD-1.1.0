import React, { createContext, useState, useCallback, useEffect } from 'react'
import { authAPI, clearAuthHeaders } from '../services/api'
import { clearAllAuthStorage } from '../utils/permissionHelper'
import { v4 as uuidv4 } from 'uuid'

const AuthContext = createContext({
  user: null,
  loading: true,
  error: '',
  isAuthenticated: false,
  deviceId: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  logoutAll: async () => {},
  changePassword: async () => ({ success: false }),
  clearError: () => {}
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [deviceId, setDeviceId] = useState(() => {
    const stored = sessionStorage.getItem('deviceId')
    return stored || uuidv4()
  })

  // Store device ID in session storage
  useEffect(() => {
    if (deviceId) {
      sessionStorage.setItem('deviceId', deviceId)
    }
  }, [deviceId])

  // Check if user is already logged in (on mount) and refresh profile/permissions
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')

      if (storedUser && token) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(parsed)
          setIsAuthenticated(true)
          // Refresh profile and permissions from server so role rights changes reflect on refresh
          try {
            const prof = await authAPI.getProfile()
            const data = prof.data?.data
            if (data?.user) {
              localStorage.setItem('user', JSON.stringify({
                id: data.user._id || data.user.id,
                userId: data.user.userId,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                roleId: data.user.roleId
              }))
              setUser({
                id: data.user._id || data.user.id,
                userId: data.user.userId,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                roleId: data.user.roleId
              })
            }
            if (Array.isArray(data?.permissions)) {
              localStorage.setItem('permissions', JSON.stringify(data.permissions))
            } else if ((data?.user?.role || parsed?.role) === 'super_admin') {
              localStorage.setItem('permissions', JSON.stringify(['*']))
            }
          } catch {
            // Ignore profile errors; keep current session
          }
        } catch (err) {
          console.error('Failed to parse stored user:', err)
          clearAllAuthStorage()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Extract only essential user info for localStorage (not sensitive data)
  const getMinimalUserInfo = (fullUser) => {
    if (!fullUser) return null
    return {
      id: fullUser._id || fullUser.id,
      userId: fullUser.userId,
      name: fullUser.name,
      email: fullUser.email,
      // Role: prefer populated role name if available (fullUser.roleId.name), else keep roleId
      role: fullUser.roleId?.name || null,
      roleId: fullUser.roleId?._id || fullUser.roleId || null,
    }
  }

  const login = useCallback(async (loginId, password) => {
    try {
      setLoading(true)
      setError('')
      
      // Send loginId (can be username, userId, or email) instead of email
      const response = await authAPI.login(loginId, password, deviceId)
      
      // Backend returns: { user, accessToken, deviceId, forcePasswordChange }
      const { user: userData, accessToken, deviceId: returnedDeviceId, forcePasswordChange, permissions } = response.data.data

      if (!userData || !accessToken) {
        throw new Error('Invalid response from server')
      }

      // Store minimal info only (security best practice)
      const minimalUser = getMinimalUserInfo(userData)
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(minimalUser))
      if (Array.isArray(permissions)) {
        localStorage.setItem('permissions', JSON.stringify(permissions))
      }
      
      // Update device ID if returned
      if (returnedDeviceId) {
        setDeviceId(returnedDeviceId)
        sessionStorage.setItem('deviceId', returnedDeviceId)
      }
      
      // Keep full user object in memory for the app to use
      setUser(minimalUser)
      setIsAuthenticated(true)
      
      try {
        const prof = await authAPI.getProfile()
        const perms = prof.data?.data?.permissions
        if (Array.isArray(perms)) {
          localStorage.setItem('permissions', JSON.stringify(perms))
        } else if (minimalUser?.role === 'super_admin') {
          localStorage.setItem('permissions', JSON.stringify(['*']))
        }
      } catch (e) {
        String(e)
        if (minimalUser?.role === 'super_admin') {
          localStorage.setItem('permissions', JSON.stringify(['*']))
        }
      }
      
      return { 
        success: true, 
        user: minimalUser,
        forcePasswordChange: forcePasswordChange || false
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed'
      setError(message)
      setIsAuthenticated(false)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [deviceId])
  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await authAPI.register(userData)
      // Assuming register also returns { user, accessToken }
      const { user: user_data, accessToken } = response.data.data

      // Store minimal info only (security best practice)
      const minimalUser = getMinimalUserInfo(user_data)

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(minimalUser))
      
      setUser(minimalUser)
      setIsAuthenticated(true)
      
      return { success: true, user: minimalUser }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    const currentDeviceId = deviceId
    try {
      // Call backend first (while we still have token + cookie) to invalidate refresh token
      await authAPI.logout(currentDeviceId)
    } catch (err) {
      // Still clear local state even if API fails (e.g. network error, token expired)
      console.warn('Logout API call failed, clearing local session:', err?.message)
    } finally {
      clearAuthHeaders()
      clearAllAuthStorage()
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [deviceId])

  const logoutAll = useCallback(async () => {
    try {
      await authAPI.logoutAll()
    } catch (err) {
      console.warn('Logout all API failed, clearing local session:', err?.message)
    } finally {
      clearAuthHeaders()
      clearAllAuthStorage()
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const changePassword = useCallback(async (oldPassword, newPassword, confirmPassword) => {
    try {
      setError('')
      const response = await authAPI.changePassword(oldPassword, newPassword, confirmPassword)
      return { success: true, message: response.data.message }
    } catch (err) {
      const message = err.response?.data?.message || 'Password change failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    deviceId,
    login,
    register,
    logout,
    logoutAll,
    changePassword,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.Context = AuthContext
