import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button, Alert } from '../components'
import AuthLayout from '../layouts/AuthLayout'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login, error, clearError, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [formData, setFormData] = useState({
    loginId: '', // Can be username, userId, or email
    password: ''
  })

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    clearError()
    setValidationError('')
  }

  const validateForm = () => {
    if (!formData.loginId.trim()) {
      setValidationError('Username, email, or user ID is required')
      return false
    }
    if (!formData.password) {
      setValidationError('Password is required')
      return false
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setValidationError('')

    const result = await login(formData.loginId, formData.password)

    if (result.success) {
      navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      {error && (
        <Alert type="danger" title="Login Error">
          {error}
        </Alert>
      )}

      {validationError && (
        <Alert type="warning" title="Validation Error">
          {validationError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <Input
          type="text"
          name="loginId"
          label="Username, Email, or User ID"
          placeholder="Enter your username, email, or user ID"
          value={formData.loginId}
          onChange={handleChange}
          required
          disabled={loading}
          autoFocus
        />

        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="login-footer">
        <p>
          Don't have an account?{' '}
          <Link to="/register" className="register-link">
            Sign up here
          </Link>
        </p>
        <p>
          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
