import { useEffect, useMemo, useState } from "react";
import { Button, Card, Alert, Select, Table } from "../../components";
import { isSuperAdmin, canAccessModule } from "../../utils/permissionHelper";
import { listTemplates, listItems, createTemplate, publishTemplate, createItem, listCatalogFields, createCatalogField } from "../../services/assetsApi";
import { fetchBranchesForDropdown } from "../../services/userApi";
import "./Assets.css";

const TabsBar = ({ tab, onChange }) => {
  const tabs = ["ALL", "FIXED", "CONSUMABLE", "INTANGIBLE"];
  return (
    <div className="tabs-bar">
      {tabs.map((t) => (
        <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => onChange(t)}>
          {t}
        </button>
      ))}
    </div>
  );
};

const SubNav = ({ active, onChange }) => {
  const items = ["Templates", "Items", "Listing"];
  return (
    <div className="subnav">
      {items.map((i) => (
        <button key={i} className={`subnav-item ${active === i ? "active" : ""}`} onClick={() => onChange(i)}>
          {i}
        </button>
      ))}
    </div>
  );
};

const TemplateList = ({ tab, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    listTemplates({ category: tab !== "ALL" ? tab : undefined })
      .then((d) => {
        if (active) setItems(d);
      })
      .catch((e) => setError(e.message || "Failed to load templates"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tab]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="title">Asset Templates</div>
        <div className="actions">
          <Button variant="primary" onClick={onCreate}>New Template</Button>
        </div>
      </div>
      {error && <Alert type="danger" onClose={() => setError("")}>{error}</Alert>}
      {loading ? <div className="loading">Loading...</div> : (
        <div className="cards">
          {items.map((it) => (
            <Card key={it._id} title={`${it.name} (${it.category})`}>
              <div className="card-row">
                <div>Fields: {Array.isArray(it.fields) ? it.fields.length : 0}</div>
                <div>Status: {it.status}</div>
                <div>Version: {it.version}</div>
              </div>
            </Card>
          ))}
          {items.length === 0 && <div className="empty">No templates</div>}
        </div>
      )}
    </div>
  );
};

const TemplateEditorInline = ({ onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("FIXED");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState("");
  const [showNewField, setShowNewField] = useState(false);
  const [newField, setNewField] = useState({ label: "", key: "", type: "text" });

  useEffect(() => {
    const tag = category;
    listCatalogFields({ tag, q: query }).then(setCatalog).catch(() => setCatalog([]));
  }, [category, query]);

  const addSelectedField = (key) => {
    const doc = catalog.find((c) => String(c.key) === String(key));
    if (!doc) return;
    const exists = fields.some((f) => String(f.key) === String(doc.key));
    if (exists) return;
    setFields((prev) => [...prev, { key: doc.key, label: doc.label, type: doc.type, required: false, options: doc.options || [] }]);
  };

  const removeField = (key) => {
    setFields((prev) => prev.filter((f) => String(f.key) !== String(key)));
  };

  const toggleRequired = (key) => {
    setFields((prev) => prev.map((f) => (String(f.key) === String(key) ? { ...f, required: !f.required } : f)));
  };

  const createNewCatalogField = async () => {
    const label = String(newField.label || "").trim();
    const key = String(newField.key || "").trim().toLowerCase();
    const type = String(newField.type || "").trim();
    if (!label || !key) {
      setError("New field requires label and key");
      return;
    }
    try {
      const created = await createCatalogField({ label, key, type, tags: [category] });
      setShowNewField(false);
      setNewField({ label: "", key: "", type: "text" });
      setCatalog((prev) => [created, ...prev]);
      addSelectedField(created.key);
      setSuccess("New field created");
    } catch (e) {
      setError(e.message || "Failed to create field");
    }
  };
  const save = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Client validation: non-empty name, at least one field, valid keys/labels/types, unique keys
      const trimmedName = String(name || "").trim();
      if (!trimmedName) throw new Error("Template name is required");
      if (!Array.isArray(fields) || fields.length === 0) throw new Error("Add at least one field");
      const allowedTypes = ["text","number","date","select","boolean","multiselect"];
      const keys = fields.map((f) => String(f.key || "").trim().toLowerCase());
      if (keys.some((k) => !k)) throw new Error("All fields must have a non-empty key");
      if (fields.some((f) => !String(f.label || "").trim())) throw new Error("All fields must have a label");
      if (fields.some((f) => !allowedTypes.includes(String(f.type || "").trim()))) throw new Error("Invalid field type detected");
      const unique = new Set(keys);
      if (unique.size !== keys.length) throw new Error("Duplicate field keys are not allowed");

      const payload = {
        name: trimmedName,
        category,
        catalogKeys: fields.map((f) => String(f.key).trim().toLowerCase()),
        fields: fields.map((f) => ({
          key: String(f.key || "").trim().toLowerCase(),
          label: String(f.label || "").trim(),
          type: String(f.type || "").trim(),
          required: !!f.required,
          options: Array.isArray(f.options) ? f.options : [],
        })),
      };
      const tpl = await createTemplate(payload);
      await publishTemplate(tpl._id);
      setSuccess("Template published");
      onSaved && onSaved();
    } catch (e) {
      setError(e.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor">
      {error && <Alert type="danger" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}
      <div className="form-row">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="FIXED">FIXED</option>
          <option value="CONSUMABLE">CONSUMABLE</option>
          <option value="INTANGIBLE">INTANGIBLE</option>
        </select>
      </div>
      <div className="fields">
        <div className="fields-header">
          <div>Select Fields</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fields..." />
            <Button variant="secondary" onClick={() => setShowNewField(true)}>Create New Field</Button>
          </div>
        </div>
        <div className="field-row">
          <select onChange={(e) => addSelectedField(e.target.value)}>
            <option value="">Select from Catalog</option>
            {catalog.map((c) => (
              <option key={c._id} value={c.key}>{c.label} ({c.type})</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          {fields.map((f) => (
            <div key={f.key} className="field-row">
              <div>{f.label} ({f.type})</div>
              <label className="checkbox">
                <input type="checkbox" checked={!!f.required} onChange={() => toggleRequired(f.key)} />
                <span>Required</span>
              </label>
              <Button variant="danger" onClick={() => removeField(f.key)}>Remove</Button>
            </div>
          ))}
          {fields.length === 0 && <div className="empty">No fields selected</div>}
        </div>
      </div>
      {showNewField && (
        <div className="editor" style={{ marginTop: 8 }}>
          <div className="form-row">
            <input value={newField.label} onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value }))} placeholder="New Field Label" />
            <input value={newField.key} onChange={(e) => setNewField((p) => ({ ...p, key: e.target.value }))} placeholder="New Field Key" />
            <select value={newField.type} onChange={(e) => setNewField((p) => ({ ...p, type: e.target.value }))}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Dropdown</option>
              <option value="boolean">Boolean</option>
              <option value="multiselect">Multi-select</option>
            </select>
          </div>
          <div className="editor-actions">
            <Button variant="primary" onClick={createNewCatalogField}>Save Field</Button>
            <Button variant="outline" onClick={() => setShowNewField(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="editor-actions">
        <Button variant="primary" disabled={loading || !name || fields.length === 0} onClick={save}>
          {loading ? "Saving..." : "Save & Publish"}
        </Button>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

const AssetEntry = ({ tab, onCreated }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTpl, setSelectedTpl] = useState("");
  const [formVals, setFormVals] = useState({});
  const [branchId, setBranchId] = useState("");
  const [status, setStatus] = useState("IN_STOCK");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    listTemplates({ category: tab !== "ALL" ? tab : undefined, status: "Published" }).then(setTemplates);
    fetchBranchesForDropdown().then((d) => setBranches(d || []));
  }, [tab]);

  const tpl = useMemo(() => templates.find((t) => String(t._id) === String(selectedTpl)), [templates, selectedTpl]);

  const setFieldValue = (key, value) => {
    setFormVals((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!tpl || !branchId) {
      setError("Select template and branch");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const values = (tpl.fields || []).map((f) => ({ fieldKey: f.key, value: formVals[f.key] ?? null }));
      const payload = {
        templateId: tpl._id,
        branchId,
        name: "",
        values,
        status,
      };
      await createItem(payload);
      setSuccess("Asset created");
      setFormVals({});
      onCreated && onCreated();
    } catch (e) {
      setError(e.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      {error && <Alert type="danger" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}
      <div className="form-row">
        <select value={selectedTpl} onChange={(e) => setSelectedTpl(e.target.value)}>
          <option value="">Select Template</option>
          {templates.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="IN_STOCK">IN_STOCK</option>
          <option value="ASSIGNED">ASSIGNED</option>
          <option value="IN_REPAIR">IN_REPAIR</option>
        </select>
      </div>
      {tpl && (
        <div className="dynamic-form">
          {(tpl.fields || []).map((f) => {
            const v = formVals[f.key] ?? "";
            if (f.type === "text") {
              return (
                <div key={f.key} className="field">
                  <label>{f.label}{f.required ? " *" : ""}</label>
                  <input value={v} onChange={(e) => setFieldValue(f.key, e.target.value)} />
                </div>
              );
            }
            if (f.type === "number") {
              return (
                <div key={f.key} className="field">
                  <label>{f.label}{f.required ? " *" : ""}</label>
                  <input type="number" value={v} onChange={(e) => setFieldValue(f.key, Number(e.target.value))} />
                </div>
              );
            }
            if (f.type === "date") {
              return (
                <div key={f.key} className="field">
                  <label>{f.label}{f.required ? " *" : ""}</label>
                  <input type="date" value={v} onChange={(e) => setFieldValue(f.key, e.target.value)} />
                </div>
              );
            }
            if (f.type === "boolean") {
              return (
                <div key={f.key} className="field">
                  <label>{f.label}</label>
                  <input type="checkbox" checked={!!v} onChange={(e) => setFieldValue(f.key, e.target.checked)} />
                </div>
              );
            }
            if (f.type === "select") {
              return (
                <div key={f.key} className="field">
                  <label>{f.label}{f.required ? " *" : ""}</label>
                  <select value={v} onChange={(e) => setFieldValue(f.key, e.target.value)}>
                    <option value="">Select</option>
                    {(f.options || []).map((o, i) => (
                      <option key={`${f.key}-${i}`} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return (
              <div key={f.key} className="field">
                <label>{f.label}</label>
                <input value={v} onChange={(e) => setFieldValue(f.key, e.target.value)} />
              </div>
            );
          })}
        </div>
      )}
      <div className="entry-actions">
        <Button variant="primary" onClick={handleSubmit} disabled={loading || !selectedTpl || !branchId}>
          {loading ? "Saving..." : "Save Asset"}
        </Button>
      </div>
    </div>
  );
};

const AssetListing = ({ tab }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    listItems({ tab })
      .then((d) => {
        if (active) setItems(d);
      })
      .catch((e) => setError(e.message || "Failed to load items"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [tab]);

  const columns = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status" },
    { key: "branchId", label: "Branch" },
  ];

  return (
    <div className="panel">
      {error && <Alert type="danger" onClose={() => setError("")}>{error}</Alert>}
      {loading ? <div className="loading">Loading...</div> : (
        <Table columns={columns} data={items} />
      )}
    </div>
  );
};

const Assets = () => {
  const [tab, setTab] = useState("ALL");
  const [active, setActive] = useState("Templates");
  const [showEditor, setShowEditor] = useState(false);

  const canAccess = isSuperAdmin() || canAccessModule("assets");
  if (!canAccess) {
    return (
      <div className="assets-page">
        <Alert type="danger" onClose={() => {}}>Access not granted.</Alert>
      </div>
    );
  }

  return (
    <div className="assets-page">
      <div className="assets-header">
        <div>
          <h1>Asset Management</h1>
          <p>Templates, Items, and Listing</p>
        </div>
        <div className="header-actions">
          <Button variant="primary" onClick={() => setShowEditor(true)}>New Template</Button>
        </div>
      </div>
      <TabsBar tab={tab} onChange={setTab} />
      <SubNav active={active} onChange={setActive} />
      {active === "Templates" && (
        <>
          <TemplateList tab={tab} onCreate={() => setShowEditor(true)} />
          {showEditor && <TemplateEditorInline onClose={() => setShowEditor(false)} onSaved={() => setShowEditor(false)} />}
        </>
      )}
      {active === "Items" && <AssetEntry tab={tab} onCreated={() => setActive("Listing")} />}
      {active === "Listing" && <AssetListing tab={tab} />}
    </div>
  );
};

export default Assets;
