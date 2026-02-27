import { useCallback, useEffect, useMemo, useState } from "react";
import { organizationAPI, roleAPI } from "../../../services/api.js";
import { Button, Input, Modal, Card, Alert, Textarea, Select, Checkbox } from "../../../components";

const DEFAULT_ENABLED_FEATURES = [
  "AUTH",
  "PASSWORD_POLICY",
  "NOTIFICATIONS",
  "CONFIRMATION_EMAIL",
];

const FEATURE_MODULES = [
  { key: "AUTH", label: "Login Rules", description: "Control who can log in (role-wise)." },
  { key: "PASSWORD_POLICY", label: "Password Policy", description: "Enforce password strength rules." },
  { key: "NOTIFICATIONS", label: "Notifications", description: "Configure notification preferences." },
  { key: "CONFIRMATION_EMAIL", label: "Confirmation Email", description: "Configure confirmation/welcome emails." },
];

const DEFAULT_SETTINGS = {
  auth: {
    roleLoginEnabled: false,
    allowedLoginRoles: [],
  },
  passwordPolicy: {
    enabled: false,
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSpecial: false,
  },
  notifications: {
    enabled: true,
    email: true,
    inApp: true,
  },
  confirmationEmail: {
    enabled: false,
    sendOnUserCreate: false,
    subject: "",
    body: "",
  },
};

const mergeSettings = (base, incoming) => {
  const safe = incoming && typeof incoming === "object" ? incoming : {};
  return {
    auth: {
      ...base.auth,
      ...(safe.auth && typeof safe.auth === "object" ? safe.auth : {}),
      allowedLoginRoles: Array.isArray(safe.auth?.allowedLoginRoles) ? safe.auth.allowedLoginRoles : base.auth.allowedLoginRoles,
    },
    passwordPolicy: {
      ...base.passwordPolicy,
      ...(safe.passwordPolicy && typeof safe.passwordPolicy === "object" ? safe.passwordPolicy : {}),
    },
    notifications: {
      ...base.notifications,
      ...(safe.notifications && typeof safe.notifications === "object" ? safe.notifications : {}),
    },
    confirmationEmail: {
      ...base.confirmationEmail,
      ...(safe.confirmationEmail && typeof safe.confirmationEmail === "object" ? safe.confirmationEmail : {}),
    },
  };
};

const OrganizationTab = ({ setToast }) => {
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [organizationsError, setOrganizationsError] = useState("");

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const [selectedOrgId, setSelectedOrgId] = useState("");

  const [enabledFeatures, setEnabledFeatures] = useState(DEFAULT_ENABLED_FEATURES);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_SETTINGS);
  const [savingRules, setSavingRules] = useState(false);

  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [organizationForm, setOrganizationForm] = useState({
    name: "",
    code: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    isActive: true,
  });
  const [organizationFormError, setOrganizationFormError] = useState("");
  const [savingOrganization, setSavingOrganization] = useState(false);

  const selectedOrganization = useMemo(() => {
    if (!selectedOrgId) return null;
    return organizations.find((o) => String(o._id || o.id) === String(selectedOrgId)) ?? null;
  }, [organizations, selectedOrgId]);

  const loadOrganizations = useCallback(async () => {
    try {
      setOrganizationsLoading(true);
      setOrganizationsError("");
      const response = await organizationAPI.getAll();
      const data = response.data?.data || response.data || [];
      const list = Array.isArray(data) ? data : [];
      setOrganizations(list);
      setSelectedOrgId((prev) => {
        if (prev && list.some((o) => String(o._id || o.id) === String(prev))) return prev;
        return list[0]?._id || list[0]?.id || "";
      });
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to load organizations";
      setOrganizationsError(message);
    } finally {
      setOrganizationsLoading(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const response = await roleAPI.getAll();
      const data = response.data?.data || response.data || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
    loadRoles();
  }, [loadOrganizations, loadRoles]);

  useEffect(() => {
    if (!selectedOrganization) return;
    const fromOrg = Array.isArray(selectedOrganization.enabledFeatures)
      ? selectedOrganization.enabledFeatures
      : DEFAULT_ENABLED_FEATURES;
    setEnabledFeatures(fromOrg.length > 0 ? fromOrg : DEFAULT_ENABLED_FEATURES);
    setSettingsDraft(mergeSettings(DEFAULT_SETTINGS, selectedOrganization.settings));
  }, [selectedOrganization]);

  const toCode = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

  const openCreateOrganizationModal = () => {
    setEditingOrganization(null);
    setOrganizationForm({
      name: "",
      code: "",
      contactEmail: "",
      contactPhone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      status: "ACTIVE",
    });
    setOrganizationFormError("");
    setOrganizationModalOpen(true);
  };

  const openEditOrganizationModal = () => {
    if (!selectedOrganization) return;
    setEditingOrganization(selectedOrganization);
    setOrganizationForm({
      name: selectedOrganization.name || "",
      code: selectedOrganization.code || "",
      contactEmail: selectedOrganization.contactInfo?.primaryEmail || "",
      contactPhone: selectedOrganization.contactInfo?.primaryPhone || "",
      addressLine1: selectedOrganization.address?.line1 || "",
      addressLine2: selectedOrganization.address?.line2 || "",
      city: selectedOrganization.address?.city || "",
      state: selectedOrganization.address?.state || "",
      pincode: selectedOrganization.address?.pincode || "",
      country: selectedOrganization.address?.country || "",
      status: selectedOrganization.status || "ACTIVE",
    });
    setOrganizationFormError("");
    setOrganizationModalOpen(true);
  };

  const closeOrganizationModal = () => {
    setOrganizationModalOpen(false);
    setEditingOrganization(null);
  };

  const handleOrganizationInputChange = (e) => {
    const { name, value } = e.target;
    setOrganizationForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "name" && !editingOrganization && !prev.code.trim()) {
        next.code = toCode(value);
      }
      if (name === "code") {
        next.code = toCode(value);
      }
      return next;
    });
  };

  const handleOrganizationToggleChange = (name) => {
    setOrganizationForm((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const saveOrganization = async () => {
    if (!organizationForm.name.trim()) {
      setOrganizationFormError("Organization name is required");
      return;
    }
    if (!organizationForm.code.trim()) {
      setOrganizationFormError("Organization code is required");
      return;
    }

    try {
      setSavingOrganization(true);
      setOrganizationFormError("");

      const payload = {
        name: organizationForm.name.trim(),
        code: organizationForm.code.trim().toUpperCase(),
        contactInfo: {
          primaryEmail: organizationForm.contactEmail.trim(),
          primaryPhone: organizationForm.contactPhone.trim(),
        },
        address: {
          line1: organizationForm.addressLine1.trim(),
          line2: organizationForm.addressLine2.trim(),
          city: organizationForm.city.trim(),
          state: organizationForm.state.trim(),
          pincode: organizationForm.pincode.trim(),
          country: organizationForm.country.trim(),
        },
        status: organizationForm.status || "ACTIVE",
      };

      if (editingOrganization) {
        await organizationAPI.update(editingOrganization._id || editingOrganization.id, payload);
        setToast({ type: "success", message: "Organization updated" });
      } else {
        const res = await organizationAPI.create(payload);
        const created = res.data?.data || res.data;
        setToast({ type: "success", message: "Organization created" });
        if (created?._id || created?.id) {
          setSelectedOrgId(String(created._id || created.id));
        }
      }

      closeOrganizationModal();
      await loadOrganizations();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to save organization";
      setOrganizationFormError(message);
      setToast({ type: "danger", message });
    } finally {
      setSavingOrganization(false);
    }
  };

  const setSetting = (path, value) => {
    setSettingsDraft((prev) => {
      const next = structuredClone(prev);
      const parts = String(path).split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        cur[parts[i]] = cur[parts[i]] ?? {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const toggleFeature = (featureKey) => {
    setEnabledFeatures((prev) => (prev.includes(featureKey) ? prev.filter((k) => k !== featureKey) : [...prev, featureKey]));
  };

  const rulesValidation = useMemo(() => {
    const errors = {};

    if (enabledFeatures.includes("AUTH") && settingsDraft.auth.roleLoginEnabled) {
      if (!Array.isArray(settingsDraft.auth.allowedLoginRoles) || settingsDraft.auth.allowedLoginRoles.length === 0) {
        errors.allowedLoginRoles = "Select at least one role for login.";
      }
    }

    if (enabledFeatures.includes("PASSWORD_POLICY") && settingsDraft.passwordPolicy.enabled) {
      const n = Number(settingsDraft.passwordPolicy.minLength);
      if (!Number.isFinite(n) || n < 6 || n > 64) {
        errors.minLength = "Minimum length must be between 6 and 64.";
      }
    }

    if (enabledFeatures.includes("CONFIRMATION_EMAIL") && settingsDraft.confirmationEmail.enabled) {
      if (settingsDraft.confirmationEmail.sendOnUserCreate && !String(settingsDraft.confirmationEmail.subject || "").trim()) {
        errors.confirmationSubject = "Subject is required when confirmation email is enabled.";
      }
    }

    return errors;
  }, [enabledFeatures, settingsDraft]);

  const hasRulesErrors = Object.keys(rulesValidation).length > 0;

  const originalRulesSnapshot = useMemo(() => {
    if (!selectedOrganization) return null;
    return JSON.stringify({
      enabledFeatures: Array.isArray(selectedOrganization.enabledFeatures)
        ? selectedOrganization.enabledFeatures
        : DEFAULT_ENABLED_FEATURES,
      settings: mergeSettings(DEFAULT_SETTINGS, selectedOrganization.settings),
    });
  }, [selectedOrganization]);

  const currentRulesSnapshot = useMemo(
    () => JSON.stringify({ enabledFeatures, settings: settingsDraft }),
    [enabledFeatures, settingsDraft]
  );

  const isDirty = Boolean(originalRulesSnapshot && originalRulesSnapshot !== currentRulesSnapshot);

  const saveRules = async () => {
    if (!selectedOrganization) return;
    if (hasRulesErrors) {
      setToast({ type: "danger", message: "Fix validation errors before saving." });
      return;
    }

    try {
      setSavingRules(true);
      await organizationAPI.update(selectedOrganization._id || selectedOrganization.id, {
        enabledFeatures,
        settings: settingsDraft,
      });
      setToast({ type: "success", message: "Rules updated successfully" });
      await loadOrganizations();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to save rules";
      setToast({ type: "danger", message });
    } finally {
      setSavingRules(false);
    }
  };

  const resetRules = () => {
    if (!selectedOrganization) return;
    const fromOrg = Array.isArray(selectedOrganization.enabledFeatures)
      ? selectedOrganization.enabledFeatures
      : DEFAULT_ENABLED_FEATURES;
    setEnabledFeatures(fromOrg.length > 0 ? fromOrg : DEFAULT_ENABLED_FEATURES);
    setSettingsDraft(mergeSettings(DEFAULT_SETTINGS, selectedOrganization.settings));
  };

  const orgSelectOptions = useMemo(
    () => organizations.map((o) => ({ value: String(o._id || o.id), label: o.name || "Organization" })),
    [organizations]
  );

  const roleOptions = useMemo(() => {
    return roles
      .map((r) => ({
        name: String(r.name || "").trim(),
        label: r.displayName || r.name || "Role",
      }))
      .filter((r) => r.name);
  }, [roles]);

  const selectedRoleNames = settingsDraft.auth.allowedLoginRoles || [];

  const setAllowedRole = (roleName, checked) => {
    const normalized = String(roleName || "").trim();
    if (!normalized) return;
    setSetting(
      "auth.allowedLoginRoles",
      checked
        ? Array.from(new Set([...(selectedRoleNames || []), normalized]))
        : (selectedRoleNames || []).filter((n) => n !== normalized),
    );
  };

  return (
    <div className="setup-section">
      <div className="setup-section-header">
        <h2>Organization</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={loadOrganizations} disabled={organizationsLoading}>
            Refresh
          </Button>
          <Button variant="primary" onClick={openCreateOrganizationModal}>
            Add Organization
          </Button>
        </div>
      </div>

      {organizationsError && (
        <div className="setup-error">
          <Alert type="danger" title="Error" onClose={() => setOrganizationsError("")}>
            {organizationsError}
          </Alert>
        </div>
      )}

      <Card className="org-rules-card">
        <div className="org-rules-top">
          <div className="org-rules-title">
            <div className="org-rules-title-main">{selectedOrganization?.name || "Organization"}</div>
            <div className="org-rules-title-sub">
              {selectedOrganization?.code ? `Code: ${selectedOrganization.code}` : "No code"}
              <span className="org-rules-sep">•</span>
              {selectedOrganization?.isActive !== false ? "Active" : "Inactive"}
            </div>
          </div>

          <div className="org-rules-actions">
            {organizations.length > 1 && (
              <div style={{ minWidth: 260 }}>
                <Select
                  name="organizationId"
                  label="Organization"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  onBlur={() => {}}
                  options={orgSelectOptions}
                />
              </div>
            )}
            <Button variant="secondary" onClick={openEditOrganizationModal} disabled={!selectedOrganization}>
              Edit Details
            </Button>
            <Button
              variant="primary"
              onClick={saveRules}
              disabled={!selectedOrganization || !isDirty || hasRulesErrors || savingRules}
            >
              Save Rules
            </Button>
            <Button
              variant="secondary"
              onClick={resetRules}
              disabled={!selectedOrganization || !isDirty || savingRules}
            >
              Reset
            </Button>
          </div>
        </div>

        {!selectedOrganization && (
          <div className="setup-loading">No organization found. Create one to configure rules.</div>
        )}

        {selectedOrganization && (
          <div className="org-rules-body">
            <div className="org-section">
              <div className="org-section-title">Organization Details</div>
              <div className="org-details-grid">
                <div className="org-detail-item">
                  <div className="org-detail-label">Contact Email</div>
                  <div className="org-detail-value">{selectedOrganization.contactInfo?.primaryEmail || "-"}</div>
                </div>
                <div className="org-detail-item">
                  <div className="org-detail-label">Contact Phone</div>
                  <div className="org-detail-value">{selectedOrganization.contactInfo?.primaryPhone || "-"}</div>
                </div>
                <div className="org-detail-item org-detail-item-full">
                  <div className="org-detail-label">Address</div>
                  <div className="org-detail-value">
                    {selectedOrganization.address
                      ? [
                          selectedOrganization.address.line1,
                          selectedOrganization.address.line2,
                          selectedOrganization.address.city,
                          selectedOrganization.address.state,
                          selectedOrganization.address.pincode,
                          selectedOrganization.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="org-section">
              <div className="org-section-title">Enabled Modules</div>
              <div className="org-feature-grid">
                {FEATURE_MODULES.map((m) => (
                  <div key={m.key} className="org-feature-card">
                    <div className="org-feature-top">
                      <div>
                        <div className="org-feature-label">{m.label}</div>
                        <div className="org-feature-desc">{m.description}</div>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={enabledFeatures.includes(m.key)}
                          onChange={() => toggleFeature(m.key)}
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {enabledFeatures.includes("AUTH") && (
              <div className="org-section">
                <div className="org-section-title">Login Rules (Role-wise)</div>

                <div className="org-setting-row">
                  <div>
                    <div className="org-setting-label">Enable role-based login control</div>
                    <div className="org-setting-desc">If ON, only selected roles can log in.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settingsDraft.auth.roleLoginEnabled}
                      onChange={() => setSetting("auth.roleLoginEnabled", !settingsDraft.auth.roleLoginEnabled)}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>

                {settingsDraft.auth.roleLoginEnabled && (
                  <div className="org-subsection">
                    <div className="org-subtitle">Allowed Login Roles</div>
                    <div className="org-role-grid">
                      {rolesLoading && <div className="org-inline-muted">Loading roles...</div>}
                      {!rolesLoading && roleOptions.length === 0 && (
                        <div className="org-inline-muted">No roles found.</div>
                      )}
                      {!rolesLoading &&
                        roleOptions.map((r) => (
                          <Checkbox
                            key={r.name}
                            name={`role-${r.name}`}
                            label={r.label}
                            checked={selectedRoleNames.includes(r.name)}
                            onChange={(e) => setAllowedRole(r.name, e.target.checked)}
                          />
                        ))}
                    </div>
                    {rulesValidation.allowedLoginRoles && (
                      <div className="org-validation">{rulesValidation.allowedLoginRoles}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {enabledFeatures.includes("PASSWORD_POLICY") && (
              <div className="org-section">
                <div className="org-section-title">Password Policy</div>

                <div className="org-setting-row">
                  <div>
                    <div className="org-setting-label">Password policy applicable</div>
                    <div className="org-setting-desc">If ON, password changes must follow policy.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settingsDraft.passwordPolicy.enabled}
                      onChange={() => setSetting("passwordPolicy.enabled", !settingsDraft.passwordPolicy.enabled)}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>

                {settingsDraft.passwordPolicy.enabled && (
                  <div className="org-subsection">
                    <div className="org-form-grid">
                      <Input
                        name="minLength"
                        type="number"
                        label="Minimum Length"
                        value={String(settingsDraft.passwordPolicy.minLength ?? "")}
                        onChange={(e) => setSetting("passwordPolicy.minLength", Number(e.target.value))}
                        error={rulesValidation.minLength || ""}
                        min={6}
                        max={64}
                      />
                    </div>

                    <div className="org-toggle-grid">
                      {[
                        { key: "requireUppercase", label: "Require Uppercase" },
                        { key: "requireLowercase", label: "Require Lowercase" },
                        { key: "requireNumber", label: "Require Number" },
                        { key: "requireSpecial", label: "Require Special Character" },
                      ].map((t) => (
                        <div key={t.key} className="org-setting-row org-setting-row--compact">
                          <div className="org-setting-label">{t.label}</div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={Boolean(settingsDraft.passwordPolicy[t.key])}
                              onChange={() => setSetting(`passwordPolicy.${t.key}`, !settingsDraft.passwordPolicy[t.key])}
                            />
                            <span className="switch-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {enabledFeatures.includes("NOTIFICATIONS") && (
              <div className="org-section">
                <div className="org-section-title">Notifications</div>

                <div className="org-setting-row">
                  <div>
                    <div className="org-setting-label">Enable notifications</div>
                    <div className="org-setting-desc">Global notification switch for this organization.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settingsDraft.notifications.enabled}
                      onChange={() => setSetting("notifications.enabled", !settingsDraft.notifications.enabled)}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>

                <div className="org-toggle-grid">
                  <div className="org-setting-row org-setting-row--compact">
                    <div className="org-setting-label">Email notifications</div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsDraft.notifications.email}
                        disabled={!settingsDraft.notifications.enabled}
                        onChange={() => setSetting("notifications.email", !settingsDraft.notifications.email)}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                  <div className="org-setting-row org-setting-row--compact">
                    <div className="org-setting-label">In-app notifications</div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settingsDraft.notifications.inApp}
                        disabled={!settingsDraft.notifications.enabled}
                        onChange={() => setSetting("notifications.inApp", !settingsDraft.notifications.inApp)}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {enabledFeatures.includes("CONFIRMATION_EMAIL") && (
              <div className="org-section">
                <div className="org-section-title">Confirmation Email</div>

                <div className="org-setting-row">
                  <div>
                    <div className="org-setting-label">Enable confirmation emails</div>
                    <div className="org-setting-desc">Controls email confirmation/welcome email settings.</div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settingsDraft.confirmationEmail.enabled}
                      onChange={() => setSetting("confirmationEmail.enabled", !settingsDraft.confirmationEmail.enabled)}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>

                {settingsDraft.confirmationEmail.enabled && (
                  <div className="org-subsection">
                    <div className="org-setting-row">
                      <div>
                        <div className="org-setting-label">Send email when user is created</div>
                        <div className="org-setting-desc">Send a welcome/confirmation email on user creation.</div>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={settingsDraft.confirmationEmail.sendOnUserCreate}
                          onChange={() =>
                            setSetting("confirmationEmail.sendOnUserCreate", !settingsDraft.confirmationEmail.sendOnUserCreate)
                          }
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>

                    <div className="org-form-grid">
                      <Input
                        name="confirmationSubject"
                        label="Email Subject"
                        value={settingsDraft.confirmationEmail.subject}
                        onChange={(e) => setSetting("confirmationEmail.subject", e.target.value)}
                        error={rulesValidation.confirmationSubject || ""}
                        disabled={!settingsDraft.confirmationEmail.sendOnUserCreate}
                        placeholder="e.g., Welcome to ABCD"
                      />
                    </div>

                    <Textarea
                      name="confirmationBody"
                      label="Email Body (optional)"
                      value={settingsDraft.confirmationEmail.body}
                      onChange={(e) => setSetting("confirmationEmail.body", e.target.value)}
                      disabled={!settingsDraft.confirmationEmail.sendOnUserCreate}
                      rows={4}
                      placeholder="Email message template"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {organizationModalOpen && (
        <Modal
          isOpen={organizationModalOpen}
          title={editingOrganization ? "Edit Organization" : "Add Organization"}
          onClose={closeOrganizationModal}
          size="lg"
          footer={
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={closeOrganizationModal} disabled={savingOrganization}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveOrganization} disabled={savingOrganization}>
                {editingOrganization ? "Save Changes" : "Create Organization"}
              </Button>
            </div>
          }
        >
          {organizationFormError && (
            <div className="setup-error">
              <Alert type="danger" title="Error" onClose={() => setOrganizationFormError("")}>
                {organizationFormError}
              </Alert>
            </div>
          )}

          <div className="setup-modal-grid">
            <Input
              name="name"
              label="Organization Name"
              value={organizationForm.name}
              onChange={handleOrganizationInputChange}
              placeholder="e.g., ABCD Pvt Ltd"
              required
            />
            <Input
              name="code"
              label="Organization Code"
              value={organizationForm.code}
              onChange={handleOrganizationInputChange}
              placeholder="e.g., abcd"
              required
            />
            <Input
              name="contactEmail"
              label="Contact Email"
              type="email"
              value={organizationForm.contactEmail}
              onChange={handleOrganizationInputChange}
              placeholder="e.g., support@abcd.com"
            />
            <Input
              name="contactPhone"
              label="Contact Phone"
              value={organizationForm.contactPhone}
              onChange={handleOrganizationInputChange}
              placeholder="e.g., +91 98765 43210"
            />
          </div>

          <Textarea
            name="address"
            label="Address"
            value={organizationForm.address}
            onChange={handleOrganizationInputChange}
            placeholder="Full address"
            rows={4}
          />

          <div className="setup-toggle-row">
            <label className="toggle">
              <input
                type="checkbox"
                checked={organizationForm.isActive}
                onChange={() => handleOrganizationToggleChange("isActive")}
              />
              <span className="toggle-label">Active</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrganizationTab;
