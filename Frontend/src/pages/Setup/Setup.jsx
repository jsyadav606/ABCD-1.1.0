import { useState, useEffect, useMemo } from "react";
import { Alert } from "../../components";
import RoleRightsTab from "./components/RoleRightsTab";
import BranchesTab from "./components/BranchesTab";
import OrganizationTab from "./components/OrganizationTab";
import { isSuperAdmin, canAccessPage } from "../../utils/permissionHelper";
import "./Setup.css";

const Setup = () => {
  const [activeTab, setActiveTab] = useState("organization");
  const [toast, setToast] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ type: "", message: "" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const allTabs = useMemo(
    () => [
      { key: "organization", label: "Organization" },
      { key: "roles", label: "Roles & Rights" },
      { key: "branches", label: "Branches" },
    ],
    []
  );

  const allowedTabs = useMemo(() => {
    return allTabs.filter(
      (t) => isSuperAdmin() || canAccessPage("setup", t.key)
    );
  }, [allTabs]);

  useEffect(() => {
    if (allowedTabs.length === 0) return;
    if (!allowedTabs.some((t) => t.key === activeTab)) {
      setActiveTab(allowedTabs[0].key);
    }
  }, [allowedTabs, activeTab]);

  if (allowedTabs.length === 0) {
    return (
      <div className="setup-page">
        <div className="setup-header">
          <div>
            <h1>Setup</h1>
            <p>Access not granted.</p>
          </div>
        </div>
        <Alert
          type="danger"
          title="Access Denied"
          onClose={() => {}}
        >
          You do not have permission to access Setup.
        </Alert>
      </div>
    );
  }

  return (
    <div className="setup-page">
      <div className="setup-header">
        <div>
          <h1>Setup</h1>
          <p>
            Configure organization details, enterprise roles, user management rights, and branches.
          </p>
        </div>
      </div>

      {toast.message && (
        <div className="setup-toast">
          <Alert
            type={toast.type === "danger" ? "danger" : "success"}
            title={toast.type === "danger" ? "Error" : "Success"}
            onClose={() => setToast({ type: "", message: "" })}
          >
            {toast.message}
          </Alert>
        </div>
      )}

      <div className="setup-tabs">
        {allowedTabs.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? "active" : ""}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "organization" && allowedTabs.some(t => t.key === "organization") && (
        <OrganizationTab toast={toast} setToast={setToast} />
      )}
   
      {activeTab === "roles" && allowedTabs.some(t => t.key === "roles") && (
        <RoleRightsTab toast={toast} setToast={setToast} />
      )}

      {activeTab === "branches" && allowedTabs.some(t => t.key === "branches") && (
        <BranchesTab toast={toast} setToast={setToast} />
      )}
    </div>
  );
};

export default Setup;
