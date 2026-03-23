/**
 * Page: AddItem
 * Description: Is page par different asset items (CPU/Monitor/others) add kiye jaate hain.
 * Major Logics:
 * - URL se item type read karke sahi fields/config load karna
 * - Branch, Vendor, RAM types, Drive types dropdowns load karna
 * - Dynamic sections render + table sections (Memory/Storage/Network) ke rows manage karna
 * - Frontend form ko backend payload me convert karke /assets par submit karna
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AddItem.css";
// @ts-ignore
import FormRenderer from "./components/FormRenderer.jsx";
// @ts-ignore
import { apiService } from "./services/apiService.js";
import { fetchBranchesForDropdown } from "../../services/userApi.js";
import { authAPI } from "../../services/api.js";
import { getSelectedBranch } from "../../utils/scope.js";
// @ts-ignore
import { CATEGORY_ITEMS, getItemFieldConfig } from "./config/itemFieldConfig.js";
import { vendorAPI, lookupAPI } from "../../services/api.js";
import { TABLE_SECTION_TITLES } from "./config/common.js";
import Select from "../../components/Select/Select.jsx";
// @ts-ignore
import { calculateWarrantyTillDate, calculateWarrantyStatus } from "./utils/warrantyCalculations.js";

const CATEGORIES = [
  { value: "fixed", label: "Fixed" },
  { value: "peripheral", label: "Peripheral" },
  { value: "consumable", label: "Consumable" },
  { value: "intangible", label: "Intangible" },
];
const AddItemPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const allItems = useMemo(() => Object.values(CATEGORY_ITEMS || {}).flat(), []);
  const getCategoryForItemType = useMemo(() => {
    return (t) => {
      const tt = String(t || "").toLowerCase();
      for (const [cat, items] of Object.entries(CATEGORY_ITEMS || {})) {
        if ((items || []).some((i) => String(i.value || "").toLowerCase() === tt)) return cat;
      }
      return "";
    };
  }, []);
  const resolveType = (raw) => {
    const t = String(raw || "");
    const lc = t.toLowerCase();
    const byValue = allItems.find((i) => String(i.value || "").toLowerCase() === lc);
    if (byValue) return byValue.value;
    const byLabelExact = allItems.find((i) => String(i.label || "").toLowerCase() === lc);
    if (byLabelExact) return byLabelExact.value;
    const byLabelNoSpaces = allItems.find(
      (i) =>
        String(i.label || "").replace(/\s+/g, "").toLowerCase() ===
        lc.replace(/\s+/g, "")
    );
    if (byLabelNoSpaces) return byLabelNoSpaces.value;
    return lc;
  };
  const itemType = resolveType(type);
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [itemConfig, setItemConfig] = useState(null);
  const [loadingItemConfig, setLoadingItemConfig] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [ramTypeOptions, setRamTypeOptions] = useState([]);
  const [driveTypeOptions, setDriveTypeOptions] = useState([]);

  useEffect(() => {
    const initBranch = async () => {
      try {
        const prof = await authAPI.getProfile();
        const user = prof.data?.data?.user;
        if (!user?.organizationId) return;

        const branches = await fetchBranchesForDropdown(user.organizationId);
        const opts = branches.map((b) => ({ value: String(b._id), label: b.name }));

        const dashboardBranch = getSelectedBranch();

        const allowedBranchIds = Array.isArray(user.branchId)
          ? user.branchId.map((b) => (typeof b === "object" ? String(b._id) : String(b)))
          : [];

        let finalOptions = opts;
        
        // If a specific branch is selected on dashboard (not "__ALL__"), filter to show only that branch
        if (dashboardBranch && dashboardBranch !== "__ALL__") {
          finalOptions = opts.filter((o) => o.value === dashboardBranch);
        } 
        // Otherwise, filter based on user's assigned branches (for non-super_admin)
        else if (allowedBranchIds.length > 0 && user.role !== "super_admin") {
          finalOptions = opts.filter((o) => allowedBranchIds.includes(o.value));
        }
        
        setBranchOptions(finalOptions);

        let defaultBranch = "";

        // If specific branch is selected on dashboard, auto-select it
        if (dashboardBranch && dashboardBranch !== "__ALL__") {
          defaultBranch = dashboardBranch;
        } 
        // If only one branch is available, auto-select it
        else if (finalOptions.length === 1) {
          defaultBranch = finalOptions[0].value;
        }

        if (defaultBranch) {
          setForm((prev) => ({ ...prev, branch: defaultBranch }));
        }
      } catch (err) {
        console.warn("Failed to load branches:", err?.response?.data?.message || err?.message || err);
      }
    };
    initBranch();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!itemType) {
        setItemConfig(null);
        return;
      }
      setLoadingItemConfig(true);
      try {
        const cfg = await getItemFieldConfig(itemType);
        if (!cancelled) setItemConfig(cfg || null);
      } finally {
        if (!cancelled) setLoadingItemConfig(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [itemType]);

  useEffect(() => {
    if (category) return;
    const inferred = getCategoryForItemType(itemType);
    if (inferred) setCategory(inferred);
  }, [category, getCategoryForItemType, itemType]);

  // Load vendor dropdown
  useEffect(() => {
    let cancelled = false;
    const loadVendors = async () => {
      try {
        const res = await vendorAPI.getDropdown();
        const items = res.data?.data || res.data || [];
        const opts = items.map((v) => ({
          value: v.value ?? v._id,
          label: v.label ?? v.name,
        }));
        if (!cancelled) setVendorOptions(opts);
      } catch (e) {
        console.warn("Failed to load vendors dropdown:", e?.response?.data?.message || e.message);
        if (!cancelled) setVendorOptions([]);
      }
    };
    loadVendors();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadRamTypes = async () => {
      try {
        if (itemType !== "cpu") {
          if (!cancelled) setRamTypeOptions([]);
          return;
        }
        const res = await lookupAPI.getByCategory("ram_type");
        const items = res.data?.data?.items || res.data?.data || res.data || [];
        const opts = items.map((i) => ({
          value: i.code || i.name,
          label: i.name,
        }));
        if (!cancelled) setRamTypeOptions(opts);
      } catch (e) {
        console.warn("Failed to load RAM types:", e?.response?.data?.message || e.message);
        if (!cancelled) setRamTypeOptions([]);
      }
    };
    loadRamTypes();
    return () => {
      cancelled = true;
    };
  }, [itemType]);

  // Load Drive Types via Lookup (category: 'drive_type')
  useEffect(() => {
    let cancelled = false;
    const loadDriveTypes = async () => {
      try {
        if (itemType !== "cpu") {
          if (!cancelled) setDriveTypeOptions([]);
          return;
        }
        const res = await lookupAPI.getByCategory("storage_type");
        const items = res.data?.data?.items || res.data?.data || res.data || [];
        const opts = items.map((i) => ({
          value: i.code || i.name,
          label: i.name,
        }));
        if (!cancelled) setDriveTypeOptions(opts);
      } catch (e) {
        console.warn("Failed to load Drive types:", e?.response?.data?.message || e.message);
        if (!cancelled) setDriveTypeOptions([]);
      }
    };
    loadDriveTypes();
    return () => {
      cancelled = true;
    };
  }, [itemType]);

  // Calculate warranty till date and status whenever relevant fields change
  useEffect(() => {
    // @ts-ignore
    const warrantyAvailable = String(form.warrantyAvailable || "").toLowerCase();
    
    if (warrantyAvailable !== "yes") {
      // Clear warranty calculation fields if warranty not available
      // @ts-ignore
      if (form.warrantyTillDate || form.warrantyStatus) {
        setForm((prev) => ({
          ...prev,
          warrantyTillDate: null,
          warrantyStatus: null,
        }));
      }
      return;
    }

    // @ts-ignore
    const invoiceDate = form.invoiceDate;
    const warrantyTillDate = calculateWarrantyTillDate(form, invoiceDate);

    if (warrantyTillDate) {
      const warrantyStatus = calculateWarrantyStatus(warrantyTillDate);
      
      // Only update if values actually changed to avoid unnecessary re-renders
      // @ts-ignore
      if (form.warrantyTillDate !== warrantyTillDate || form.warrantyStatus !== warrantyStatus) {
        setForm((prev) => ({
          ...prev,
          warrantyTillDate,
          warrantyStatus,
        }));
      }
    } else {
      // Clear if we can't calculate
      // @ts-ignore
      if (form.warrantyTillDate || form.warrantyStatus) {
        setForm((prev) => ({
          ...prev,
          warrantyTillDate: null,
          warrantyStatus: null,
        }));
      }
    }
  // @ts-ignore
  }, [form.warrantyAvailable, form.warrantyMode, form.inYear, form.inMonth, form.warrantyEndDate, form.invoiceDate]);

  const sections = useMemo(() => {
    if (!category || !itemType) return [];
    const baseSections = itemConfig?.sections || [];

    const updateSectionFields = (sec, fieldUpdates) => {
      if (!sec?.fields?.length) return sec;
      return {
        ...sec,
        fields: sec.fields.map((f) => (fieldUpdates[f.name] ? { ...f, ...fieldUpdates[f.name] } : f)),
      };
    };

    // Determine default branch value
    let defaultBranchValue = "";
    const dashboardBranch = getSelectedBranch();
    
    if (dashboardBranch && dashboardBranch !== "__ALL__") {
      defaultBranchValue = dashboardBranch;
    } else if (branchOptions.length === 1) {
      defaultBranchValue = branchOptions[0].value;
    }

    return baseSections.map((sec) => {
      if (sec.sectionTitle === "Location & Other Information") {
        return updateSectionFields(sec, {
          branch: { 
            options: branchOptions, 
            required: true, 
            readOnly: false,
            defaultValue: defaultBranchValue
          },
        });
      }
      if (sec.sectionTitle === "Memory") {
        return ramTypeOptions.length
          ? updateSectionFields(sec, { ramType: { options: ramTypeOptions } })
          : sec;
      }
      if (sec.sectionTitle === "Storage") {
        return driveTypeOptions.length
          ? updateSectionFields(sec, { driveType: { options: driveTypeOptions } })
          : sec;
      }
      if (sec.sectionTitle === "Purchase Information") {
        return updateSectionFields(sec, { vendorId: { options: vendorOptions } });
      }
      return sec;
    });
  }, [category, itemType, branchOptions, vendorOptions, ramTypeOptions, driveTypeOptions, itemConfig]);

  useEffect(() => {
    const defaults = {};
    (sections || []).forEach((sec) => {
      (sec.fields || []).forEach((f) => {
        if (f.defaultValue !== undefined) {
          const key = String(f.name);
          const cur = form[key];
          if (cur === undefined || cur === null || String(cur).trim() === "") {
            defaults[key] = f.defaultValue;
          }
        }
      });
    });
    if (Object.keys(defaults).length > 0) {
      setForm((prev) => ({ ...prev, ...defaults }));
    }
  }, [sections]);

  const purchaseDateAutoRef = useRef({ value: "", receivedOn: "" });
  const lastItemReceivedOnRef = useRef("");

  // @ts-ignore
  const itemReceivedOn = form.itemReceivedOn;
  // @ts-ignore
  const invoiceDate = form.invoiceDate;
  // @ts-ignore
  const receiptDate = form.receiptDate;
  // @ts-ignore
  const poDate = form.poDate;
  // @ts-ignore
  const deliveryChallanDate = form.deliveryChallanDate;
  // @ts-ignore
  const purchaseDate = form.purchaseDate;

  const updateField = (name, value) => {
    if (name === "purchaseDate") {
      purchaseDateAutoRef.current = { value: "", receivedOn: "" };
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  useEffect(() => {
    const cur = String(itemReceivedOn || "");
    const prev = lastItemReceivedOnRef.current;
    if (prev && cur && prev !== cur) {
      if (purchaseDateAutoRef.current.value && purchaseDate === purchaseDateAutoRef.current.value) {
        setForm((p) => ({ ...p, purchaseDate: "" }));
        // @ts-ignore
        setErrors((e) => (e.purchaseDate ? { ...e, purchaseDate: "" } : e));
        purchaseDateAutoRef.current = { value: "", receivedOn: "" };
      }
    }
    lastItemReceivedOnRef.current = cur;
  }, [itemReceivedOn, purchaseDate]);

  useEffect(() => {
    const receivedOn = String(itemReceivedOn || "").toLowerCase();
    let suggested = "";
    if (receivedOn === "invoice") suggested = String(invoiceDate || "");
    else if (receivedOn === "challan") suggested = String(deliveryChallanDate || "");
    else suggested = String(receiptDate || poDate || invoiceDate || deliveryChallanDate || "");

    if (!suggested) return;

    const cur = purchaseDate;
    const isEmpty = cur === undefined || cur === null || String(cur).trim() === "";
    const isAuto = purchaseDateAutoRef.current.value && cur === purchaseDateAutoRef.current.value;
    if (!isEmpty && !isAuto) return;

    setForm((prev) => ({ ...prev, purchaseDate: suggested }));
    // @ts-ignore
    setErrors((prev) => (prev.purchaseDate ? { ...prev, purchaseDate: "" } : prev));
    purchaseDateAutoRef.current = { value: suggested, receivedOn };
  }, [deliveryChallanDate, invoiceDate, purchaseDate, receiptDate]);

  const validate = () => {
    const newErr = {};

    const isEmpty = (val) => val === undefined || val === null || String(val).trim() === "";
    const isPresent = (val) => !isEmpty(val);

    sections.forEach((sec) => {
      const isTable = TABLE_SECTION_TITLES.includes(String(sec.sectionTitle));
      const fields = Array.isArray(sec.fields) ? sec.fields : [];

      if (!isTable) {
        fields.forEach((f) => {
          const key = f.name;
          const val = form[key];
          if (f.required && isEmpty(val)) newErr[key] = "Required";
          if (f.maxLength && String(val || "").length > f.maxLength) newErr[key] = `Max ${f.maxLength} chars`;
          if (f.type === "number") {
            if (isPresent(val) && isNaN(Number(val))) newErr[key] = "Must be a number";
            const num = Number(val);
            if (f.min != null && isPresent(val) && num < f.min) newErr[key] = `Min ${f.min}`;
            if (f.max != null && isPresent(val) && num > f.max) newErr[key] = `Max ${f.max}`;
          }
        });
        return;
      }

      const indices = new Set([0]);
      Object.keys(form).forEach((k) => {
        const m = k.match(/_(\d+)$/);
        if (!m) return;
        const base = k.slice(0, k.lastIndexOf("_"));
        if (!fields.some((f) => f.name === base)) return;
        indices.add(Number(m[1]));
      });

      const sorted = Array.from(indices).sort((a, b) => a - b);
      sorted.forEach((idx) => {
        const rowHasAny = fields.some((f) => isPresent(form[`${f.name}_${idx}`]));
        if (idx !== 0 && !rowHasAny) return;

        fields.forEach((f) => {
          const key = `${f.name}_${idx}`;
          const val = form[key];
          if (f.required && isEmpty(val)) newErr[key] = "Required";
          if (f.maxLength && String(val || "").length > f.maxLength) newErr[key] = `Max ${f.maxLength} chars`;
          if (f.type === "number") {
            if (isPresent(val) && isNaN(Number(val))) newErr[key] = "Must be a number";
            const num = Number(val);
            if (f.min != null && isPresent(val) && num < f.min) newErr[key] = `Min ${f.min}`;
            if (f.max != null && isPresent(val) && num > f.max) newErr[key] = `Max ${f.max}`;
          }
        });
      });
    });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const submit = async () => {
    if (!category || !itemType || loadingItemConfig || !sections.length) {
      alert("Please select category and item");
      return;
    }
    if (!validate()) {
      alert("Please fill required fields (Check console for details)");
      return;
    }
    setSubmitting(true);
    try {
      const sectionsPayload = (sections || []).map((sec) => {
        const isTable = TABLE_SECTION_TITLES.includes(String(sec.sectionTitle));
        if (!isTable) {
          const data = {};
          (sec.fields || []).forEach((f) => {
            data[f.name] = form[f.name] ?? null;
          });
          return { name: sec.sectionTitle, kind: "group", data };
        }
        // Collect dynamic rows by scanning suffix indices
        const rowMap = {};
        Object.keys(form).forEach((k) => {
          const m = k.match(/_(\d+)$/);
          if (!m) return;
          const base = k.slice(0, k.lastIndexOf("_"));
          if (!(sec.fields || []).some((f) => f.name === base)) return;
          const idx = Number(m[1]);
          if (!rowMap[idx]) rowMap[idx] = {};
          rowMap[idx][base] = form[k];
        });
        const rows = Object.keys(rowMap)
          .map((i) => Number(i))
          .sort((a, b) => a - b)
          .map((i) => rowMap[i])
          .filter((r) => Object.values(r).some((v) => String(v || "").trim() !== ""));
        return { name: sec.sectionTitle, kind: "rows", rows };
      });

      // Build nested objects
      const memorySec = sectionsPayload.find((s) => s.name === "Memory" && s.kind === "rows");
      const storageSec = sectionsPayload.find((s) => s.name === "Storage" && s.kind === "rows");
      const memory =
        memorySec && Array.isArray(memorySec.rows)
          ? {
              ramModules: memorySec.rows.map((r) => ({
                ramManufacturer: r.ramManufacturer ?? null,
                ramModelNumber: r.ramModelNumber ?? null,
                ramCapacityGB: r.ramCapacityGB != null ? Number(r.ramCapacityGB) : null,
                ramType: r.ramType ?? null,
                ramSpeedMHz: r.ramSpeedMHz != null ? Number(r.ramSpeedMHz) : null,
                ramFormFactor: r.ramFormFactor ?? null,
                ramSlot: r.ramSlot ?? null,
                ramChannel: r.ramChannel ?? null,
                ramSerialNumber: r.ramSerialNumber ?? null,
              })),
              totalNoOfMemory: memorySec.rows.filter(
                (r) =>
                  String(r.ramManufacturer || r.ramModelNumber || r.ramCapacityGB || "").trim() !== ""
              ).length,
            }
          : undefined;
      const storage =
        storageSec && Array.isArray(storageSec.rows)
          ? {
              storageDevices: storageSec.rows.map((r) => ({
                driveManufacturer: r.driveManufacturer ?? null,
                driveModelNumber: r.driveModelNumber ?? null,
                driveCapacityGB: r.driveCapacityGB != null ? Number(r.driveCapacityGB) : null,
                driveType: r.driveType ?? null,
                driveFormFactor: r.driveFormFactor ?? null,
                driveInterface: r.driveInterface ?? null,
                driveInterfaceSpeed: r.driveInterfaceSpeed ?? null,
                driveSerial: r.driveSerial ?? null,
                driveSlot: r.driveSlot ?? null,
                raidConfigured: r.raidConfigured ?? null,
                encryptionEnabled: r.encryptionEnabled ?? null,
              })),
              totalNoOfStorage: storageSec.rows.filter(
                (r) =>
                  String(
                    r.driveManufacturer || r.driveModelNumber || r.driveCapacityGB || ""
                  ).trim() !== ""
              ).length,
            }
          : undefined;

      const payload = {
        itemType,
        // @ts-ignore
        itemCategory: category || form.itemCategory || null,
        // @ts-ignore
        manufacturer: form.manufacturer || null,
        // @ts-ignore
        model: form.model || null,
        memory,
        storage,
        sections: sectionsPayload,
        ...form,
      };

      const PURCHASE_KEYS = [
        "purchaseType",
        "poNumber",
        "poDate",
        "receiptNumber",
        "receiptDate",
        "purchaseDate",
        "vendorId",
        "itemReceivedOn",
        "invoiceNumber",
        "invoiceDate",
        "deliveryChallanNumber",
        "deliveryChallanDate",
        "purchaseCost",
        "taxAmount",
        "totalAmount",
        "currency",
        "deliveryDate",
        "receivedBy",
      ];
      const WARRANTY_KEYS = [
        "warrantyAvailable",
        "warrantyMode",
        "inYear",
        "inMonth",
        "warrantyStartDate",
        "warrantyEndDate",
        "warrantyProvider",
        "supportVendor",
        "supportPhone",
        "supportEmail",
        "amcAvailable",
        "amcVendor",
        "amcStartDate",
        "amcEndDate",
        "warrantyTillDate",
        "warrantyStatus",
      ];

      const purchase = {};
      PURCHASE_KEYS.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(form, k)) purchase[k] = form[k];
      });
      const warranty = {};
      WARRANTY_KEYS.forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(form, k)) warranty[k] = form[k];
      });

      PURCHASE_KEYS.forEach((k) => delete payload[k]);
      WARRANTY_KEYS.forEach((k) => delete payload[k]);

      const created = await apiService.createAsset(payload);
      const createdAsset = created?._id ? created : created?.doc?._id ? created.doc : created?.data?._id ? created.data : created;
      const assetId = createdAsset?._id || createdAsset?.id;
      if (!assetId) {
        throw new Error("Asset created but assetId missing in response");
      }

      await Promise.all([
        // @ts-ignore
        apiService.upsertPurchase(assetId, { ...purchase, itemType, itemCategory: category || form.itemCategory || null, branchId: form.branch }),
        // @ts-ignore
        apiService.upsertWarranty(assetId, { ...warranty, itemType, itemCategory: category || form.itemCategory || null, branchId: form.branch }),
      ]);
      alert("Item saved successfully.");
      navigate("/assets");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    const ok = window.confirm("Discard changes?");
    if (!ok) return;
    setForm({});
    setErrors({});
    navigate("/assets");
  };

  const onItemTypeChange = (e) => {
    const v = String(e.target.value);
    if (!v) return;
    setForm({});
    setErrors({});
    navigate(`/assets/add/${v}`);
  };

  const onCategoryChange = (e) => {
    const v = String(e.target.value);
    setCategory(v);
    setForm({});
    setErrors({});
    navigate("/assets/add");
  };

  const itemsForCategory = category ? CATEGORY_ITEMS[category] || [] : [];
  const itemTitle = (() => {
    if (!itemType) return "Add Item";
    const categories = Object.values(CATEGORY_ITEMS || {});
    for (const arr of categories) {
      const f = arr.find((i) => i.value === itemType);
      if (f) return `Add ${f.label}`;
    }
    return `Add ${itemType}`;
  })();

  const isFormReady = !!category && !!itemType && !loadingItemConfig && Array.isArray(sections) && sections.length > 0;

  return (
    <div className="add-item-page">
      <div className="add-item-sticky">
        <div className="add-item-topbar" role="toolbar">
          <div className="topbar-left">
            <button aria-label="Back" className="back-btn" onClick={() => navigate(-1)}>
              ←
            </button>
            <div className="topbar-controls">
              <div className="control">
                <span>Category</span>
                <
  // @ts-ignore
                Select
                  name="category"
                  value={category}
                  onChange={onCategoryChange}
                  options={CATEGORIES}
                  placeholder="Select Category"
                />
              </div>
              <div className="control">
                <span>Select Item</span>
                <
  // @ts-ignore
                Select
                  name="itemType"
                  value={itemType}
                  onChange={onItemTypeChange}
                  options={itemsForCategory}
                  disabled={!category}
                  placeholder="Select item"
                />
              </div>
            </div>
          </div>
          {category && itemType ? <div className="topbar-title">{itemTitle}</div> : null}
          <div className="topbar-right" />
        </div>
      </div>
      {isFormReady ? (
        <div className="form-body">
          <FormRenderer
            sections={sections}
            formData={form}
            errors={errors}
            onChange={updateField}
            onSubmit={submit}
            onReset={() => setForm({})}
            onCancel={onCancel}
            submitting={submitting || loadingItemConfig}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AddItemPage;
