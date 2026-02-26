import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/useAuth";
import { isSuperAdmin, canAccessModule, canAccessPage } from "../../utils/permissionHelper";
import { authAPI } from "../../services/api";
import { Modal, Input, Button } from "../../components";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onCloseSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  // Dropdown states
  const [assetsDropdownOpen, setAssetsDropdownOpen] = useState(false);

  // Change Password Modal State
  const [changePwdModal, setChangePwdModal] = useState({
    isOpen: false,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    isSubmitting: false,
  });

  // Handle click outside user panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout on client side even if server fails
      logout();
      navigate("/login");
    }
  };

  // Handle menu item click
  const handleMenuItemClick = () => {
    setUserOpen(false);
    setAssetsDropdownOpen(false);
    // Close sidebar on mobile when menu item is clicked
    if (onCloseSidebar) {
      onCloseSidebar();
    }
  };


  // Handle user panel outside click
  const handleUserPanelClick = (e) => {
    e.stopPropagation();
  };

  // Toggle User Panel
  const toggleUserPanel = (e) => {
    e.stopPropagation();
    setUserOpen(!userOpen);
    setAssetsDropdownOpen(false); // Close other dropdowns
  };

  // Handle Assets Dropdown Hover
  const handleAssetsMouseEnter = () => {
    if (window.innerWidth > 992) {
      setAssetsDropdownOpen(true);
      setUserOpen(false);
    }
  };

  const handleAssetsMouseLeave = () => {
    if (window.innerWidth > 992) {
      setAssetsDropdownOpen(false);
    }
  };

  // Handle Assets Click (Mobile/Tablet)
  const handleAssetsClick = (e) => {
    if (window.innerWidth <= 992) {
      e.preventDefault();
      setAssetsDropdownOpen(!assetsDropdownOpen);
    }
  };

  const handleCloseChangePwdModal = () => {
    setChangePwdModal({
      isOpen: false,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      error: "",
      isSubmitting: false,
    });
    setUserOpen(false);
  };

  const handleChangePasswordSubmit = async () => {
    // Basic validation
    if (!changePwdModal.oldPassword || !changePwdModal.newPassword || !changePwdModal.confirmPassword) {
      setChangePwdModal(prev => ({ ...prev, error: "All fields are required" }));
      return;
    }

    if (changePwdModal.newPassword !== changePwdModal.confirmPassword) {
      setChangePwdModal(prev => ({ ...prev, error: "New passwords do not match" }));
      return;
    }

    if (changePwdModal.newPassword.length < 8) {
      setChangePwdModal(prev => ({ ...prev, error: "Password must be at least 8 characters" }));
      return;
    }

    setChangePwdModal(prev => ({ ...prev, isSubmitting: true, error: "" }));

    try {
      await authAPI.changePassword({
        oldPassword: changePwdModal.oldPassword,
        newPassword: changePwdModal.newPassword,
        confirmPassword: changePwdModal.confirmPassword
      });
      
      alert("Password changed successfully. Please login again.");
      logout();
      navigate("/login");
    } catch (err) {
      setChangePwdModal(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        error: err.response?.data?.message || "Failed to change password" 
      }));
    }
  };

  return (
    <>
      <nav className={`menu-bar ${isOpen ? "open" : ""}`}>
        <ul className="menu">
          <li>
            <Link to="/dashboard" onClick={handleMenuItemClick}>
              <span className="material-icons">dashboard</span>
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>

          {/* User Management Module */}
          {(isSuperAdmin() || canAccessModule("users")) && (
            <li>
              <Link to="/users" onClick={handleMenuItemClick}>
                <span className="material-icons">people</span>
                <span className="menu-text">User Management</span>
              </Link>
            </li>
          )}

          {/* Asset Management Module */}
          {(isSuperAdmin() || canAccessModule("assets")) && (
            <li
              className={`dropdown ${assetsDropdownOpen ? "open" : ""}`}
              onMouseEnter={handleAssetsMouseEnter}
              onMouseLeave={handleAssetsMouseLeave}
            >
              <a href="#" onClick={handleAssetsClick} className="dropdown-toggle">
                <span className="material-icons">inventory_2</span>
                <span className="menu-text">Asset Management</span>
                <span className="material-icons dropdown-arrow">chevron_left</span>
              </a>
              {assetsDropdownOpen && (
                <ul className="dropdown-menu">
                  {(isSuperAdmin() || canAccessPage("assets", "inventory")) && (
                    <li>
                      <Link to="/assets" onClick={handleMenuItemClick}>
                        <span className="material-icons">list_alt</span>
                        Inventory
                      </Link>
                    </li>
                  )}
                  {(isSuperAdmin() || canAccessPage("assets", "accessories")) && (
                    <li>
                      <Link to="/assets/accessories" onClick={handleMenuItemClick}>
                        <span className="material-icons">headphones</span>
                        Accessories
                      </Link>
                    </li>
                  )}
                  {(isSuperAdmin() || canAccessPage("assets", "peripherals")) && (
                    <li>
                      <Link to="/assets/peripherals" onClick={handleMenuItemClick}>
                        <span className="material-icons">mouse</span>
                        Peripherals
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}

          {/* Upgrade Request Module */}
          {(isSuperAdmin() || canAccessModule("upgrades")) && (
            <li>
              <Link to="/requests" onClick={handleMenuItemClick}>
                <span className="material-icons">assignment</span>
                <span className="menu-text">Upgrade Requests</span>
              </Link>
            </li>
          )}

          {/* Upgrade Request Module */}
          {(isSuperAdmin() || canAccessModule("issueTo")) && (
            <li>
              <Link to="/requests" onClick={handleMenuItemClick}>
                <span className="material-icons">assignment</span>
                <span className="menu-text">Issue To</span>
              </Link>
            </li>
          )}

          {/* Reports Module */}
          {(isSuperAdmin() || canAccessModule("reports")) && (
            <li>
              <Link to="/report" onClick={handleMenuItemClick}>
                <span className="material-icons">bar_chart</span>
                <span className="menu-text">Report</span>
              </Link>
            </li>
          )}

          {/* Setup Module */}
          {(isSuperAdmin() || canAccessModule("setup")) &&(
            <li>
              <Link to="/setup" onClick={handleMenuItemClick}>
                <span className="material-icons">settings</span>
                <span className="menu-text">Setup</span>
              </Link>
            </li>
          )}
        </ul>

      {/* USER DETAILS (BOTTOM SECTION) */}
      {user && (
        <div
          ref={userRef}
          className={`user-details ${userOpen ? "active" : ""}`}
        >
          <button
            className="user-toggle"
            onClick={toggleUserPanel}
            title="User menu"
          >
            <span className="material-icons">account_circle</span>
            <span className="menu-text">{user?.name || "User"}</span>
          </button>

          <div className="user-panel" onClick={handleUserPanelClick}>
            <button
              onClick={() => {
                navigate("/profile");
                setUserOpen(false);
              }}
            >
              <span className="material-icons">person</span> Profile
            </button>
            <button
              onClick={() => {
                setChangePwdModal((prev) => ({
                  ...prev,
                  isOpen: true,
                  error: "",
                }));
                setUserOpen(false);
              }}
            >
              <span className="material-icons">lock</span> Change Password
            </button>
            <button onClick={handleLogout}>
              <span className="material-icons">logout</span> Logout
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal - Rendered at document body level */}
      {createPortal(
        <Modal
          isOpen={changePwdModal.isOpen}
          onClose={handleCloseChangePwdModal}
          title="Change Password"
        >
          <div className="modal-body">
          <Input
            type="password"
            label="Current Password"
            placeholder="Enter current password"
            value={changePwdModal.oldPassword}
            onChange={(e) =>
              setChangePwdModal((prev) => ({
                ...prev,
                oldPassword: e.target.value,
                error: "",
              }))
            }
            required
            disabled={changePwdModal.isSubmitting}
          />
          <Input
            type="password"
            label="New Password"
            placeholder="Enter new password (min 8 characters)"
            value={changePwdModal.newPassword}
            onChange={(e) =>
              setChangePwdModal((prev) => ({
                ...prev,
                newPassword: e.target.value,
                error: "",
              }))
            }
            required
            disabled={changePwdModal.isSubmitting}
          />
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Enter new password again"
            value={changePwdModal.confirmPassword}
            onChange={(e) =>
              setChangePwdModal((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
                error: "",
              }))
            }
            required
            disabled={changePwdModal.isSubmitting}
          />
          {changePwdModal.error && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              {changePwdModal.error}
            </div>
          )}
          </div>
          <div className="modal-footer" style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button
              variant="secondary"
              onClick={handleCloseChangePwdModal}
              disabled={changePwdModal.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangePasswordSubmit}
              disabled={changePwdModal.isSubmitting}
            >
              {changePwdModal.isSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </Modal>,
        document.body
      )}
    </nav>
    </>
  );
};

export default Sidebar;
