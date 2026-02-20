import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components'
import './NotFound.css'

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-number">404</div>
        <h1>Page Not Found</h1>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button  variant="primary">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
