// @ts-nocheck
import { useState, useEffect } from "react";
import { roleAPI } from "../../../services/api.js";
import { Table, Button, Input, Modal, Card, Alert } from "../../../components";
import PermissionsModal from "../PermissionsModal";

const RoleRightsTab = ({ setToast }) => {
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
    permissionKeys: [],
  });
  const [roleFormError, setRoleFormError] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  
  // New State for enhancements
  const [nameValidationMsg, setNameValidationMsg] = useState("");
  const [copyFromRoleId, setCopyFromRoleId] = useState("");

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

  // Real-time Validation Effect (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!roleModalOpen) return;

      if (roleForm.name) {
        // Check for duplicate internal name
        const nameExists = roles.some(
          (r) =>
            r.name === roleForm.name &&
            (!editingRole || r._id !== editingRole._id)
        );

        if (nameExists) {
          setNameValidationMsg(
            "This role name already exists. Please choose a different name."
          );
        } else {
          setNameValidationMsg("");
        }
      } else {
        setNameValidationMsg("");
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [roleForm.name, roles, editingRole, roleModalOpen]);

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
      permissionKeys: [],
    });
    setRoleFormError("");
    setNameValidationMsg("");
    setCopyFromRoleId("");
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (/** @type {{ name: any; displayName: any; description: any; priority: any; isActive: boolean; isDefault: boolean; permissions: any; permissionKeys: any; }} */ role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name || "",
      displayName: role.displayName || "",
      description: role.description || "",
      priority: role.priority || 100,
      isActive: role.isActive !== false,
      isDefault: role.isDefault === true,
      permissions: role.permissions || [],
      permissionKeys: role.permissionKeys || [],
    });
    setRoleFormError("");
    setNameValidationMsg("");
    setRoleModalOpen(true);
  };

  const openPermissionsModal = (/** @type {any} */ role) => {
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

  const handleRoleInputChange = (/** @type {{ target: { name: any; value: any; }; }} */ e) => {
    const { name, value } = e.target;
    
    setRoleForm((prev) => {
      let updates = { [name]: value };

      // Automatic Internal Name Generation
      if (name === "displayName" && !editingRole) {
        const internalName = value
          .toLowerCase()
          .replace(/\s+/g, "_") // Replace spaces with underscores
          .replace(/[^a-z0-9_]/g, ""); // Remove special chars except underscore
        updates.name = internalName;
      }

      return {
        ...prev,
        ...updates,
      };
    });
  };

  const handleCopyPermissions = (/** @type {import("react").SetStateAction<string>} */ sourceRoleId) => {
    setCopyFromRoleId(sourceRoleId);
    if (!sourceRoleId) return;

    const sourceRole = roles.find(
      (r) => r._id === sourceRoleId || r.id === sourceRoleId
    );

    if (sourceRole) {
      if (
        window.confirm(
          `Are you sure you want to copy rights from "${sourceRole.displayName}"? This will overwrite any current rights for the new role.`
        )
      ) {
        setRoleForm((prev) => ({
          ...prev,
          permissionKeys: [...(sourceRole.permissionKeys || [])],
          permissions: [...(sourceRole.permissions || [])],
        }));
        setToast({
          type: "success",
          message: `Rights copied from ${sourceRole.displayName}`,
        });
      } else {
        setCopyFromRoleId(""); // Reset if cancelled
      }
    }
  };

  const handleRoleToggleChange = (/** @type {string} */ name) => {
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

    if (nameValidationMsg) {
      setRoleFormError("Please fix validation errors before saving.");
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
        permissionKeys: roleForm.permissionKeys || [],
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
    setToast({ type: "success", message: "Rights updated successfully" });
    await loadRoles();
  };

  const deleteRole = async (/** @type {{ _id: any; id: any; }} */ role) => {
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
      render: (/** @type {{ isActive: any; }} */ row) => (row.isActive ? "Active" : "Inactive"),
    },
    {
      header: "Default",
      key: "isDefault",
      render: (/** @type {{ isDefault: any; }} */ row) => (row.isDefault ? "Yes" : "No"),
    },
    {
      header: "Rights Summary",
      key: "permissions",
      render: (/** @type {{ name: string; permissionKeys: string | string[]; }} */ row) => {
        if (row.name === "super_admin" || (row.permissionKeys && row.permissionKeys.includes("*"))) return "All Access (*)";
        
        // Show count of permissions
        const count = row.permissionKeys?.length || 0;
        return `${count} Right${count !== 1 ? 's' : ''}`;
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (/** @type {{ isActive: any; category: string; _id: any; id: any; }} */ row) => (
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
            Rights
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
          <Table 
            columns={roleColumns} 
            data={roles} 
            pageSize={10} 
            rowClassName={(/** @type {{ isActive: any; }} */ row) => !row.isActive ? "table__row--inactive" : ""}
          />
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
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Input
                  name="name"
                  label="Role Internal Name"
                  value={roleForm.name}
                  onChange={handleRoleInputChange}
                  placeholder="e.g., user_admin (no spaces)"
                  required
                />
                {nameValidationMsg && (
                  <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                    {nameValidationMsg}
                  </span>
                )}
              </div>
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

          {!editingRole && (
             <div className="setup-modal-full" style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>
                  Copy Rights from Existing Role
                </label>
                <select
                  className="setup-input"
                  value={copyFromRoleId}
                  onChange={(e) => handleCopyPermissions(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
                >
                  <option value="">-- Select a role to copy rights --</option>
                  {roles.map((r) => (
                    <option key={r._id || r.id} value={r._id || r.id}>
                      {r.displayName} ({r.permissionKeys?.length || 0} rights)
                    </option>
                  ))}
                </select>
                <small style={{ color: "#6b7280", display: "block", marginTop: "0.25rem" }}>
                  Select a role to automatically copy its rights to this new role.
                </small>
             </div>
          )}

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
