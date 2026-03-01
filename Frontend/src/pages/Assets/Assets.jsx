import { useMemo, useState } from "react";
import { Button, Input, Select, Modal, Table, Alert, Card } from "../../components";
import { useAuth } from "../../hooks/useAuth";
import { isSuperAdmin, hasPermission } from "../../utils/permissionHelper";
import { getTypes, createType, updateType, getItems, createItem, filterItems } from "../../services/assetsLocal";
import "./Assets.css";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "FIXED", label: "Fixed" },
  { key: "CONSUMABLE", label: "Consumables" },
  { key: "INTANGIBLE", label: "Intangible" },
];

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
];

const Assets = () => {
  const { user: currentUser } = useAuth();

  const [tab, setTab] = useState("ALL");
  const [types, setTypes] = useState(() => getTypes());
  const [items, setItems] = useState(() => getItems());

  const [typeModal, setTypeModal] = useState(false);
  const [fieldModal, setFieldModal] = useState({ open: false, typeId: null });
  const [itemModal, setItemModal] = useState(false);

  const [newType, setNewType] = useState({ name: "", category: "FIXED" });
  const [fieldsDraft, setFieldsDraft] = useState([]);
  const [newItem, setNewItem] = useState({ typeId: "", name: "", dynamic: {} });

  const canViewAssets = isSuperAdmin() || hasPermission("assets:inventory:view") || hasPermission("assets:access");
  const canAddItem = isSuperAdmin() || hasPermission("assets:inventory:add");
  const canManageTypes = isSuperAdmin() || String(currentUser?.role || "").toLowerCase() === "enterprise_admin";

  const canViewAll = isSuperAdmin() || hasPermission("assets:inventory:view");

  

  const filteredItems = useMemo(() => {
    return filterItems({
      tab,
      ownerId: currentUser?.id,
      isSuper: isSuperAdmin(),
      canViewAll,
    });
  }, [tab, currentUser?.id, canViewAll, items]);

  const dynamicColumns = useMemo(() => {
    const map = {};
    types.forEach((t) => {
      (t.fields || []).forEach((f) => {
        map[f.key] = f.label || f.key;
      });
    });
    return Object.entries(map).map(([key, label]) => ({ key, label }));
  }, [types]);

  const columns = useMemo(() => {
    const base = [
      {
        key: "name",
        label: "Name",
      },
      {
        key: "typeCategory",
        label: "Type",
        render: (row) => {
          return <span className={`badge-type badge-${row.typeCategory}`}>{row.typeCategory}</span>;
        },
      },
      {
        key: "status",
        label: "Status",
      },
    ];
    const dyn = dynamicColumns.map((d) => ({
      key: d.key,
      label: d.label,
      render: (row) => row?.fields?.[d.key] ?? "",
    }));
    return [...base, ...dyn];
  }, [dynamicColumns]);

  const onCreateType = () => {
    if (!newType.name.trim()) return;
    const created = createType({ ...newType, fields: [] });
    setTypes((prev) => [...prev, created]);
    setTypeModal(false);
    setNewType({ name: "", category: "FIXED" });
  };

  const openFieldModal = (typeId) => {
    const t = types.find((x) => String(x.id) === String(typeId));
    setFieldsDraft(t?.fields || []);
    setFieldModal({ open: true, typeId });
  };

  const saveFields = () => {
    if (!fieldModal.typeId) return;
    const updated = updateType(fieldModal.typeId, { fields: fieldsDraft });
    if (updated) {
      setTypes((prev) => prev.map((t) => (String(t.id) === String(updated.id) ? updated : t)));
    }
    setFieldModal({ open: false, typeId: null });
    setFieldsDraft([]);
  };

  const onCreateItem = () => {
    if (!newItem.typeId || !newItem.name.trim()) return;
    const t = types.find((x) => String(x.id) === String(newItem.typeId));
    const payload = {
      typeId: newItem.typeId,
      typeCategory: t?.category || "FIXED",
      name: newItem.name,
      ownerId: currentUser?.id,
      fields: newItem.dynamic || {},
      status: "IN_STOCK",
    };
    const created = createItem(payload);
    setItems((prev) => [created, ...prev]);
    setItemModal(false);
    setNewItem({ typeId: "", name: "", dynamic: {} });
  };

  const selectedTypeFields = useMemo(() => {
    const t = types.find((x) => String(x.id) === String(newItem.typeId));
    return t?.fields || [];
  }, [newItem.typeId, types]);

  if (!canViewAssets) {
    return (
      <div className="_assets">
        <Alert type="danger" title="Access Denied">You do not have access to Assets.</Alert>
      </div>
    );
  }

  return (
    <div className="_assets">
      <div className="assets-header">
        <h1>Assets Management</h1>
        <div className="assets-actions">
          {canManageTypes && (
            <Button variant="primary" onClick={() => setTypeModal(true)}>New Asset Type</Button>
          )}
          {canAddItem && types.length > 0 && (
            <Button variant="secondary" onClick={() => setItemModal(true)}>Add Item</Button>
          )}
        </div>
      </div>

      <div className="assets-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? "active" : ""}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="assets-toolbar">
        <div className="assets-filters">
          <span>Total Types: {types.length}</span>
          <span>Items: {filteredItems.length}</span>
        </div>
      </div>

      <Card title="Inventory">
        <Table
          columns={columns}
          data={filteredItems}
          pageSize={20}
          showSearch={true}
          showPagination={true}
          defaultSortKey="createdAt"
          defaultSortDirection="desc"
        />
      </Card>

      {typeModal && (
        <Modal
          isOpen={typeModal}
          title="Create Asset Type"
          onClose={() => {
            setTypeModal(false);
            setNewType({ name: "", category: "FIXED" });
          }}
          footer={
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setTypeModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={onCreateType}>Create</Button>
            </div>
          }
        >
          <div className="assets-modal-grid">
            <Input
              label="Type Name"
              value={newType.name}
              onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Select
              label="Category"
              value={newType.category}
              onChange={(e) => setNewType((p) => ({ ...p, category: e.target.value }))}
              options={[
                { value: "FIXED", label: "Fixed" },
                { value: "CONSUMABLE", label: "Consumables" },
                { value: "INTANGIBLE", label: "Intangible" },
              ]}
            />
          </div>
          <div style={{ marginTop: ".75rem" }}>
            <Card title="Types">
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {types.map((t) => (
                  <div key={t.id} style={{ display: "flex", gap: ".5rem", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <strong>{t.name}</strong> <span className={`badge-type badge-${t.category}`}>{t.category}</span>
                    </div>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      <Button size="sm" variant="info" onClick={() => openFieldModal(t.id)}>Fields</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Modal>
      )}

      {fieldModal.open && (
        <Modal
          isOpen={fieldModal.open}
          title="Manage Fields"
          onClose={() => {
            setFieldModal({ open: false, typeId: null });
            setFieldsDraft([]);
          }}
          footer={
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setFieldModal({ open: false, typeId: null })}>Close</Button>
              <Button variant="primary" onClick={saveFields}>Save</Button>
            </div>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
            <div className="assets-field-row">
              <Input
                placeholder="Field Label"
                value={""}
                onChange={() => {}}
                style={{ display: "none" }}
              />
            </div>
            {fieldsDraft.map((f, idx) => (
              <div className="assets-field-row" key={idx}>
                <Input
                  placeholder="Label"
                  value={f.label}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFieldsDraft((prev) => prev.map((x, i) => i === idx ? { ...x, label: v } : x));
                  }}
                />
                <Select
                  value={f.type}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFieldsDraft((prev) => prev.map((x, i) => i === idx ? { ...x, type: v } : x));
                  }}
                  options={FIELD_TYPES}
                />
                <Select
                  value={f.required ? "yes" : "no"}
                  onChange={(e) => {
                    const v = e.target.value === "yes";
                    setFieldsDraft((prev) => prev.map((x, i) => i === idx ? { ...x, required: v } : x));
                  }}
                  options={[
                    { value: "no", label: "Optional" },
                    { value: "yes", label: "Required" },
                  ]}
                />
                <Button
                  className="remove"
                  size="sm"
                  variant="danger"
                  onClick={() => setFieldsDraft((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </Button>
                {f.type === "select" && (
                  <Input
                    className="assets-select-options"
                    placeholder="Options (comma separated)"
                    value={(f.options || []).join(",")}
                    onChange={(e) => {
                      const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                      setFieldsDraft((prev) => prev.map((x, i) => i === idx ? { ...x, options: arr } : x));
                    }}
                  />
                )}
              </div>
            ))}
            <div>
              <Button
                variant="secondary"
                onClick={() => {
                  const nextKey = Math.random().toString(36).slice(2, 8);
                  setFieldsDraft((prev) => [
                    ...prev,
                    { key: nextKey, label: "Field", type: "text", required: false, options: [] },
                  ]);
                }}
              >
                Add Field
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {itemModal && (
        <Modal
          isOpen={itemModal}
          title="Add Inventory Item"
          onClose={() => {
            setItemModal(false);
            setNewItem({ typeId: "", name: "", dynamic: {} });
          }}
          footer={
            <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setItemModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={onCreateItem}>Create</Button>
            </div>
          }
        >
          <div className="assets-modal-grid">
            <Select
              label="Asset Type"
              value={newItem.typeId}
              onChange={(e) => setNewItem((p) => ({ ...p, typeId: e.target.value }))}
              options={types.map((t) => ({ value: t.id, label: `${t.name} (${t.category})` }))}
            />
            <Input
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginTop: ".75rem" }}>
            {selectedTypeFields.map((f) => {
              const val = newItem.dynamic?.[f.key] ?? "";
              if (f.type === "select") {
                return (
                  <Select
                    key={f.key}
                    label={f.label}
                    value={val}
                    onChange={(e) => setNewItem((p) => ({ ...p, dynamic: { ...p.dynamic, [f.key]: e.target.value } }))}
                    options={(f.options || []).map((o) => ({ value: o, label: o }))}
                  />
                );
              }
              if (f.type === "date") {
                return (
                  <Input
                    key={f.key}
                    type="date"
                    label={f.label}
                    value={val}
                    onChange={(e) => setNewItem((p) => ({ ...p, dynamic: { ...p.dynamic, [f.key]: e.target.value } }))}
                  />
                );
              }
              if (f.type === "number") {
                return (
                  <Input
                    key={f.key}
                    type="number"
                    label={f.label}
                    value={val}
                    onChange={(e) => setNewItem((p) => ({ ...p, dynamic: { ...p.dynamic, [f.key]: e.target.value } }))}
                  />
                );
              }
              return (
                <Input
                  key={f.key}
                  label={f.label}
                  value={val}
                  onChange={(e) => setNewItem((p) => ({ ...p, dynamic: { ...p.dynamic, [f.key]: e.target.value } }))}
                />
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Assets;

