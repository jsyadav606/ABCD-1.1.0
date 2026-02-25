import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Alert, Card } from "../../components";
import { roleAPI } from "../../services/api";
import "./Setup.css"; // Reuse CSS

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

const PermissionsModal = ({ isOpen, onClose, role, onSaveSuccess }) => {
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role && isOpen) {
      setPermissions(
        (Array.isArray(role.permissions) && role.permissions.length > 0)
          ? role.permissions
          : fromPermissionKeys(role.permissionKeys || [])
      );
      setError("");
    }
  }, [role, isOpen]);

  const handleActionToggle = (resource, action) => {
    setPermissions((prev) => {
      const existingResource = prev.find((p) => p.resource === resource);
      let newPermissions = [...prev];

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

      return newPermissions;
    });
  };

  const hasAction = (resource, action) => {
    const perm = permissions.find((p) => p.resource === resource);
    return perm ? perm.actions.includes(action) : false;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        permissionKeys: toPermissionKeys(permissions),
      };

      await roleAPI.update(role._id || role.id, payload);
      onSaveSuccess();
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to update permissions";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // Permission Matrix Component
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

  // Real-time Preview Component
  const RealTimePreview = () => {
    const previewPermissions = useMemo(() => {
      const keys = [];
      permissions.forEach(p => {
        p.actions.forEach(a => keys.push(`${p.resource}:${a}`));
      });
      return keys;
    }, [permissions]);

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

  return (
    <Modal
      isOpen={isOpen}
      title={`Manage Permissions - ${role?.displayName || "Role"}`}
      onClose={onClose}
      width="800px"
      footer={
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      }
    >
      {error && (
        <div className="setup-error">
          <Alert type="danger" message={error} />
        </div>
      )}

      <div className="rbac-management-section">
        <PermissionMatrix />
        <RealTimePreview />
      </div>
    </Modal>
  );
};

export default PermissionsModal;
