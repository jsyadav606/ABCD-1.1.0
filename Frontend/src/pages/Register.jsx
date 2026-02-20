import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button, Alert } from '../components'
import AuthLayout from '../layouts/AuthLayout'
import './Register.css'

const Register = () => {
  const navigate = useNavigate()
  const { register, error, clearError } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [validationError, setValidationError] = useState('')

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
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
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

    if (!validateForm()) return

    setLoading(true)

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    })

    if (result.success) {
      navigate('/dashboard')
    }

    setLoading(false)
  }

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to get started">
      {error && (
        <Alert type="danger" title="Registration Error">
          {error}
        </Alert>
      )}

      {validationError && (
        <Alert type="warning" title="Validation Error">
          {validationError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <Input
          type="text"
          name="name"
          label="Full Name"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          type="email"
          name="email"
          label="Email Address"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          type="password"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="register-button"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="register-footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="login-link">
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Register
