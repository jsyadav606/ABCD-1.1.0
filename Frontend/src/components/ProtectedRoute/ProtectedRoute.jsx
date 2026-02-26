import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Loading } from '../index'
import { hasPermission } from '../../utils/permissionHelper'
import NotFound from '../../pages/NotFound/NotFound'

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loading type="spinner" fullScreen text="Loading..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Render 404 Not Found directly to mask the existence of the page
    // or simply to indicate access denied in a "not found" style as requested
    return <NotFound />
  }

  return children
}

export default ProtectedRoute
