/**
 * Sidebar Layout
 * 
 * Logics:
 * - Navigation and User Panel:
 *   Renders main menu, handles mobile/desktop behavior, click-outside to close user panel.
 * - Assets Dropdown:
 *   Hover on desktop and toggle on mobile for asset module links.
 * - Change Password Modal:
 *   Local state for old/new/confirm, client-side validations,
 *   calls authAPI.changePassword(old, new, confirm), handles errors, forces logout on success.
 * - Logout:
 *   Calls backend logout and clears local session, with fallback on failure.
 */
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/useAuth";
import { isSuperAdmin, canAccessModule } from "../../utils/permissionHelper";
import { authAPI } from "../../services/api";
import { Modal, Input, Button } from "../../components";
import "./Sidebar.css";

const Sidebar = ({ onCloseSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);
  const toggleRef = useRef(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const [flyoutLeft, setFlyoutLeft] = useState(0);
  const [flyoutBottom, setFlyoutBottom] = useState(null);
  const [arrowTop, setArrowTop] = useState(24);
  const [flyoutWidth, setFlyoutWidth] = useState(260);
  const flyoutRef = useRef(null);

  

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
      const inFlyout = event.target.closest?.(".user-flyout");
      if (inFlyout) return;
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
    if (toggleRef.current) {
      const r = toggleRef.current.getBoundingClientRect();
      const GAP = 8;
      const menuBar = document.querySelector('.menu-bar');
      const menuRight = menuBar?.getBoundingClientRect?.().right ?? r.right;
      const availableWidth = Math.max(0, window.innerWidth - menuRight - GAP - 8);
      const MIN_W = 140;
      const MAX_W = 260;
      const width =
        availableWidth <= MIN_W
          ? Math.max(120, availableWidth)
          : Math.min(MAX_W, availableWidth);
      setFlyoutWidth(width);
      const leftCandidate = menuRight + GAP;
      const maxLeft = Math.max(0, window.innerWidth - width - 8);
      const leftClamped = Math.max(leftCandidate, Math.min(leftCandidate, maxLeft));
      const bottomOffset = Math.max(8, window.innerHeight - r.bottom);
      setFlyoutBottom(bottomOffset);
      setFlyoutLeft(leftClamped);
      const centerY = r.top + r.height / 2;
      setFlyoutTop(Math.max(8, centerY - 90));
      setArrowTop(24); // will correct after render
    }
    setUserOpen((prev) => !prev);
  };
  
  // After open, align arrow to toggle center and adjust if overflowing
  useEffect(() => {
    if (!userOpen || !toggleRef.current || !flyoutRef.current) return;
    const r = toggleRef.current.getBoundingClientRect();
    const fr = flyoutRef.current.getBoundingClientRect();
    const centerY = r.top + r.height / 2;
    const relativeTop = centerY - fr.top;
    setArrowTop(Math.max(12, Math.min(relativeTop, fr.height - 12)));
    // If flyout top is out of viewport, nudge bottom to keep it in view
    if (fr.top < 8) {
      const diff = 8 - fr.top;
      setFlyoutBottom((prev) => (prev !== null ? Math.max(8, prev - diff) : prev));
    }
    if (fr.bottom > window.innerHeight - 8) {
      const diff = fr.bottom - (window.innerHeight - 8);
      setFlyoutBottom((prev) => (prev !== null ? prev + diff : prev));
    }
  }, [userOpen]);


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
      await authAPI.changePassword(
        changePwdModal.oldPassword,
        changePwdModal.newPassword,
        changePwdModal.confirmPassword
      );
      
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
      <nav className="menu-bar">
        <ul className="menu">
          {/* <li>
            <Link to="/dashboard" onClick={handleMenuItemClick}>
              <span className="material-icons">dashboard</span>
              <span className="menu-text">Dashboard</span>
            </Link>
          </li> */}

          {/* User Management Module */}
          {(isSuperAdmin() || canAccessModule("users")) && (
            <li>
              <Link to="/users" onClick={handleMenuItemClick}>
                <span className="material-icons">people</span>
                <span className="menu-text">User</span>
              </Link>
            </li>
          )}

          {/* Asset Management Module - Single Clickable Item */}
          {(isSuperAdmin() || canAccessModule("assets")) && (
            <li>
              <Link to="/assets" onClick={handleMenuItemClick}>
                <span className="material-icons">inventory_2</span>
                <span className="menu-text">Asset</span>
              </Link>
            </li>
          )}

          {/* Upgrade Request Module */}
          {(isSuperAdmin() || canAccessModule("upgrades")) && (
            <li>
              <Link to="/requests" onClick={handleMenuItemClick}>
                <span className="material-icons">assignment</span>
                <span className="menu-text">Upgrade</span>
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
            ref={toggleRef}
            onClick={toggleUserPanel}
            title={user?.name || "User"}
            aria-label="Account menu"
          >
            <span className="material-icons user-avatar">account_circle</span>
            <span className="user-name">{user?.name || "User"}</span>
          </button>

          <div className="user-panel" onClick={handleUserPanelClick}></div>
          {userOpen &&
            createPortal(
              <div
                className="user-flyout"
                ref={flyoutRef}
                style={{
                  left: `${Math.round(flyoutLeft)}px`,
                  width: `${Math.round(flyoutWidth)}px`,
                  ...(flyoutBottom !== null
                    ? { bottom: `${Math.round(flyoutBottom)}px` }
                    : { top: `${Math.round(flyoutTop)}px` }),
                  ['--arrow-top']: `${Math.round(arrowTop)}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    navigate("/profile");
                    setUserOpen(false);
                  }}
                >
                  <span className="material-icons">person</span>
                  <span className="user-panel-text">Profile</span>
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
                  <span className="material-icons">lock</span>
                  <span className="user-panel-text">Change Password</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setUserOpen(false);
                  }}
                >
                  <span className="material-icons">logout</span>
                  <span className="user-panel-text">Logout</span>
                </button>
              </div>,
              document.body
            )}
          <div className="portal-anchor">
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
          </Modal>
      </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Sidebar;
