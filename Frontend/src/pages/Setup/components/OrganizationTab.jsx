import { useState, useEffect } from "react";
import { Table, Button, Input, Modal, Card, Alert } from "../../../components";

const OrganizationTab = ({ toast, setToast }) => {
  return (
    <div className="setup-section">
      <div className="setup-section-header">
        <h2>Organization</h2>
        {/* Placeholder for future add button */}
        {/* <Button variant="primary">Add Organization</Button> */}
      </div>

      <Card>
        <div style={{ padding: "2rem", textAlign: "center", color: "#6c757d" }}>
          <p>Organization configuration will be implemented here.</p>
        </div>
      </Card>
    </div>
  );
};

export default OrganizationTab;
