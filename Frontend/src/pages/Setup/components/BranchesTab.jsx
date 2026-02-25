import { useState, useEffect } from "react";
import { branchAPI } from "../../../services/api.js";
import { Table, Button, Input, Modal, Card, Alert } from "../../../components";

const BranchesTab = ({ toast, setToast }) => {
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState("");

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
    loadBranches();
  }, []);

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

      const payload = { ...branchForm };

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

  const disableBranch = async (branch) => {
    if (!window.confirm("Are you sure you want to disable this branch?")) {
      return;
    }
    try {
      await branchAPI.update(branch._id || branch.id, { isActive: false });
      setToast({ type: "success", message: "Branch disabled successfully" });
      await loadBranches();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to disable branch";
      setToast({ type: "danger", message });
    }
  };

  const branchColumns = [
    {
      header: "Name",
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
          {row.isActive ? (
            <Button
              size="sm"
              variant="warning"
              onClick={() => disableBranch(row)}
            >
              Disable
            </Button>
          ) : (
            <span style={{ fontSize: "0.875rem", color: "#6c757d" }}>Disabled</span>
          )}
        </div>
      ),
    },
  ];

  return (
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

export default BranchesTab;
