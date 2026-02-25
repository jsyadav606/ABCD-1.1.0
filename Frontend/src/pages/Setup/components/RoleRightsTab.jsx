import { useState, useEffect } from "react";
import { roleAPI } from "../../../services/api.js";
import { Table, Button, Input, Modal, Card, Alert } from "../../../components";
import PermissionsModal from "../PermissionsModal";

const RoleRightsTab = ({ toast, setToast }) => {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    displayName: "",
    description: "",
    priority: 100,
    isActive: true,
    isDefault: false,
    permissions: [],
  });
  const [roleFormError, setRoleFormError] = useState("");
  const [savingRole, setSavingRole] = useState(false);

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

  useEffect(() => {
    loadRoles();
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
      permissions: role.permissions || [],
    });
    setRoleFormError("");
    setRoleModalOpen(true);
  };

  const openPermissionsModal = (role) => {
    setEditingRole(role);
    setPermissionsModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setEditingRole(null);
  };

  const closePermissionsModal = () => {
    setPermissionsModalOpen(false);
    setEditingRole(null);
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
        permissions: [],
        permissionKeys: [],
      };

      if (editingRole) {
        await roleAPI.update(editingRole._id || editingRole.id, payload);
        setToast({ type: "success", message: "Role details updated successfully" });
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

  const handlePermissionsSaveSuccess = async () => {
    setToast({ type: "success", message: "Permissions updated successfully" });
    await loadRoles();
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
        if (row.name === "super_admin" || (row.permissionKeys && row.permissionKeys.includes("*"))) return "All Access (*)";
        
        // Show count of permissions
        const count = row.permissionKeys?.length || 0;
        return `${count} Permission${count !== 1 ? 's' : ''}`;
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
          <Button
            size="sm"
            variant="info"
            onClick={() => openPermissionsModal(row)}
          >
            Permissions
          </Button>
          {row.isActive && row.category !== "system" && (
            <Button
              size="sm"
              variant="warning"
              onClick={async () => {
                try {
                  await roleAPI.update(row._id || row.id, { isActive: false });
                  setToast({ type: "success", message: "Role disabled successfully" });
                  await loadRoles();
                } catch (error) {
                  const message =
                    error.response?.data?.message || error.message || "Failed to disable role";
                  setToast({ type: "danger", message });
                }
              }}
            >
              Disable
            </Button>
          )}
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

  return (
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

      {/* Edit Role Details Modal */}
      {roleModalOpen && (
        <Modal
          isOpen={roleModalOpen}
          title={editingRole ? "Edit Role Details" : "Add Role"}
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
        </Modal>
      )}

      {/* Permissions Modal */}
      {permissionsModalOpen && (
        <PermissionsModal
          isOpen={permissionsModalOpen}
          role={editingRole}
          onClose={closePermissionsModal}
          onSaveSuccess={handlePermissionsSaveSuccess}
        />
      )}
    </div>
  );
};

export default RoleRightsTab;
