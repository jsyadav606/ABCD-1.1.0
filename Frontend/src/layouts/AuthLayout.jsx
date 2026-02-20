import React from 'react'
import { Card } from '../components'
import './AuthLayout.css'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>ABCD</h1>
          <p>Manage Your Organization</p>
        </div>

        <Card className="auth-card">
          {title && <h2 className="auth-title">{title}</h2>}
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          <div className="auth-content">{children}</div>
        </Card>

        <div className="auth-footer">
          <p>&copy; 2026 ABCD. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
