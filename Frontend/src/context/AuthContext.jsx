import React, { createContext, useState, useCallback, useEffect } from 'react'
import { authAPI } from '../services/api'
import { v4 as uuidv4 } from 'uuid'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [deviceId, setDeviceId] = useState(() => {
    // Generate and store device ID for this device
    const stored = sessionStorage.getItem('deviceId')
    return stored || uuidv4()
  })

  // Store device ID in session storage
  useEffect(() => {
    sessionStorage.setItem('deviceId', deviceId)
  }, [deviceId])

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('accessToken')
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        } catch (err) {
          console.error('Failed to parse stored user:', err)
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
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
      role: fullUser.role,
      roleId: fullUser.roleId
    }
  }

  const login = useCallback(async (loginId, password) => {
    try {
      setLoading(true)
      setError('')
      
      // Send loginId (can be username, userId, or email) instead of email
      const response = await authAPI.login(loginId, password, deviceId)
      
      // Backend returns: { user, accessToken, deviceId, forcePasswordChange }
      const { user: userData, accessToken, deviceId: returnedDeviceId, forcePasswordChange } = response.data.data

      if (!userData || !accessToken) {
        throw new Error('Invalid response from server')
      }

      // Store minimal info only (security best practice)
      const minimalUser = getMinimalUserInfo(userData)
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(minimalUser))
      
      // Update device ID if returned
      if (returnedDeviceId) {
        setDeviceId(returnedDeviceId)
        sessionStorage.setItem('deviceId', returnedDeviceId)
      }
      
      // Keep full user object in memory for the app to use
      setUser(minimalUser)
      setIsAuthenticated(true)
      
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
    try {
      await authAPI.logout(deviceId)
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [deviceId])

  const logoutAll = useCallback(async () => {
    try {
      await authAPI.logoutAll()
    } catch (err) {
      console.error('Logout all error:', err)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
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
