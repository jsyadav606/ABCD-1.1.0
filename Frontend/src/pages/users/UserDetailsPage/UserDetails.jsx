import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById } from "../../../services/userApi";
import { PageLoader } from "../../../components/Loader/Loader.jsx";
import { SetPageTitle } from "../../../components/SetPageTitle/SetPageTitle.jsx";
import "./UserDetails.css";

const UserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserById(id);
        setUser({
          ...data,
          _id: data._id || data.id,
          status: data.isActive ? "Active" : "Inactive",
        });
      } catch (err) {
        setError(err.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadUser();
  }, [id]);

  if (loading && !user) return <PageLoader message="Loading user..." />;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const mockAssignedItems = [
    {
      itemType: "Laptop",
      assetCode: "LT-DEL-221",
      assignedDate: "12-Mar-2024",
      status: "Active",
    },
    {
      itemType: "Monitor",
      assetCode: "MN-DEL-089",
      assignedDate: "12-Mar-2024",
      status: "Active",
    },
    {
      itemType: "Keyboard",
      assetCode: "KB-DEL-045",
      assignedDate: "15-Mar-2024",
      status: "Active",
    },
  ];

  const mockTimeline = [
    { date: "15-Jan-2022", event: "User Created" },
    { date: "10-Mar-2023", event: "Promoted to Admin" },
    { date: "02-Jul-2024", event: "Password Reset" },
    { date: "18-Feb-2026", event: "Profile Updated" },
  ];

  const mockAuditLog = [
    {
      date: "18-Feb-2026",
      ip: "103.45.21.9",
      device: "Chrome / Windows",
      status: "Success",
      statusClass: "success",
    },
    {
      date: "15-Feb-2026",
      ip: "192.168.1.5",
      device: "Unknown",
      status: "Failed",
      statusClass: "fail",
    },
    {
      date: "12-Feb-2026",
      ip: "103.45.21.9",
      device: "Safari / macOS",
      status: "Success",
      statusClass: "success",
    },
  ];

  return (
    <>
      <SetPageTitle title={user ? `${user.name} | User Details` : "User Details"} />
      <div className="wrapper">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="profile-box">
            <div className="avatar" style={{ backgroundColor: "#2563eb" }}>
              {getInitials(user?.name || "User")}
            </div>
            <div>
            <h3>{user?.name || "User"}</h3>
            <p>
              {user?.userId || "--"} • {user?.role || "--"}
            </p>
            </div>
          </div>

          <div className="menu">
            <button
              className={`menu-item ${activeSection === "basic" ? "active" : ""}`}
              onClick={() => setActiveSection("basic")}
            >
              Basic Information
            </button>
            <button
              className={`menu-item ${activeSection === "items" ? "active" : ""}`}
              onClick={() => setActiveSection("items")}
            >
              Assigned Items
            </button>
            <button
              className={`menu-item ${activeSection === "timeline" ? "active" : ""}`}
              onClick={() => setActiveSection("timeline")}
            >
              User Timeline
            </button>
            <button
              className={`menu-item ${activeSection === "audit" ? "active" : ""}`}
              onClick={() => setActiveSection("audit")}
            >
              Audit & Login
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main">
          {error && (
            <div className="error-banner">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Basic Information */}
          <div className={`section ${activeSection === "basic" ? "active" : ""}`}>
            <h2>Basic Information</h2>
            <div className="grid">
              <div className="field">
                <div className="label">Name</div>
                <div className="value">{user?.name || "--"}</div>
              </div>
              <div className="field">
                <div className="label">Gender</div>
                <div className="value">{user?.gender || "--"}</div>
              </div>
              <div className="field">
                <div className="label">Email</div>
                <div className="value">{user?.email || "--"}</div>
              </div>
              <div className="field">
                <div className="label">Mobile</div>
                <div className="value">{user?.phone_no || "--"}</div>
              </div>
              <div className="field">
                <div className="label">Department</div>
                <div className="value">{user?.department || "--"}</div>
              </div>
              <div className="field">
                <div className="label">Designation</div>
                <div className="value">{user?.designation || "--"}</div>
              </div>
              <div className="field">
                <div className="label">Role</div>
                <div className="value">{user?.role || "--"}</div>
              </div>
              <div className="field">
                <div className="label">Can Login</div>
                <div className="value">{user?.canLogin ? "Yes" : "No"}</div>
              </div>
            </div>
          </div>

          {/* Assigned Items */}
          <div className={`section ${activeSection === "items" ? "active" : ""}`}>
            <h2>Assigned Items</h2>
            <table>
              <thead>
                <tr>
                  <th>Item Type</th>
                  <th>Asset Code</th>
                  <th>Assigned Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAssignedItems.map((item, idx) => (
                  <tr key={idx}>
                    <td data-label="Item Type">{item.itemType}</td>
                    <td data-label="Asset Code">{item.assetCode}</td>
                    <td data-label="Assigned Date">{item.assignedDate}</td>
                    <td className="status-active" data-label="Status">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Timeline */}
          <div className={`section ${activeSection === "timeline" ? "active" : ""}`}>
            <h2>User Timeline</h2>
            <ul className="timeline-list">
              {mockTimeline.map((item, idx) => (
                <li key={idx}>
                  <span className="timeline-date">{item.date}</span> → {item.event}
                </li>
              ))}
            </ul>
          </div>

          {/* Audit & Login */}
          <div className={`section ${activeSection === "audit" ? "active" : ""}`}>
            <h2>Audit & Login History</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>IP</th>
                  <th>Device</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAuditLog.map((log, idx) => (
                  <tr key={idx}>
                    <td data-label="Date">{log.date}</td>
                    <td data-label="IP">{log.ip}</td>
                    <td data-label="Device">{log.device}</td>
                    <td className={`status-${log.statusClass}`} data-label="Status">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;
