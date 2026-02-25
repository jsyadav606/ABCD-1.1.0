import { useState, useEffect } from "react";
import { Alert } from "../../components";
import RoleRightsTab from "./components/RoleRightsTab";
import BranchesTab from "./components/BranchesTab";
import OrganizationTab from "./components/OrganizationTab";
import "./Setup.css";

const Setup = () => {
  const [activeTab, setActiveTab] = useState("organization");
  const [toast, setToast] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(() => setToast({ type: "", message: "" }), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

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
            message={toast.message}
          />
        </div>
      )}

      <div className="setup-tabs">
        <button
          className={activeTab === "organization" ? "active" : ""}
          onClick={() => setActiveTab("organization")}
        >
          Organization
        </button>
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

      {activeTab === "organization" && (
        <OrganizationTab toast={toast} setToast={setToast} />
      )}

      {activeTab === "roles" && (
        <RoleRightsTab toast={toast} setToast={setToast} />
      )}

      {activeTab === "branches" && (
        <BranchesTab toast={toast} setToast={setToast} />
      )}
    </div>
  );
};

export default Setup;
