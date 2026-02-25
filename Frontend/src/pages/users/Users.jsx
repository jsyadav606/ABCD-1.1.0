import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Table from "../../components/Table/Table.jsx";
import Button from "../../components/Button/Button.jsx";
import Input from "../../components/Input/Input.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import { hasPermission } from "../../utils/permissionHelper.js";
import { PageLoader } from "../../components/Loader/Loader.jsx";
import { ErrorNotification } from "../../components/ErrorBoundary/ErrorNotification.jsx";
import "./Users.css";
import {
  fetchAllUsers,
  disableUser,
  enableUser,
  toggleCanLogin,
  changeUserPassword,
} from "../../services/userApi.js";
import { SetPageTitle } from "../../components/SetPageTitle/SetPageTitle.jsx";

const Users = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [allUsers, setAllUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Change password modal state
  const [changePasswordModal, setChangePasswordModal] = useState({
    isOpen: false,
    mongoId: null,
    displayUserId: null,
    userName: null,
    newPassword: "",
    passwordError: "",
    isSubmitting: false,
    showPassword: false,
  });

  const pageSize = 20;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all users by paging until complete
        const data = await fetchAllUsers(100);
        setAllUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        setError(error.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is not on hamburger menu or dropdown
      if (!e.target.closest(".action-menu-container")) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const handleDisableRow = async (id) => {
    const user = allUsers.find((u) => u._id === id);
    const confirmed = window.confirm(
      `Are you sure you want to disable ${user?.name || "this user"}?`,
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);

      // Step 1: If user has canLogin enabled, disable it first
      if (user?.canLogin) {
        await toggleCanLogin(id, false);
      }

      // Step 2: Deactivate user (isActive: false)
      await disableUser(id);

      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? { ...u, isActive: false, status: "Inactive", canLogin: false }
            : u,
        ),
      );
    } catch (err) {
      console.error("Disable failed", err);
      setError(err.message || "Failed to disable user");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLogin = async (id, canLogin) => {
    try {
      setLoading(true);
      setError(null);
      const res = await toggleCanLogin(id, canLogin);

      // Update local state: reflect canLogin and if backend returned login credentials attach them
      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? {
                ...u,
                canLogin: canLogin,
                // if backend returned a login object, merge username info
                ...(res?.login ? { loginInfo: res.login } : {}),
              }
            : u,
        ),
      );
    } catch (err) {
      console.error("Toggle login failed", err);
      setError(err.message || "Failed to toggle login");
    } finally {
      setLoading(false);
    }
  };

  const handleEnableRow = async (id) => {
    const user = allUsers.find((u) => u._id === id);
    const confirmed = window.confirm(
      `Are you sure you want to enable ${user?.name || "this user"}?`,
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);
      // Enable user but keep canLogin as-is (do not force it to true)
      await enableUser(id);
      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isActive: true, status: "Active" } : u,
        ),
      );
    } catch (err) {
      console.error("Enable failed", err);
      setError(err.message || "Failed to enable user");
    } finally {
      setLoading(false);
    }
  };

  // Open change password modal
  const handleOpenChangePasswordModal = (mongoId, displayUserId, userName) => {
    setChangePasswordModal({
      isOpen: true,
      mongoId,
      displayUserId,
      userName,
      newPassword: "",
      passwordError: "",
      isSubmitting: false,
      showPassword: false,
    });
    setOpenMenuId(null);
  };

  // Close change password modal
  const handleCloseChangePasswordModal = () => {
    setChangePasswordModal({
      isOpen: false,
      mongoId: null,
      displayUserId: null,
      userName: null,
      newPassword: "",
      passwordError: "",
      isSubmitting: false,
      showPassword: false,
    });
  };

  // Handle change password submission
  const handleChangePasswordSubmit = async () => {
    // Validation
    if (!changePasswordModal.newPassword) {
      setChangePasswordModal((prev) => ({
        ...prev,
        passwordError: "Password is required",
      }));
      return;
    }

    if (changePasswordModal.newPassword.length < 6) {
      setChangePasswordModal((prev) => ({
        ...prev,
        passwordError: "Password must be at least 6 characters",
      }));
      return;
    }

    try {
      setChangePasswordModal((prev) => ({
        ...prev,
        isSubmitting: true,
        passwordError: "",
      }));

      await changeUserPassword(
        changePasswordModal.mongoId,
        changePasswordModal.newPassword,
      );

      setSuccessMessage(`Password changed for ${changePasswordModal.userName}`);
      handleCloseChangePasswordModal();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Change password failed", err);
      setChangePasswordModal((prev) => ({
        ...prev,
        passwordError: err.message || "Failed to change password",
      }));
    } finally {
      setChangePasswordModal((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  // Highlight text utility function
  const highlightText = (text, searchValue) => {
    if (!searchValue) return text;
    const regex = new RegExp(`(${searchValue})`, "gi");
    return String(text)
      .split(regex)
      .map((part, index) =>
        part.toLowerCase() === searchValue.toLowerCase() ? (
          <span key={index} className="highlight">
            {part}
          </span>
        ) : (
          part
        ),
      );
  };

  const columns = [
    {
      header: "User ID",
      key: "userId",
      sortable: true,
      render: (row, search) => (
        <button
          className="user-link"
          onClick={() => navigate(`/user-detail/${row._id}`)}
          title="View user details"
        >
          {highlightText(row.userId, search)}
        </button>
      ),
    },
    {
      header: "Full Name",
      key: "name",
      sortable: true,
      render: (row, search) => (
        <button
          className="user-link"
          onClick={() => navigate(`/user-detail/${row._id}`)}
          title="View user details"
        >
          {highlightText(row.name, search)}
        </button>
      ),
    },
    { header: "Designation", key: "designation", sortable: true, },
    { header: "Department", key: "department", sortable: true, },
    { header: "Branch", key: "branch", sortable: true, },
    { header: "Gender", key: "gender", sortable: true, },
    { header: "Email", key: "email", sortable: true, },
    { header: "Phone no", key: "phone_no", sortable: true, },
    { header: "Role", key: "role", sortable: true, },
    { header: "Status", key: "status", sortable: true, },
    {
      header: "Can Login",
      key: "canLogin",
      sortable: true,
      render: (row) => (row.canLogin ? "Yes" : "No"),
    },
    { header: "Remarks", key: "remarks" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="action-menu-container">
          <button
            className="hamburger-btn"
            onClick={() =>
              setOpenMenuId(openMenuId === row._id ? null : row._id)
            }
            title="More actions"
          >
            <span className="material-icons">more_vert</span>
          </button>

          {openMenuId === row._id && (
            <div className="action-dropdown-menu">
              {hasPermission("users:edit") && (
                <button
                  className="action-menu-item"
                  onClick={() => {
                    navigate(`/users/edit/${row._id}`);
                    setOpenMenuId(null);
                  }}
                >
                  Edit
                </button>
              )}

              {String(row._id) !== String(currentUser?.id) && (
                <>
                  {!row.isActive ? (
                    <>
                      {hasPermission("users:inactive") && (
                        <button
                          className="action-menu-item action-menu-item--success"
                          onClick={() => {
                            handleEnableRow(row._id);
                            setOpenMenuId(null);
                          }}
                        >
                          Active
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {hasPermission("users:inactive") && (
                        <button
                          className="action-menu-item action-menu-item--danger"
                          onClick={() => {
                            handleDisableRow(row._id);
                            setOpenMenuId(null);
                          }}
                        >
                          Inactive
                        </button>
                      )}
                      {row.canLogin ? (
                        <>
                          {hasPermission("users:disable_login") && (
                            <button
                              className="action-menu-item action-menu-item--warning"
                              onClick={() => {
                                handleToggleLogin(row._id, false);
                                setOpenMenuId(null);
                              }}
                            >
                              Disable Login
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {hasPermission("users:disable_login") && (
                            <button
                              className="action-menu-item action-menu-item--success"
                              onClick={() => {
                                handleToggleLogin(row._id, true);
                                setOpenMenuId(null);
                              }}
                            >
                              Enable Login
                            </button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {row.canLogin && hasPermission("users:change_password") && (
                <button
                  className="action-menu-item action-menu-item--info"
                  onClick={() => {
                    handleOpenChangePasswordModal(
                      row._id,
                      row.userId,
                      row.name,
                    );
                    setOpenMenuId(null);
                  }}
                >
                  Change Password
                </button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleBulkDisable = async () => {
    // Exclude current user from bulk disable
    const safeIds = selectedRows.filter((id) => String(id) !== String(currentUser?.id));
    const usersToDisable = allUsers.filter((u) => safeIds.includes(u._id));

    if (usersToDisable.length === 0) {
      setError("You cannot disable yourself. Remove yourself from selection.");
      return;
    }

    const userListText = usersToDisable
      .map((u) => `${u.name} (${u.userId})`)
      .join("\n");

    const confirmed = window.confirm(
      `Are you sure you want to disable the following users?\n\n${userListText}`,
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);
      await Promise.all(safeIds.map((id) => disableUser(id)));

      setAllUsers((prev) =>
        prev.map((u) =>
          safeIds.includes(u._id)
            ? { ...u, isActive: false, status: "Inactive", canLogin: false }
            : u,
        ),
      );

      setSelectedRows([]);
    } catch (err) {
      console.error("Bulk disable failed", err);
      setError(err.message || "Bulk disable failed");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && allUsers.length === 0) {
    return <PageLoader message="Loading users..." />;
  }

  // Table handles paging/searching/sorting internally; pass full data and pageSize

  return (
    <div className="user-details-page" style={{ padding: "2rem 1rem" }}>
      <div className="users-page">
        <SetPageTitle title="Users | ABCD" />
        {error && (
          <ErrorNotification
            error={new Error(error)}
            onClose={() => setError(null)}
          />
        )}

        <div className="page-title">
          <h2>Users</h2>
        </div>

        <section className="users-actions">
          <div className="users-actions__wrapper">
            <div className="users-actions__bar">
              {hasPermission("users:add_user") && (
                <Button
                  onClick={() => navigate("/users/add")}
                  className="users-actions__btn users-actions__btn--add"
                >
                  + Add New User
                </Button>
              )}

              {/* <Button
              onClick={() => exportToCSV(allUsers, "users.csv")}
              className="users-actions__btn users-actions__btn--export"
            >
              <span className="material-icons">file_download</span> Export
            </Button> */}

              {selectedRows.length > 1 && hasPermission("users:disable_user") && (
                <Button
                  onClick={handleBulkDisable}
                  className="btn-md delete-btn"
                >
                  Disable
                </Button>
              )}
            </div>
          </div>
        </section>

        <div className="users-table">
          <Table
            columns={columns}
            data={allUsers}
            pageSize={pageSize}
            showSearch={true}
            showPagination={true}
            rowKey={(row) => row._id}
            onSelectionChange={(selected) => setSelectedRows(selected)}
            isRowSelectable={(row) => String(row._id) !== String(currentUser?.id)}
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              padding: "12px 16px",
              borderRadius: "4px",
              zIndex: 9999,
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {/* Change Password Modal */}
        {changePasswordModal.isOpen && (
          <Modal
            isOpen={changePasswordModal.isOpen}
            onClose={handleCloseChangePasswordModal}
          >
            <div style={{ padding: "2rem", minWidth: "400px" }}>
              <h2 style={{ marginBottom: "0.5rem", marginTop: 0 }}>
                Change Password
              </h2>

              <div
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  gap: "2rem",
                  fontSize: "0.875rem",
                  color: "#666",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>User ID:</span>{" "}
                  <span style={{ fontFamily: "monospace", color: "#333" }}>
                    {changePasswordModal.displayUserId}
                  </span>
                </div>
                <div>
                  <span style={{ fontWeight: 600 }}>Name:</span>{" "}
                  {changePasswordModal.userName}
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#333",
                  }}
                >
                  New Password <span style={{ color: "#dc3545" }}>*</span>
                </label>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type={
                      changePasswordModal.showPassword ? "text" : "password"
                    }
                    value={changePasswordModal.newPassword}
                    onChange={(e) =>
                      setChangePasswordModal((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                        passwordError: "",
                      }))
                    }
                    placeholder="Enter new password (min 6 characters)"
                    disabled={changePasswordModal.isSubmitting}
                    style={{
                      width: "100%",
                      padding: "0.75rem 2.5rem 0.75rem 0.75rem",
                      border: changePasswordModal.passwordError
                        ? "1px solid #dc3545"
                        : "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setChangePasswordModal((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                    disabled={changePasswordModal.isSubmitting}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      background: "none",
                      border: "none",
                      padding: "0.5rem",
                      cursor: changePasswordModal.isSubmitting
                        ? "not-allowed"
                        : "pointer",
                      display: "flex",
                      alignItems: "center",
                      color: "#666",
                      opacity: changePasswordModal.isSubmitting ? 0.5 : 1,
                    }}
                    title={
                      changePasswordModal.showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "1.25rem" }}
                    >
                      {changePasswordModal.showPassword
                        ? "visibility_off"
                        : "visibility"}
                    </span>
                  </button>
                </div>
                {changePasswordModal.passwordError && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "0.75rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {changePasswordModal.passwordError}
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginTop: "1.5rem",
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseChangePasswordModal}
                  disabled={changePasswordModal.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleChangePasswordSubmit}
                  disabled={changePasswordModal.isSubmitting}
                >
                  {changePasswordModal.isSubmitting
                    ? "Changing..."
                    : "Change Password"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Users;
