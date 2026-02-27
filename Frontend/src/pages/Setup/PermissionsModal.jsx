// @ts-ignore
import React, { useState, useEffect, useMemo } from "react";
// @ts-ignore
import { Modal, Button, Alert, Card } from "../../components";
import { roleAPI } from "../../services/api";
import { PERMISSION_MODULES } from "../../constants/permissions";
import "./Setup.css"; // Reuse CSS

// Helper to check if a permission is assigned
const hasPermission = (assignedKeys, moduleKey, pageKey, actionKey) => {
  if (assignedKeys.includes("*")) return true;
  // Check exact match: module:page:action
  const fullKey = `${moduleKey}:${pageKey}:${actionKey}`;
  return assignedKeys.includes(fullKey);
};

const PermissionsModal = ({ isOpen, onClose, role, onSaveSuccess }) => {
  // Store flat array of permission keys: ["users:users_list:add", "assets:inventory:view", ...]
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedModules, setExpandedModules] = useState({});

  const [previewMode, setPreviewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (role && isOpen) {
      // If role has legacy permissions structure or new flat keys, normalize to flat keys
      let initialKeys = [];

      if (role.name === "super_admin" || (role.permissionKeys && role.permissionKeys.includes("*"))) {
        initialKeys = ["*"];
      } else if (Array.isArray(role.permissionKeys) && role.permissionKeys.length > 0) {
        initialKeys = role.permissionKeys;
      } else if (Array.isArray(role.permissions) && role.permissions.length > 0) {
        // Convert legacy object structure to flat keys if necessary
        // Assuming legacy was resource:action
        // We might need a migration strategy if keys don't match exactly
        // For now, let's rely on permissionKeys which should be the source of truth
        initialKeys = [];
      }

      setAssignedPermissions(initialKeys);
      setError("");
      
      // Expand all modules by default
      const allExpanded = {};
      PERMISSION_MODULES.forEach(m => allExpanded[m.key] = true);
      setExpandedModules(allExpanded);
      setPreviewMode(false);
      setSearchTerm("");
    }
  }, [role, isOpen]);

  // Filter modules based on search term
  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return PERMISSION_MODULES;
    
    const lowerSearch = searchTerm.toLowerCase();
    
    return PERMISSION_MODULES.map(module => {
      // Check if module matches
      const moduleMatches = module.label.toLowerCase().includes(lowerSearch);
      
      // Check if any page matches
      const matchingPages = module.pages.filter(page => {
        const pageMatches = page.label.toLowerCase().includes(lowerSearch);
        const actionMatches = page.actions.some(action => 
          action.label.toLowerCase().includes(lowerSearch)
        );
        return pageMatches || actionMatches;
      });

      if (moduleMatches || matchingPages.length > 0) {
        return {
          ...module,
          // If module matches, keep all pages? Or strictly filter?
          // Usually better to show relevant context. 
          // If module matches, show all pages. If only page matches, show only matching pages.
          pages: moduleMatches ? module.pages : matchingPages
        };
      }
      
      return null;
    }).filter(Boolean);
  }, [searchTerm]);

  // Auto-expand on search
  useEffect(() => {
    if (searchTerm.trim()) {
      const allExpanded = {};
      filteredModules.forEach(m => allExpanded[m.key] = true);
      setExpandedModules(allExpanded);
    }
  }, [searchTerm, filteredModules]);

  const toggleModuleExpand = (moduleKey) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }));
  };

  const handleActionToggle = (moduleKey, pageKey, actionKey) => {
    setAssignedPermissions((prev) => {
      if (prev.includes("*")) return prev; // Super admin cannot be edited here usually

      const fullKey = `${moduleKey}:${pageKey}:${actionKey}`;
      const exists = prev.includes(fullKey);

      if (exists) {
        return prev.filter((k) => k !== fullKey);
      } else {
        return [...prev, fullKey];
      }
    });
  };

  const handlePageToggle = (moduleKey, pageKey, actions, isChecked) => {
    setAssignedPermissions((prev) => {
      if (prev.includes("*")) return prev;

      let newKeys = [...prev];
      actions.forEach((action) => {
        const fullKey = `${moduleKey}:${pageKey}:${action.key}`;
        if (isChecked) {
          if (!newKeys.includes(fullKey)) newKeys.push(fullKey);
        } else {
          newKeys = newKeys.filter((k) => k !== fullKey);
        }
      });
      return newKeys;
    });
  };

  const handleModuleToggle = (module, isChecked) => {
    setAssignedPermissions((prev) => {
      if (prev.includes("*")) return prev;
      let newKeys = [...prev];
      
      // Toggle module access key
      if (module.accessKey) {
        if (isChecked) {
           if (!newKeys.includes(module.accessKey)) newKeys.push(module.accessKey);
        } else {
           newKeys = newKeys.filter(k => k !== module.accessKey);
        }
      }

      // Toggle all pages/actions under this module
      module.pages.forEach(page => {
        page.actions.forEach(action => {
           const fullKey = `${module.key}:${page.key}:${action.key}`;
           if (isChecked) {
             if (!newKeys.includes(fullKey)) newKeys.push(fullKey);
           } else {
             newKeys = newKeys.filter(k => k !== fullKey);
           }
        });
      });

      return newKeys;
    });
  };

  const isModuleFullySelected = (assignedKeys, module) => {
    if (assignedKeys.includes("*")) return true;
    
    // Simply check if the accessKey is present
    // If we want "fully selected" to mean ALL children too, we can do that,
    // but typically for a "master switch" we just care if the master switch is ON.
    // However, the prompt implies unchecking it blocks access.
    // Let's reflect the state of the accessKey itself.
    if (module.accessKey) {
        return assignedKeys.includes(module.accessKey);
    }
    return false;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      // Normalize permissions for saving
      // If super admin, ensure we keep "*"
      const finalKeys = assignedPermissions.includes("*") ? ["*"] : assignedPermissions;

      // Construct payload
      // We save both permissionKeys (flat) and permissions (structured) for backward compatibility if needed
      // But primarily we rely on permissionKeys now
      const payload = {
        permissionKeys: finalKeys,
        // Optional: construct structured permissions if backend still strictly requires it
        // permissions: ... 
      };

      await roleAPI.update(role._id || role.id, payload);
      onSaveSuccess();
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to update rights";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdmin = role?.name === "super_admin" || assignedPermissions.includes("*");

  return (
    <Modal
      isOpen={isOpen}
      title={`Manage Rights - ${role?.displayName || "Role"}`}
      onClose={onClose}
      // @ts-ignore
      width="900px"
      footer={
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", width: "100%" }}>
          <Button 
            variant="info" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit Rights" : "Preview Sidebar"}
          </Button>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            {!isSuperAdmin && !previewMode && (
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Rights"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {error && (
        <div className="setup-error">
          <Alert type="danger" 
// @ts-ignore
          message={error} />
        </div>
      )}

      {isSuperAdmin && (
        // @ts-ignore
        <Alert type="info" message="This role has Super Admin privileges (Full Access). Individual rights cannot be modified." />
      )}

      {!previewMode && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search modules, pages, or actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "0.9rem"
            }}
          />
        </div>
      )}

      {previewMode ? (
        <div className="permission-preview-container">
          <h3 style={{marginBottom: '1rem'}}>Sidebar Preview for {role?.displayName}</h3>
          <div className="sidebar-preview">
            {PERMISSION_MODULES.map(module => {
              const hasAccess = isSuperAdmin || (module.accessKey && assignedPermissions.includes(module.accessKey));
              if (!hasAccess) return null;

              return (
                <div key={module.key} className="preview-module">
                  <div className="preview-module-title">
                     <span style={{marginRight: '6px'}}>📁</span>
                     {module.label}
                  </div>
                  <div className="preview-pages">
                    {module.pages.map(page => {
                      // Check page view access
                      const pageViewKey = `${module.key}:${page.key}:view`;
                      const hasPageAccess = isSuperAdmin || assignedPermissions.includes(pageViewKey);
                      
                      if (!hasPageAccess) return null;

                      return (
                        <div key={page.key} className="preview-page-item">
                          <span style={{marginRight: '6px'}}>📄</span>
                          {page.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Show message if no modules accessible */}
            {!isSuperAdmin && !PERMISSION_MODULES.some(m => m.accessKey && assignedPermissions.includes(m.accessKey)) && (
               <div style={{color: '#6b7280', fontStyle: 'italic'}}>No modules accessible.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="permission-tree-container">
          <div className="tree-root">
            {filteredModules.length === 0 && (
                <div style={{ padding: "1rem", textAlign: "center", color: "#6b7280" }}>
                  No matching rights found.
                </div>
            )}

            {filteredModules.map((module) => (
              <div key={module.key} className="tree-module">
                {/* Module Header */}
                <div 
                  className="module-header" 
                  onClick={(e) => {
                    // @ts-ignore
                    if (e.target.type !== 'checkbox') {
                      toggleModuleExpand(module.key);
                    }
                  }}
                >
                  <span className={`expand-icon ${expandedModules[module.key] ? 'expanded' : ''}`}>▶</span>
                  {module.accessKey && (
                    <input 
                      type="checkbox"
                      checked={isModuleFullySelected(assignedPermissions, module)}
                      disabled={isSuperAdmin}
                      onChange={(e) => handleModuleToggle(module, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      title="Enable/Disable entire module"
                    />
                  )}
                  <span>{module.label}</span>
                </div>

                {/* Submodules (Pages) */}
                {expandedModules[module.key] && (
                  <div className="module-children">
                    {module.pages.map((page) => {
                      const isModuleAccessGranted = isModuleFullySelected(assignedPermissions, module);
                      
                      // Check if the "view" action is assigned
                      const isViewAssigned = hasPermission(assignedPermissions, module.key, page.key, "view");

                      // All Actions Logic for Select All
                      // "Select All" should toggle all actions in this page
                      const allPageActions = page.actions;
                      const isAllActionsSelected = allPageActions.every(a => 
                        hasPermission(assignedPermissions, module.key, page.key, a.key)
                      );

                      const isDisabled = !isModuleAccessGranted || isSuperAdmin;

                      return (
                        <div key={page.key} className="tree-submodule">
                          {/* Submodule Header (acts as View toggle + Expand usually, but here just a list item) */}
                          <div className="submodule-header">
                            <label className="checkbox-label" title="Enable Submodule Access (View)">
                              <input
                                type="checkbox"
                                checked={isViewAssigned}
                                disabled={isDisabled}
                                onChange={() => handleActionToggle(module.key, page.key, "view")}
                              />
                              <span>{page.label}</span>
                            </label>
                          </div>

                          {/* Actions Children */}
                          <div className="submodule-children">
                            {/* Select All Item */}
                            <div className="tree-action select-all">
                               <label className="checkbox-label" title={`Select all ${page.label} actions`}>
                                  <input
                                    type="checkbox"
                                    checked={isAllActionsSelected}
                                    disabled={isDisabled || !isViewAssigned}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      handlePageToggle(module.key, page.key, allPageActions, isChecked);
                                    }}
                                  />
                                  <span>Select All</span>
                               </label>
                            </div>

                            {/* Individual Actions */}
                            {page.actions.map((action) => (
                              <div key={action.key} className="tree-action">
                                <label className="checkbox-label" title={action.label}>
                                  <input
                                    type="checkbox"
                                    checked={hasPermission(assignedPermissions, module.key, page.key, action.key)}
                                    disabled={isDisabled || !isViewAssigned}
                                    onChange={() => 
                                      handleActionToggle(module.key, page.key, action.key)
                                    }
                                  />
                                  <span>{action.label}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PermissionsModal;
