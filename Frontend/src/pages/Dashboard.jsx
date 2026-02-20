import React from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "../components";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div style={{padding: "20px"}}>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome to ABCD Management System</p>
        </div>

        <div className="dashboard-grid">
          <Card title="Users" className="dashboard-card">
            <p>Total users in the system</p>
            <div className="card-stat">
              <span className="stat-number">0</span>
              <span className="stat-label">Users</span>
            </div>
            <Button variant="primary" size="sm" fullWidth>
              View Users
            </Button>
          </Card>

          <Card title="Organizations" className="dashboard-card">
            <p>Total organizations</p>
            <div className="card-stat">
              <span className="stat-number">0</span>
              <span className="stat-label">Organizations</span>
            </div>
            <Button variant="primary" size="sm" fullWidth>
              View Organizations
            </Button>
          </Card>

          <Card title="Branches" className="dashboard-card">
            <p>Total branches</p>
            <div className="card-stat">
              <span className="stat-number">0</span>
              <span className="stat-label">Branches</span>
            </div>
            <Button variant="primary" size="sm" fullWidth>
              View Branches
            </Button>
          </Card>

          <Card title="Roles" className="dashboard-card">
            <p>Total roles configured</p>
            <div className="card-stat">
              <span className="stat-number">0</span>
              <span className="stat-label">Roles</span>
            </div>
            <Button variant="primary" size="sm" fullWidth>
              View Roles
            </Button>
          </Card>
        </div>

        <Card title="Getting Started" className="dashboard-help-section">
          <ol className="getting-started-list">
            <li>Navigate to Users to manage user accounts</li>
            <li>Setup Organizations to structure your business</li>
            <li>Create Branches for different locations</li>
            <li>Configure Roles for access control</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
