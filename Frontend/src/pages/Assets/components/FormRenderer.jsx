import { useState } from "react";
import Input from "../../../components/Input/Input.jsx";
import Select from "../../../components/Select/Select.jsx";
import Textarea from "../../../components/Textarea/Textarea.jsx";
import Button from "../../../components/Button/Button.jsx";
import { useScanning } from "../../../components/BarcodeScanner/useScanning.js";

const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options.map((opt) => {
    if (opt && typeof opt === "object" && "value" in opt && "label" in opt) return opt;
    return { value: String(opt), label: String(opt) };
  });
};

const shouldShow = (field, formData) => {
  if (!field.showIf) return true;
  const cond = field.showIf;
  // Support verbose form: { field: 'purchaseType', equals: 'PO' }
  if (typeof cond === "object" && "field" in cond) {
    return String(formData[cond.field] ?? "") === String(cond.equals ?? "");
  }
  // Support shorthand form: { purchaseType: 'PO', other: 'X' }
  if (typeof cond === "object") {
    return Object.entries(cond).every(
      ([k, v]) => String(formData[k] ?? "") === String(v ?? "")
    );
  }
  return true;
};

const Field = ({ def, value, onChange, onScan, error }) => {
  const common = {
    name: def.name,
    label: def.label,
    value: value ?? "",
    onChange: (e) => onChange(def.name, e.target.value),
    required: !!def.required,
    readOnly: !!def.readOnly,
    disabled: !!def.disabled || (def.type === "select" && !!def.readOnly),
    error: error ?? def.error,
    "aria-label": def.label,
    maxLength: def.maxLength,
  };
  if (def.type === "select") return <Select onBlur={undefined} {...common} options={normalizeOptions(def.options)} />;
  if (def.type === "textarea") return <Textarea onBlur={undefined} {...common} rows={def.rows || 3} />;
  const enableScan = String(def.name) === "serialNumber" || !!def.scan;
  return (
    <Input
    onBlur={undefined} {...common}
    type={def.type || "text"}
    min={def.min}
    max={def.max}
    scanable={enableScan}
    onScan={() => onScan(def.name)}    />
  );
};

const TableField = ({ def, value, onChange, error }) => {
  const common = {
    name: def.name,
    value: value ?? "",
    onChange: (e) => onChange(def.name, e.target.value),
    required: !!def.required,
    readOnly: !!def.readOnly,
    disabled: !!def.disabled || (def.type === "select" && !!def.readOnly),
    error: error ?? def.error,
    "aria-label": def.label,
    maxLength: def.maxLength,
  };
  if (def.type === "select") return <Select label={undefined} onBlur={undefined} {...common} options={normalizeOptions(def.options)} />;
  if (def.type === "textarea") return <Textarea label={undefined} onBlur={undefined} {...common} rows={def.rows || 3} />;
  return <Input label={undefined} onBlur={undefined} onScan={undefined} {...common} type={def.type || "text"} min={def.min} max={def.max} />;
};

const FormRenderer = ({ sections = [], formData = {}, errors = {}, onChange, onSubmit, onReset, onCancel, submitting }) => {
  const list = Array.isArray(sections) ? sections : [];
  const tableSections = ["Processors", "Storage", "Memory"];
  const [rowCounts, setRowCounts] = useState({});
  const { openScan } = useScanning();

  const getCount = (title) => {
    const v = rowCounts[title];
    return typeof v === "number" && v > 0 ? v : 1;
  };
  const addRow = (title) => {
    const c = getCount(title);
    setRowCounts((prev) => ({ ...prev, [title]: c + 1 }));
  };
  const removeRow = (title, fields) => {
    const c = getCount(title);
    if (c <= 1) return;
    const idx = c - 1;
    fields.forEach((f) => {
      const key = `${f.name}_${idx}`;
      onChange(key, "");
    });
    setRowCounts((prev) => ({ ...prev, [title]: c - 1 }));
  };
  return (
    <div className="fr-container">
      {list.map((sec) => (
        (() => {
          const filtered = (sec.fields || []).filter((f) => shouldShow(f, formData));
          const isTable = tableSections.includes(String(sec.sectionTitle));
          if (!isTable) {
            return (
              <section key={sec.sectionTitle} className="fr-card" aria-labelledby={`sec-${sec.sectionTitle}`}>
                <div id={`sec-${sec.sectionTitle}`} className="fr-title">{sec.sectionTitle}</div>
                <div className="fr-grid">
                  {filtered.map((f) => (
                    <Field
                      key={f.name}
                      def={f}
                      value={formData[f.name]}
                      error={errors?.[f.name]}
                      onChange={onChange}
                      onScan={(name) => openScan((text) => onChange(name, text))}
                    />
                  ))}
                </div>
              </section>
            );
          }
          const cols = Math.max(filtered.length, 1);
          const count = getCount(sec.sectionTitle);
          return (
            <section key={sec.sectionTitle} className="fr-card fr-table-section" aria-labelledby={`sec-${sec.sectionTitle}`}>
              <div id={`sec-${sec.sectionTitle}`} className="fr-title">{sec.sectionTitle}</div>
              <div className="fr-table-head" style={{ gridTemplateColumns: `repeat(${cols}, minmax(160px, 1fr)) auto` }}>
                {filtered.map((f) => (
                  <div key={`${f.name}-h`} className="fr-table-head-cell">{f.label}</div>
                ))}
                <div className="fr-table-head-cell"></div>
              </div>
              {Array.from({ length: count }).map((_, idx) => (
                <div key={`row-${sec.sectionTitle}-${idx}`} className="fr-table-row" style={{ gridTemplateColumns: `repeat(${cols}, minmax(160px, 1fr)) auto` }}>
                  {filtered.map((f) => (
                    <div key={`${f.name}-c-${idx}`} className="fr-table-row-cell">
                      <TableField def={f} value={formData[`${f.name}_${idx}`]} error={errors?.[`${f.name}_${idx}`]} onChange={(name, val) => onChange(`${name}_${idx}`, val)} />
                    </div>
                  ))}
                  <div className="fr-table-actions">
                    {idx === count - 1 && (
                      <>
                        <Button variant="outline" onClick={() => addRow(sec.sectionTitle)} aria-label="Add row">+</Button>
                        <Button variant="outline" onClick={() => removeRow(sec.sectionTitle, filtered)} aria-label="Remove row">−</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </section>
          );
        })()
      ))}
      {list.length > 0 && (
        <div className="form-actions">
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
          <Button variant="outline" onClick={onReset} disabled={submitting}>Reset</Button>
          <Button variant="primary" onClick={onSubmit} disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
        </div>
      )}
    </div>
  );
};

export default FormRenderer;
