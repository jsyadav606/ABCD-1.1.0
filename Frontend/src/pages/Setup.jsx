import { useEffect, useState } from "react";
import { roleAPI, branchAPI } from "../services/api";
import { Table, Button, Input, Select, Modal, Card, Alert } from "../components";
import { getPermissionDisplayName } from "../utils/permissionHelper";
import "./Setup.css";

const USER_PERMISSIONS = [
  "user:create",
  "user:read",
  "user:update",
  "user:disable",
  "user:delete",
  "user:change_password",
];

const Setup = () => {
  const [activeTab, setActiveTab] = useState("roles");

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState("");

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    displayName: "",
    description: "",
    isActive: true,
    isDefault: false,
    permissionKeys: [],
  });
  const [roleFormError, setRoleFormError] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    address: "",
    isActive: true,
  });
  const [branchFormError, setBranchFormError] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);

  const [toast, setToast] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ type: "", message: "" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      setRolesError("");
      const response = await roleAPI.getAll();
      const data = response.data?.data || response.data || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to load roles";
      setRolesError(message);
    } finally {
      setRolesLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      setBranchesLoading(true);
      setBranchesError("");
      const response = await branchAPI.getAll();
      const data = response.data?.data || response.data || [];
      setBranches(Array.isArray(data) ? data : []);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load branches";
      setBranchesError(message);
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadBranches();
  }, []);

  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleForm({
      name: "",
      displayName: "",
      description: "",
      isActive: true,
      isDefault: false,
      permissionKeys: [],
    });
    setRoleFormError("");
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name || "",
      displayName: role.displayName || "",
      description: role.description || "",
      isActive: role.isActive !== false,
      isDefault: role.isDefault === true,
      permissionKeys: Array.isArray(role.permissionKeys)
        ? role.permissionKeys
        : [],
    });
    setRoleFormError("");
    setRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleRoleCheckboxChange = (permissionKey) => {
    setRoleForm((prev) => {
      const exists = prev.permissionKeys.includes(permissionKey);
      return {
        ...prev,
        permissionKeys: exists
          ? prev.permissionKeys.filter((p) => p !== permissionKey)
          : [...prev.permissionKeys, permissionKey],
      };
    });
  };

  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleToggleChange = (name) => {
    setRoleForm((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const saveRole = async () => {
    if (!roleForm.name.trim() || !roleForm.displayName.trim()) {
      setRoleFormError("Role name and display name are required");
      return;
    }

    try {
      setSavingRole(true);
      setRoleFormError("");

      const payload = {
        name: roleForm.name.trim(),
        displayName: roleForm.displayName.trim(),
        description: roleForm.description?.trim() || "",
        isActive: roleForm.isActive,
        isDefault: roleForm.isDefault,
        permissionKeys: roleForm.permissionKeys,
      };

      if (editingRole) {
        await roleAPI.update(editingRole._id || editingRole.id, payload);
        setToast({ type: "success", message: "Role updated successfully" });
      } else {
        await roleAPI.create(payload);
        setToast({ type: "success", message: "Role created successfully" });
      }

      closeRoleModal();
      await loadRoles();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to save role";
      setRoleFormError(message);
    } finally {
      setSavingRole(false);
    }
  };

  const deleteRole = async (role) => {
    if (!window.confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await roleAPI.delete(role._id || role.id);
      setToast({ type: "success", message: "Role deleted successfully" });
      await loadRoles();
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Failed to delete role";
      setToast({ type: "danger", message });
    }
  };

  const openCreateBranchModal = () => {
    setEditingBranch(null);
    setBranchForm({
      name: "",
      code: "",
      address: "",
      isActive: true,
    });
    setBranchFormError("");
    setBranchModalOpen(true);
  };

  const openEditBranchModal = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name || "",
      code: branch.code || "",
      address: branch.address || "",
      isActive: branch.isActive !== false,
    });
    setBranchFormError("");
    setBranchModalOpen(true);
  };

  const closeBranchModal = () => {
    setBranchModalOpen(false);
    setEditingBranch(null);
  };

  const handleBranchInputChange = (e) => {
    const { name, value } = e.target;
    setBranchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBranchToggleChange = (name) => {
    setBranchForm((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const saveBranch = async () => {
    if (!branchForm.name.trim()) {
      setBranchFormError("Branch name is required");
      return;
    }

    try {
      setSavingBranch(true);
      setBranchFormError("");

      const payload = {
        name: branchForm.name.trim(),
        code: branchForm.code?.trim() || "",
        address: branchForm.address?.trim() || "",
        isActive: branchForm.isActive,
      };

      if (editingBranch) {
        await branchAPI.update(editingBranch._id || editingBranch.id, payload);
        setToast({ type: "success", message: "Branch updated successfully" });
      } else {
        await branchAPI.create(payload);
        setToast({ type: "success", message: "Branch created successfully" });
      }

      closeBranchModal();
      await loadBranches();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to save branch";
      setBranchFormError(message);
    } finally {
      setSavingBranch(false);
    }
  };

  const deleteBranch = async (branch) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) {
      return;
    }

    try {
      await branchAPI.delete(branch._id || branch.id);
      setToast({ type: "success", message: "Branch deleted successfully" });
      await loadBranches();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete branch";
      setToast({ type: "danger", message });
    }
  };

  const roleColumns = [
      {
        header: "Role",
        key: "displayName",
      },
      {
        header: "System Name",
        key: "name",
      },
      {
        header: "Category",
        key: "category",
      },
      {
        header: "Status",
        key: "isActive",
        render: (row) => (row.isActive ? "Active" : "Inactive"),
      },
      {
        header: "Default",
        key: "isDefault",
        render: (row) => (row.isDefault ? "Yes" : "No"),
      },
      {
        header: "User Management Rights",
        key: "permissionKeys",
        render: (row) =>
          Array.isArray(row.permissionKeys) && row.permissionKeys.length > 0
            ? row.permissionKeys
                .filter((p) => p.startsWith("user:"))
                .map((p) => getPermissionDisplayName(p))
                .join(", ")
            : "None",
      },
      {
        header: "Actions",
        key: "actions",
        render: (row) => (
          <div className="setup-table-actions">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openEditRoleModal(row)}
            >
              Edit
            </Button>
            {row.category !== "system" && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => deleteRole(row)}
              >
                Delete
              </Button>
            )}
          </div>
        ),
      },
    ];

  const branchColumns = [
      {
        header: "Branch Name",
        key: "name",
      },
      {
        header: "Code",
        key: "code",
      },
      {
        header: "Address",
        key: "address",
      },
      {
        header: "Status",
        key: "isActive",
        render: (row) => (row.isActive ? "Active" : "Inactive"),
      },
      {
        header: "Actions",
        key: "actions",
        render: (row) => (
          <div className="setup-table-actions">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openEditBranchModal(row)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => deleteBranch(row)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];

  return (
    <div className="setup-page">
      <div className="setup-header">
        <div>
          <h1>Setup</h1>
          <p>
            Configure enterprise roles, user management rights, and branches.
          </p>
        </div>
      </div>

      {toast.message && (
        <div className="setup-toast">
          <Alert
            type={toast.type === "danger" ? "danger" : "success"}
            message={toast.message}
          />
        </div>
      )}

      <div className="setup-tabs">
        <button
          className={activeTab === "roles" ? "active" : ""}
          onClick={() => setActiveTab("roles")}
        >
          Roles & Rights
        </button>
        <button
          className={activeTab === "branches" ? "active" : ""}
          onClick={() => setActiveTab("branches")}
        >
          Branches
        </button>
      </div>

      {activeTab === "roles" && (
        <div className="setup-section">
          <div className="setup-section-header">
            <h2>Roles & User Management Rights</h2>
            <Button variant="primary" onClick={openCreateRoleModal}>
              Add Role
            </Button>
          </div>

          {rolesError && (
            <div className="setup-error">
              <Alert type="danger" message={rolesError} />
            </div>
          )}

          <Card>
            {rolesLoading ? (
              <div className="setup-loading">Loading roles...</div>
            ) : (
              <Table columns={roleColumns} data={roles} pageSize={10} />
            )}
          </Card>
        </div>
      )}

      {activeTab === "branches" && (
        <div className="setup-section">
          <div className="setup-section-header">
            <h2>Branches</h2>
            <Button variant="primary" onClick={openCreateBranchModal}>
              Add Branch
            </Button>
          </div>

          {branchesError && (
            <div className="setup-error">
              <Alert type="danger" message={branchesError} />
            </div>
          )}

          <Card>
            {branchesLoading ? (
              <div className="setup-loading">Loading branches...</div>
            ) : (
              <Table columns={branchColumns} data={branches} pageSize={10} />
            )}
          </Card>
        </div>
      )}

      {roleModalOpen && (
        <Modal
          isOpen={roleModalOpen}
          title={editingRole ? "Edit Role" : "Add Role"}
          onClose={closeRoleModal}
          onConfirm={saveRole}
          confirmText={editingRole ? "Save Changes" : "Create Role"}
          confirmDisabled={savingRole}
        >
          {roleFormError && (
            <div className="setup-error">
              <Alert type="danger" message={roleFormError} />
            </div>
          )}

          <div className="setup-modal-grid">
            <Input
              name="displayName"
              label="Role Display Name"
              value={roleForm.displayName}
              onChange={handleRoleInputChange}
              placeholder="e.g., User Administrator"
              required
            />
            <Input
              name="name"
              label="System Name"
              value={roleForm.name}
              onChange={handleRoleInputChange}
              placeholder="e.g., user_admin"
              required
            />
          </div>

          <Input
            name="description"
            label="Description"
            value={roleForm.description}
            onChange={handleRoleInputChange}
            placeholder="Short description of this role"
          />

          <div className="setup-toggle-row">
            <label className="toggle">
              <input
                type="checkbox"
                checked={roleForm.isActive}
                onChange={() => handleRoleToggleChange("isActive")}
              />
              <span className="toggle-label">Active</span>
            </label>

            <label className="toggle">
              <input
                type="checkbox"
                checked={roleForm.isDefault}
                onChange={() => handleRoleToggleChange("isDefault")}
              />
              <span className="toggle-label">Default role for new users</span>
            </label>
          </div>

          <div className="setup-permissions-grid">
            <h3>User Management Rights</h3>
            <div className="permissions-grid">
              {USER_PERMISSIONS.map((perm) => (
                <label key={perm} className="permission-item">
                  <input
                    type="checkbox"
                    checked={roleForm.permissionKeys.includes(perm)}
                    onChange={() => handleRoleCheckboxChange(perm)}
                  />
                  <span>{getPermissionDisplayName(perm)}</span>
                </label>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {branchModalOpen && (
        <Modal
          isOpen={branchModalOpen}
          title={editingBranch ? "Edit Branch" : "Add Branch"}
          onClose={closeBranchModal}
          onConfirm={saveBranch}
          confirmText={editingBranch ? "Save Changes" : "Create Branch"}
          confirmDisabled={savingBranch}
        >
          {branchFormError && (
            <div className="setup-error">
              <Alert type="danger" message={branchFormError} />
            </div>
          )}

          <div className="setup-modal-grid">
            <Input
              name="name"
              label="Branch Name"
              value={branchForm.name}
              onChange={handleBranchInputChange}
              required
            />
            <Input
              name="code"
              label="Code"
              value={branchForm.code}
              onChange={handleBranchInputChange}
              placeholder="e.g., DEL-HQ"
            />
          </div>

          <Input
            name="address"
            label="Address"
            value={branchForm.address}
            onChange={handleBranchInputChange}
            placeholder="Branch address"
          />

          <div className="setup-toggle-row">
            <label className="toggle">
              <input
                type="checkbox"
                checked={branchForm.isActive}
                onChange={() => handleBranchToggleChange("isActive")}
              />
              <span className="toggle-label">Active</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Setup;
