import { useEffect, useState, useMemo } from "react";
import { roleAPI, branchAPI } from "../services/api";
import { Table, Button, Input, Select, Modal, Card, Alert } from "../components";
import "./Setup.css";

const RESOURCES = ["users", "roles", "branches", "dashboard", "reports"];
const ACTIONS = ["create", "read", "update", "delete", "export", "approve"];
const RESOURCE_ACTIONS = {
  users: [
    "add_user",
    "disable_user",
    "edit",
    "inactive",
    "disable_login",
    "change_password",
  ],
};

const toPermissionKeys = (permissions) => {
  const keys = [];
  permissions.forEach((p) => {
    p.actions.forEach((a) => keys.push(`${p.resource}:${a}`));
  });
  return keys;
};

const fromPermissionKeys = (keys = []) => {
  const map = {};
  keys.forEach((k) => {
    const [resource, action] = String(k).split(":");
    if (!resource || !action) return;
    if (!map[resource]) map[resource] = new Set();
    map[resource].add(action);
  });
  return Object.entries(map).map(([resource, actionsSet]) => ({
    resource,
    actions: Array.from(actionsSet),
  }));
};

const Setup = () => {
  const [activeTab, setActiveTab] = useState("roles");

  // Roles State
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
    priority: 100,
    isActive: true,
    isDefault: false,
    permissions: [], // New structured permissions
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
      priority: 100,
      isActive: true,
      isDefault: false,
      permissions: [],
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
      priority: role.priority || 100,
      isActive: role.isActive !== false,
      isDefault: role.isDefault === true,
      permissions:
        (Array.isArray(role.permissions) && role.permissions.length > 0)
          ? role.permissions
          : fromPermissionKeys(role.permissionKeys || []),
    });
    setRoleFormError("");
    setRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleActionToggle = (resource, action) => {
    setRoleForm((prev) => {
      const existingResource = prev.permissions.find((p) => p.resource === resource);
      let newPermissions = [...prev.permissions];

      if (existingResource) {
        const hasAction = existingResource.actions.includes(action);
        const newActions = hasAction
          ? existingResource.actions.filter((a) => a !== action)
          : [...existingResource.actions, action];

        if (newActions.length === 0) {
          newPermissions = newPermissions.filter((p) => p.resource !== resource);
        } else {
          newPermissions = newPermissions.map((p) =>
            p.resource === resource ? { ...p, actions: newActions } : p
          );
        }
      } else {
        newPermissions.push({ resource, actions: [action] });
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const hasAction = (resource, action) => {
    const perm = roleForm.permissions.find((p) => p.resource === resource);
    return perm ? perm.actions.includes(action) : false;
  };

  const PermissionMatrix = () => (
    <div className="permission-matrix-container">
      <h3 className="matrix-title">Permission Matrix</h3>
      <div className="matrix-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Resource</th>
              {(RESOURCE_ACTIONS["users"] || ACTIONS).map((action) => (
                <th key={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESOURCES.map((resource) => (
              <tr key={resource}>
                <td className="resource-name">{resource.charAt(0).toUpperCase() + resource.slice(1)}</td>
                {(RESOURCE_ACTIONS[resource] || ACTIONS).map((action) => (
                  <td key={action} className="action-cell">
                    <input
                      type="checkbox"
                      checked={hasAction(resource, action)}
                      onChange={() => handleActionToggle(resource, action)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const RealTimePreview = () => {
    const previewPermissions = useMemo(() => {
      const keys = [];
      roleForm.permissions.forEach(p => {
        p.actions.forEach(a => keys.push(`${p.resource}:${a}`));
      });
      return keys;
    }, [roleForm.permissions]);

    const canSee = (res, act) => previewPermissions.includes(`${res}:${act}`);

    return (
      <Card className="preview-card">
        <h3>Real-time Preview</h3>
        <p className="preview-hint">Buttons visible for this role:</p>
        <div className="preview-container">
          {canSee('users', 'add_user') && <Button size="sm" variant="primary">Add User</Button>}
          {canSee('users', 'disable_user') && <Button size="sm" variant="danger">Disable User</Button>}
          {canSee('users', 'edit') && <Button size="sm" variant="secondary">Edit</Button>}
          {canSee('users', 'inactive') && <Button size="sm" variant="warning">Inactive</Button>}
          {canSee('users', 'disable_login') && <Button size="sm" variant="outline">Disable Login</Button>}
          {canSee('users', 'change_password') && <Button size="sm" variant="success">Change Password</Button>}
          {!previewPermissions.length && <span className="no-preview">No buttons visible</span>}
        </div>
      </Card>
    );
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
        name: roleForm.name.trim().toLowerCase(),
        displayName: roleForm.displayName.trim(),
        description: roleForm.description.trim(),
        priority: parseInt(roleForm.priority) || 100,
        isActive: roleForm.isActive,
        isDefault: roleForm.isDefault,
        permissions: roleForm.permissions,
        permissionKeys: toPermissionKeys(roleForm.permissions),
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
        header: "Rights Summary",
        key: "permissions",
        render: (row) => {
          if (row.name === "super_admin") return "All Access (*)";
          if (!Array.isArray(row.permissions) || row.permissions.length === 0) return "None";
          return row.permissions
            .map(p => `${p.resource}(${p.actions.length})`)
            .join(", ");
        },
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
          footer={
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={closeRoleModal} disabled={savingRole}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveRole} disabled={savingRole}>
                {editingRole ? "Save Changes" : "Create Role"}
              </Button>
            </div>
          }
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
            {!editingRole && (
              <Input
                name="name"
                label="Role Internal Name"
                value={roleForm.name}
                onChange={handleRoleInputChange}
                placeholder="e.g., user_admin (no spaces)"
                required
              />
            )}
            <Input
              name="priority"
              label="Priority (1-1000)"
              type="number"
              value={roleForm.priority}
              onChange={handleRoleInputChange}
              placeholder="100"
            />
            <div className="setup-checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={roleForm.isActive}
                  onChange={() => handleRoleToggleChange("isActive")}
                />
                Is Active
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={roleForm.isDefault}
                  onChange={() => handleRoleToggleChange("isDefault")}
                />
                Is Default
              </label>
            </div>
          </div>

          <div className="setup-modal-full">
            <Input
              name="description"
              label="Description"
              value={roleForm.description}
              onChange={handleRoleInputChange}
              placeholder="Describe what this role can do"
            />
          </div>

          <div className="rbac-management-section">
            <PermissionMatrix />
            <RealTimePreview />
          </div>
        </Modal>
      )}

      {branchModalOpen && (
        <Modal
          isOpen={branchModalOpen}
          title={editingBranch ? "Edit Branch" : "Add Branch"}
          onClose={closeBranchModal}
          footer={
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={closeBranchModal} disabled={savingBranch}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveBranch} disabled={savingBranch}>
                {editingBranch ? "Save Changes" : "Create Branch"}
              </Button>
            </div>
          }
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
