import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/useAuth";
import { isSuperAdmin } from "../../utils/permissionHelper";
import { authAPI } from "../../services/api";
import { Modal, Input, Button } from "../../components";
import "./Sidebar.css";

const Sidebar = ({ collapsed, onCloseSidebar }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);
  const assetsButtonRef = useRef(null);
  const [assetsDropdownOpen, setAssetsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Change Password modal state
  const [changePwdModal, setChangePwdModal] = useState({
    isOpen: false,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    isSubmitting: false,
  });

  // Close when clicking outside (for user panel only)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };

    if (userOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userOpen]);

  // Update dropdown position on scroll/resize when dropdown is open
  useEffect(() => {
    if (!assetsDropdownOpen || !assetsButtonRef.current) return;

    const updatePosition = () => {
      if (assetsButtonRef.current) {
        const rect = assetsButtonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Responsive dropdown width based on screen size
        let dropdownWidth = 240;
        if (window.innerWidth <= 480) {
          dropdownWidth = 160;
        } else if (window.innerWidth <= 576) {
          dropdownWidth = 176;
        } else if (window.innerWidth <= 768) {
          dropdownWidth = 192;
        }
        
        let left = rect.right;
        let top = rect.top;
        
        // Responsive: If dropdown would go off-screen on right, position it on left side
        if (left + dropdownWidth > viewportWidth - 8) {
          left = rect.left - dropdownWidth;
          if (left < 8) {
            left = 8;
          }
        }
        
        // Ensure dropdown doesn't go off-screen on top
        if (top < 8) {
          top = 8;
        }
        
        // Ensure dropdown doesn't go off-screen on bottom
        const dropdownHeight = window.innerWidth <= 480 ? 120 : 150;
        if (top + dropdownHeight > viewportHeight - 8) {
          top = Math.max(8, viewportHeight - dropdownHeight - 8);
        }
        
        setDropdownPosition({
          top: top,
          left: left,
        });
      }
    };

    // Update position on scroll and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [assetsDropdownOpen]);

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

  // Calculate dropdown position when Assets is hovered
  const handleAssetsMouseEnter = () => {
    if (assetsButtonRef.current) {
      const rect = assetsButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Responsive dropdown width based on screen size
      let dropdownWidth = 240; // Default: 15rem
      if (window.innerWidth <= 480) {
        dropdownWidth = 160; // 10rem for extra small
      } else if (window.innerWidth <= 576) {
        dropdownWidth = 176; // 11rem for small
      } else if (window.innerWidth <= 768) {
        dropdownWidth = 192; // 12rem for medium
      }
      
      // Calculate position - start from right edge of button
      let left = rect.right;
      let top = rect.top;
      
      // Responsive: If dropdown would go off-screen on right, position it on left side
      if (left + dropdownWidth > viewportWidth - 8) {
        left = rect.left - dropdownWidth;
        // If still off-screen on left, align to viewport edge
        if (left < 8) {
          left = 8;
        }
      }
      
      // Ensure dropdown doesn't go off-screen on top
      if (top < 8) {
        top = 8;
      }
      
      // Ensure dropdown doesn't go off-screen on bottom
      const dropdownHeight = window.innerWidth <= 480 ? 120 : 150;
      if (top + dropdownHeight > viewportHeight - 8) {
        top = Math.max(8, viewportHeight - dropdownHeight - 8);
      }
      
      setDropdownPosition({
        top: top,
        left: left,
      });
      setAssetsDropdownOpen(true);
    }
  };

  const handleAssetsMouseLeave = () => {
    setAssetsDropdownOpen(false);
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

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = changePwdModal;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setChangePwdModal((prev) => ({
        ...prev,
        error: "All fields are required",
      }));
      return;
    }

    const PASSWORD_LENGTH =
      Number(import.meta.env.VITE_PASSWORD_LENGTH) || 8;

    if (newPassword.length < PASSWORD_LENGTH) {
      setChangePwdModal((prev) => ({
        ...prev,
        error: `New password must be at least ${PASSWORD_LENGTH} characters`,
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePwdModal((prev) => ({
        ...prev,
        error: "New password and confirm password do not match",
      }));
      return;
    }

    setChangePwdModal((prev) => ({ ...prev, error: "", isSubmitting: true }));

    try {
      await authAPI.changePassword(oldPassword, newPassword, confirmPassword);
      handleCloseChangePwdModal();
      await logout();
      window.location.href = "/login";
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to change password";
      setChangePwdModal((prev) => ({
        ...prev,
        error: msg,
        isSubmitting: false,
      }));
    }
  };

  return (
    <nav className={`menu-bar ${collapsed ? "open" : ""}`}>
      <ul className="menu">
        <li>
          <Link to="/users" onClick={handleMenuItemClick}>
            <span className="material-icons">person</span>
            <span className="menu-text">User</span>
          </Link>
        </li>

        {/* ASSETS - Dropdown Menu */}
        <li
          className="dropdown"
          onMouseEnter={handleAssetsMouseEnter}
          onMouseLeave={handleAssetsMouseLeave}
        >
          <button ref={assetsButtonRef} className="menu-btn">
            <span className="material-icons">inventory</span>
            <span className="menu-text">Assets</span>
            <span className="dropdown-arrow">▼</span>
          </button>
        </li>

        <li>
          <Link to="/issue-item" onClick={handleMenuItemClick}>
            <span className="material-icons">assignment_ind</span>
            <span className="menu-text">Issue To</span>
          </Link>
        </li>

        <li>
          <Link to="/repair" onClick={handleMenuItemClick}>
            <span className="material-icons">build</span>
            <span className="menu-text">Repair</span>
          </Link>
        </li>

        <li>
          <Link to="/upgrade" onClick={handleMenuItemClick}>
            <span className="material-icons">upgrade</span>
            <span className="menu-text">Upgrade</span>
          </Link>
        </li>

        <li>
          <Link to="/report" onClick={handleMenuItemClick}>
            <span className="material-icons">bar_chart</span>
            <span className="menu-text">Report</span>
          </Link>
        </li>

        {isSuperAdmin() && (
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
            onClick={() => setUserOpen((prev) => !prev)}
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
            <button onClick={() => setUserOpen(false)}>
              <span className="material-icons">image</span> Change Image
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
              <span className=" ">lock</span> Change Password
            </button>
            <button
              onClick={async () => {
                setUserOpen(false);
                try {
                  await logout();
                } catch (e) {
                  console.error("Logout failed:", e);
                }
                // Hard redirect ensures full cleanup (no stale React state)
                window.location.href = "/login";
              }}
            >
              <span className="material-icons">logout</span> Logout
            </button>
          </div>
        </div>
      )}

      {/* Assets Dropdown Menu - Rendered at document body level to escape sidebar overflow */}
      {assetsDropdownOpen &&
        createPortal(
          <ul
            className="dropdown-menu"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
            onMouseEnter={handleAssetsMouseEnter}
            onMouseLeave={handleAssetsMouseLeave}
          >
            <li>
              <Link to="/inventory" onClick={handleMenuItemClick}>
                <span className="material-icons">inventory_2</span>
                <span className="menu-text">Inventory</span>
              </Link>
            </li>
            <li>
              <Link to="/accessory" onClick={handleMenuItemClick}>
                <span className="material-icons">devices_other</span>
                <span className="menu-text">Accessories</span>
              </Link>
            </li>
            <li>
              <Link to="/peripheral" onClick={handleMenuItemClick}>
                <span className="material-icons">keyboard</span>
                <span className="menu-text">Peripherals</span>
              </Link>
            </li>
          </ul>,
          document.body
        )}

      {/* Change Password Modal - Rendered at document body level */}
      {createPortal(
        <Modal
          isOpen={changePwdModal.isOpen}
          onClose={handleCloseChangePwdModal}
          title="Change Password"
          size="sm"
        >
          <form
            onSubmit={handleChangePasswordSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
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
              <div style={{ color: "#dc3545", fontSize: "0.875rem" }}>
                {changePwdModal.error}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
                marginTop: "0.5rem",
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={handleCloseChangePwdModal}
                disabled={changePwdModal.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={changePwdModal.isSubmitting}
              >
                {changePwdModal.isSubmitting ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Modal>,
        document.body
      )}
    </nav>
  );
};

export default Sidebar;
