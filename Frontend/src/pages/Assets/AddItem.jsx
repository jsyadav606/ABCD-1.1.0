import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AddItem.css";
import Button from "../../components/Button/Button.jsx";
// @ts-ignore
import FormRenderer from "./components/FormRenderer.jsx";
// @ts-ignore
import { apiService } from "./services/apiService.js";
import { fetchBranchesForDropdown } from "../../services/userApi.js";
import { authAPI } from "../../services/api.js";
import { getSelectedBranch } from "../../utils/scope.js";
//@ts-ignore
import { ITEM_FIELD_CONFIG, CATEGORY_ITEMS } from "./config/itemFieldConfig.js";

const CATEGORIES = [
  { value: "fixed", label: "Fixed" },
  { value: "peripheral", label: "Peripheral" },
  { value: "consumable", label: "Consumable" },
  { value: "intangible", label: "Intangible" },
];



const REGISTRY = ITEM_FIELD_CONFIG;

const AddItemPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const allItems = useMemo(() => Object.values(CATEGORY_ITEMS || {}).flat(), []);
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

  // Branch Logic
  const [branchOptions, setBranchOptions] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    const initBranch = async () => {
      try {
        setLoadingBranches(true);
        // 1. Get user profile
        const prof = await authAPI.getProfile();
        const user = prof.data?.data?.user;
        if (!user?.organizationId) return;

        // 2. Fetch all branches
        const branches = await fetchBranchesForDropdown(user.organizationId);
        const opts = branches.map((b) => ({ value: String(b._id), label: b.name }));
        setBranchOptions(opts);

        // 3. Determine default branch
        const dashboardBranch = getSelectedBranch(); // From scope/localStorage
        
        // Check if user is restricted to specific branches
        const allowedBranchIds = Array.isArray(user.branchId) 
          ? user.branchId.map(b => typeof b === 'object' ? String(b._id) : String(b)) 
          : [];
        
        // If user is not super admin (assuming super admin has empty or wildcard branchId, or we check role)
        // For simplicity, if allowedBranchIds has length > 0, restrict options
        let finalOptions = opts;
        if (allowedBranchIds.length > 0 && user.role !== 'super_admin') {
           finalOptions = opts.filter(o => allowedBranchIds.includes(o.value));
           setBranchOptions(finalOptions);
        }

        let defaultBranch = "";
        
        // A. If dashboard has a specific valid selection, use it
        if (dashboardBranch && dashboardBranch !== "__ALL__" && finalOptions.some(o => o.value === dashboardBranch)) {
          defaultBranch = dashboardBranch;
        } 
        // B. Else if user has only 1 available branch, enforce it
        else if (finalOptions.length === 1) {
          defaultBranch = finalOptions[0].value;
        }
        
        // Update form if we have a default
        if (defaultBranch) {
          setForm(prev => ({ ...prev, branch: defaultBranch }));
        }

      } catch (err) {
        console.error("Failed to load branches", err);
      } finally {
        setLoadingBranches(false);
      }
    };
    initBranch();
  }, []);

  const sections = useMemo(() => {
    if (!category || !itemType) return [];
    const baseSections = REGISTRY[itemType]?.sections || [];
    
    // Inject dynamic branch options into the "Location & Assignment" section -> "branch" field
    return baseSections.map(sec => {
      if (sec.sectionTitle === "Location & Assignment") {
        return {
          ...sec,
          fields: sec.fields.map(f => {
            if (f.name === "branch") {
              return { 
                ...f, 
                options: branchOptions, 
                required: true,
                readOnly: false // Keep editable even if only one option, per user request
              };
            }
            return f;
          })
        };
      }
      return sec;
    });
  }, [category, itemType, branchOptions]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };


  const validate = () => {
    const tableSections = ["Processors", "Storage", "Memory"];
    const reqKeys = [];
    sections.forEach((sec) => {
      const isTable = tableSections.includes(String(sec.sectionTitle));
      (sec.fields || []).forEach((f) => {
        if (f.required) {
          reqKeys.push(isTable ? `${f.name}_0` : f.name);
        }
      });
    });
    const newErr = {};
    reqKeys.forEach((k) => {
      if (!String(form[k] || "").trim()) newErr[k] = "Required";
    });
    sections.forEach((sec) => {
      const isTable = tableSections.includes(String(sec.sectionTitle));
      (sec.fields || []).forEach((f) => {
        const keysToCheck = isTable ? [`${f.name}_0`] : [f.name];
        keysToCheck.forEach((key) => {
          const val = form[key];
          if (f.maxLength && String(val || "").length > f.maxLength) {
            newErr[key] = `Max ${f.maxLength} chars`;
          }
          if (f.type === "number") {
            if (String(val || "").trim() && isNaN(Number(val))) {
              newErr[key] = "Must be a number";
            }
            const num = Number(val);
            if (f.min != null && String(val || "").trim() && num < f.min) {
              newErr[key] = `Min ${f.min}`;
            }
            if (f.max != null && String(val || "").trim() && num > f.max) {
              newErr[key] = `Max ${f.max}`;
            }
          }
        });
      });
    });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      alert("Please fill required fields");
      return;
    }
    setSubmitting(true);
    try {
      // Build section-based and section-objects payload mirroring UI
      const tableSections = ["Processors", "Storage", "Memory"];
      const sectionsPayload = (sections || []).map((sec) => {
        const isTable = tableSections.includes(String(sec.sectionTitle));
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
                manufacturer: r.ramManufacturer ?? null,
                modelNumber: r.ramModelNumber ?? null,
                capacityGB: r.ramCapacityGB != null ? Number(r.ramCapacityGB) : null,
                type: r.ramType ?? null,
                speedMHz: r.ramSpeedMHz != null ? Number(r.ramSpeedMHz) : null,
                formFactor: r.ramFormFactor ?? null,
                slot: r.ramSlot ?? null,
                channel: r.ramChannel ?? null,
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
                manufacturer: r.driveManufacturer ?? null,
                modelNumber: r.driveModelNumber ?? null,
                capacityGB: r.driveCapacityGB != null ? Number(r.driveCapacityGB) : null,
                type: r.driveType ?? null,
                formFactor: r.driveFormFactor ?? null,
                interface: r.driveInterface ?? null,
                interfaceSpeed: r.driveInterfaceSpeed ?? null,
                serialNumber: r.driveSerial ?? null,
                slot: r.driveSlot ?? null,
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
        assetCategory: category || form.assetCategory || null,
        memory,
        storage,
        sections: sectionsPayload,
        ...form,
      };
      await apiService.createAsset(payload);
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
      if (f) return `New ${f.label}`;
    }
    return `New ${itemType}`;
  })();

  return (
    <div className="add-item-page">
      <div className="page-header">
        <button aria-label="Back" className="back-btn" onClick={() => navigate(-1)}>←</button>
        <span className="page-title">{itemTitle}</span>
      </div>
      <div className="sticky-header" role="toolbar">
        <div className="sticky-row">
          <div className="sticky-controls">
            <label className="control">
              <span>Category</span>
              <select aria-label="Category" value={category} onChange={onCategoryChange}>
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label className="control">
              <span>Select Item</span>
              <select aria-label="Item Type" value={itemType} onChange={onItemTypeChange} disabled={!category}>
                <option value="">Select item</option>
                {itemsForCategory.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>
      {/* {showAlert && (
        <div className="alert-row" onClick={() => setShowAlert(false)} role="alert" aria-live="polite">
          <span className="alert-text">New Computer</span>
          <span className="alert-icon">✖</span>
        </div>
      )} */}
      <div className="form-body">
        <FormRenderer
          sections={sections}
          formData={form}
          errors={errors}
          onChange={updateField}
          onSubmit={submit}
          onReset={() => setForm({})}
          onCancel={onCancel}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default AddItemPage;
