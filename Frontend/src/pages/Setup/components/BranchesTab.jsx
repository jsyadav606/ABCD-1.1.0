import { useState, useEffect } from "react";
import { branchAPI } from "../../../services/api.js";
import { Table, Button, Input, Modal, Card, Alert, Select } from "../../../components";

const TYPES = [
  { value: "MAIN", label: "Main" },
  { value: "SUB", label: "Sub" },
  { value: "SATELLITE", label: "Satellite" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "SUSPENDED", label: "Suspended" },
];

const BranchesTab = ({ setToast }) => {
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState("");

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({
    branchName: "",
    branchCode: "",
    type: "SUB",
    status: "ACTIVE",
    contactInfo: { email: "", phone: "" },
    address: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India" },
    geoLocation: { latitude: "", longitude: "" },
  });
  const [branchFormError, setBranchFormError] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);

  const loadBranches = async () => {
    try {
      setBranchesLoading(true);
      setBranchesError("");
      const response = await branchAPI.getAll();
      const data = response.data?.data || response.data || [];
      const list = Array.isArray(data) ? data : [];
      setBranches(list);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to load branches";
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
      branchName: "",
      branchCode: "",
      type: "SUB",
      status: "ACTIVE",
      contactInfo: { email: "", phone: "" },
      address: { line1: "", line2: "", city: "", state: "", pincode: "", country: "India" },
      geoLocation: { latitude: "", longitude: "" },
    });
    setBranchFormError("");
    setBranchModalOpen(true);
  };

  const openEditBranchModal = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      branchName: branch.branchName || "",
      branchCode: branch.branchCode || "",
      type: branch.type || "SUB",
      status: branch.status || "ACTIVE",
      contactInfo: {
        email: branch.contactInfo?.email || "",
        phone: branch.contactInfo?.phone || "",
      },
      address: {
        line1: branch.address?.line1 || "",
        line2: branch.address?.line2 || "",
        city: branch.address?.city || "",
        state: branch.address?.state || "",
        pincode: branch.address?.pincode || "",
        country: branch.address?.country || "India",
      },
      geoLocation: {
        latitude: branch.geoLocation?.latitude ?? "",
        longitude: branch.geoLocation?.longitude ?? "",
      },
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
    setBranchForm((prev) => {
      const next = structuredClone(prev);
      const parts = name.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        cur[parts[i]] = cur[parts[i]] ?? {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  // Removed branch-level transfer toggles. Transfers are now controlled at Organization level.

  const saveBranch = async () => {
    if (!branchForm.branchName.trim()) {
      setBranchFormError("Branch name is required");
      return;
    }
    if (!branchForm.branchCode.trim()) {
      setBranchFormError("Branch code is required");
      return;
    }

    try {
      setSavingBranch(true);
      setBranchFormError("");

      const payload = {
        ...branchForm,
        branchCode: branchForm.branchCode.trim().toUpperCase(),
        geoLocation: {
          latitude: branchForm.geoLocation.latitude === "" ? undefined : Number(branchForm.geoLocation.latitude),
          longitude: branchForm.geoLocation.longitude === "" ? undefined : Number(branchForm.geoLocation.longitude),
        },
      };

      if (editingBranch) {
        await branchAPI.update(editingBranch._id || editingBranch.id, payload);
        setToast({ type: "success", message: "Branch updated" });
      } else {
        await branchAPI.create(payload);
        setToast({ type: "success", message: "Branch created" });
      }

      closeBranchModal();
      await loadBranches();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to save branch";
      setBranchFormError(message);
    } finally {
      setSavingBranch(false);
    }
  };

  const disableBranch = async (branch) => {
    if (!window.confirm("Are you sure you want to inactivate this branch?")) {
      return;
    }
    try {
      await branchAPI.update(branch._id || branch.id, { status: "INACTIVE" });
      setToast({ type: "success", message: "Branch inactivated" });
      await loadBranches();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to update branch";
      setToast({ type: "danger", message });
    }
  };

  const branchColumns = [
    { header: "Branch Name", key: "branchName" },
    { header: "Code", key: "branchCode" },
    { header: "Type", key: "type" },
    { header: "Status", key: "status" },
    { header: "City", key: "address", render: (row) => row.address?.city || "-" },
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
          {row.status === "ACTIVE" ? (
            <Button
              size="sm"
              variant="warning"
              onClick={() => disableBranch(row)}
            >
              Inactivate
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
          <Alert type="danger" title="Error" onClose={() => setBranchesError("")}>
            {branchesError}
          </Alert>
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
              <Alert type="danger" title="Error" onClose={() => setBranchFormError("")}>
                {branchFormError}
              </Alert>
            </div>
          )}

          <div className="setup-modal-grid">
            <Input
              name="branchName"
              label="Branch Name"
              value={branchForm.branchName}
              onChange={handleBranchInputChange}
              required
            />
            <Input
              name="branchCode"
              label="Branch Code"
              value={branchForm.branchCode}
              onChange={(e) =>
                handleBranchInputChange({
                  target: { name: "branchCode", value: e.target.value.toUpperCase() },
                })
              }
              placeholder="e.g., DEL-HQ"
            />
          </div>

          <div className="setup-modal-grid">
            <Select
              name="type"
              label="Type"
              value={branchForm.type}
              onChange={(e) =>
                handleBranchInputChange({ target: { name: "type", value: e.target.value } })
              }
              options={TYPES}
              required
            />
            <Select
              name="status"
              label="Status"
              value={branchForm.status}
              onChange={(e) =>
                handleBranchInputChange({ target: { name: "status", value: e.target.value } })
              }
              options={STATUSES}
              required
            />
          </div>

          <div className="setup-modal-grid">
            <Input
              name="contactInfo.email"
              label="Contact Email"
              value={branchForm.contactInfo.email}
              onChange={handleBranchInputChange}
            />
            <Input
              name="contactInfo.phone"
              label="Contact Phone"
              value={branchForm.contactInfo.phone}
              onChange={handleBranchInputChange}
            />
          </div>

          <Input
            name="address.line1"
            label="Address Line 1"
            value={branchForm.address.line1}
            onChange={handleBranchInputChange}
            placeholder="House/Street"
          />
          <Input
            name="address.line2"
            label="Address Line 2"
            value={branchForm.address.line2}
            onChange={handleBranchInputChange}
            placeholder="Area/Landmark"
          />

          <div className="setup-modal-grid">
            <Input
              name="address.city"
              label="City"
              value={branchForm.address.city}
              onChange={handleBranchInputChange}
            />
            <Input
              name="address.state"
              label="State"
              value={branchForm.address.state}
              onChange={handleBranchInputChange}
            />
            <Input
              name="address.pincode"
              label="PIN Code"
              value={branchForm.address.pincode}
              onChange={handleBranchInputChange}
            />
            <Input
              name="address.country"
              label="Country"
              value={branchForm.address.country}
              onChange={handleBranchInputChange}
            />
          </div>

          <div className="setup-modal-grid">
            <Input
              name="geoLocation.latitude"
              type="number"
              label="Latitude"
              value={branchForm.geoLocation.latitude}
              onChange={handleBranchInputChange}
            />
            <Input
              name="geoLocation.longitude"
              type="number"
              label="Longitude"
              value={branchForm.geoLocation.longitude}
              onChange={handleBranchInputChange}
            />
          </div>

          {/* Transfer rules moved to Organization settings */}
        </Modal>
      )}
    </div>
  );
};

export default BranchesTab;
