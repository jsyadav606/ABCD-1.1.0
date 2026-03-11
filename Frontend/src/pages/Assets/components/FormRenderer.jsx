import { useEffect, useMemo, useState } from "react";
import Input from "../../../components/Input/Input.jsx";
import Select from "../../../components/Select/Select.jsx";
import Textarea from "../../../components/Textarea/Textarea.jsx";
import Button from "../../../components/Button/Button.jsx";
import { useScanning } from "../../../components/BarcodeScanner/useScanning.js";
import Radio from "../../../components/Radio/Radio.jsx";

const evaluateShowIf = (cond, getValue) => {
  // Support verbose form: { field: 'purchaseType', equals: 'PO' }
  if (typeof cond === "object" && "field" in cond) {
    return String(getValue(cond.field) ?? "") === String(cond.equals ?? "");
  }
  // Support shorthand form: { purchaseType: 'PO', other: 'X' }
  if (typeof cond === "object") {
    return Object.entries(cond).every(
      ([k, v]) => String(getValue(k) ?? "") === String(v ?? "")
    );
  }
  return true;
};

const shouldShow = (field, getValue) => {
  if (!field.showIf) return true;
  return evaluateShowIf(field.showIf, getValue);
};

const normalizeOptions = (options, getValue) => {
  if (!Array.isArray(options)) return [];
  const mapped = options
    .filter((opt) => {
      if (opt && typeof opt === "object" && "showIf" in opt) {
        return evaluateShowIf(opt.showIf, getValue);
      }
      return true;
    })
    .map((opt) => {
      if (opt && typeof opt === "object") {
        const v =
          opt.value ??
          opt.code ??
          opt._id ??
          opt.id ??
          opt.name ??
          opt.label ??
          "";
        const l = opt.label ?? opt.name ?? opt.value ?? opt.code ?? String(v);
        return { value: String(v), label: String(l) };
      }
      return { value: String(opt), label: String(opt) };
    });
  const seen = new Set();
  return mapped.filter((o) => {
    const k = String(o?.value ?? "");
    if (!k) return false;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const Field = ({ def, value, onChange, onScan, error, formData }) => {
  const getValue = useMemo(() => (k) => formData?.[k], [formData]);
  const selectOptions = useMemo(() => normalizeOptions(def.options, getValue), [def.options, getValue]);

  useEffect(() => {
    if (def.type !== "select") return;
    if (value == null || String(value).trim() === "") return;
    const exists = selectOptions.some((o) => String(o.value) === String(value));
    if (!exists) onChange(def.name, "");
  }, [def.type, def.name, onChange, selectOptions, value]);

  const common = {
    name: def.name,
    label: def.label,
    value: value ?? "",
    onChange: (e) => onChange(def.name, e.target.value),
    placeholder: def.placeholder,
    required: !!def.required,
    readOnly: !!def.readOnly,
    disabled: !!def.disabled || (def.type === "select" && !!def.readOnly),
    error: error ?? def.error,
    "aria-label": def.label,
    maxLength: def.maxLength,
  };
  if (def.type === "select") return <Select onBlur={undefined} {...common} options={selectOptions} />;
  if (def.type === "radio") {
    return (
      <div className="input-wrapper">
        {def.label && <label className="input-label">{def.label}{common.required ? <span className="input-required">*</span> : null}</label>}
        <div className="fr-radio-group">
          {selectOptions.map((opt) => (
            <Radio
              key={opt.value}
              name={def.name}
              label={opt.label}
              value={opt.value}
              checked={String(common.value) === String(opt.value)}
              onChange={(e) => common.onChange(e)}
              disabled={common.disabled}
              error={common.error}
            />
          ))}
        </div>
        {common.error ? <div className="input-error-text">{common.error}</div> : null}
      </div>
    );
  }
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

const TableField = ({ def, value, onChange, error, formData, rowIndex }) => {
  const getValue = useMemo(
    () => (k) => (formData?.[`${k}_${rowIndex}`] ?? formData?.[k]),
    [formData, rowIndex]
  );
  const selectOptions = useMemo(() => normalizeOptions(def.options, getValue), [def.options, getValue]);

  useEffect(() => {
    if (def.type !== "select") return;
    if (value == null || String(value).trim() === "") return;
    const exists = selectOptions.some((o) => String(o.value) === String(value));
    if (!exists) onChange(def.name, "");
  }, [def.type, def.name, onChange, selectOptions, value]);

  const common = {
    name: def.name,
    value: value ?? "",
    onChange: (e) => onChange(def.name, e.target.value),
    placeholder: def.placeholder,
    required: !!def.required,
    readOnly: !!def.readOnly,
    disabled: !!def.disabled || (def.type === "select" && !!def.readOnly),
    error: error ?? def.error,
    "aria-label": def.label,
    maxLength: def.maxLength,
  };
  if (def.type === "select") return <Select label={undefined} onBlur={undefined} {...common} options={selectOptions} />;
  if (def.type === "textarea") return <Textarea label={undefined} onBlur={undefined} {...common} rows={def.rows || 3} />;
  return <Input label={undefined} onBlur={undefined} onScan={undefined} {...common} type={def.type || "text"} min={def.min} max={def.max} />;
};

const FormRenderer = ({ sections = [], formData = {}, errors = {}, onChange, onSubmit, onReset, onCancel, submitting }) => {
  const list = Array.isArray(sections) ? sections : [];
  const tableSections = ["Processors", "Storage", "Memory", "Network Details"];
  const [rowCounts, setRowCounts] = useState({});
  const { openScan } = useScanning();
  const getValue = useMemo(() => (k) => formData?.[k], [formData]);

  const getCount = (title) => {
    const v = rowCounts[title];
    return typeof v === "number" && v > 0 ? v : 1;
  };

  const insertRowAfter = (title, rowIndex, fields) => {
    const c = getCount(title);
    const insertAt = Math.min(Math.max(Number(rowIndex) + 1, 0), c);

    for (let i = c - 1; i >= insertAt; i -= 1) {
      fields.forEach((f) => {
        const fromKey = `${f.name}_${i}`;
        const toKey = `${f.name}_${i + 1}`;
        const val = formData?.[fromKey] ?? "";
        onChange(toKey, val);
        onChange(fromKey, "");
      });
    }

    fields.forEach((f) => {
      onChange(`${f.name}_${insertAt}`, "");
    });

    setRowCounts((prev) => ({ ...prev, [title]: c + 1 }));
  };
  const removeRowAt = (title, rowIndex, fields) => {
    const c = getCount(title);
    if (c <= 1) return;
    const removeAt = Math.min(Math.max(Number(rowIndex), 0), c - 1);

    for (let i = removeAt; i < c - 1; i += 1) {
      fields.forEach((f) => {
        const fromKey = `${f.name}_${i + 1}`;
        const toKey = `${f.name}_${i}`;
        const val = formData?.[fromKey] ?? "";
        onChange(toKey, val);
      });
    }

    fields.forEach((f) => {
      onChange(`${f.name}_${c - 1}`, "");
    });

    setRowCounts((prev) => ({ ...prev, [title]: c - 1 }));
  };
  return (
    <div className="fr-container">
      {list.map((sec) => (
        (() => {
          const isTable = tableSections.includes(String(sec.sectionTitle));
          if (!isTable) {
            const filtered = (sec.fields || []).filter((f) => shouldShow(f, getValue));
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
                      formData={formData}
                    />
                  ))}
                </div>
              </section>
            );
          }

          const count = getCount(sec.sectionTitle);
          const allFields = Array.isArray(sec.fields) ? sec.fields : [];

          const getRowValue = (rowIndex) => (k) => formData?.[`${k}_${rowIndex}`] ?? formData?.[k];

          const headerFields = allFields.filter((f) => {
            if (!f?.showIf) return true;
            for (let i = 0; i < count; i += 1) {
              if (shouldShow(f, getRowValue(i))) return true;
            }
            return false;
          });

          const cols = Math.max(headerFields.length, 1);
          return (
            <section key={sec.sectionTitle} className="fr-card fr-table-section" aria-labelledby={`sec-${sec.sectionTitle}`}>
              <div id={`sec-${sec.sectionTitle}`} className="fr-title">{sec.sectionTitle}</div>
              <div
                className="fr-table-head"
                style={{ gridTemplateColumns: `repeat(${cols}, 320px) 80px` }}
              >
                {headerFields.map((f) => (
                  <div key={`${f.name}-h`} className="fr-table-head-cell">{f.label}</div>
                ))}
                <div className="fr-table-head-cell"></div>
              </div>
              {Array.from({ length: count }).map((_, idx) => (
                <div
                  key={`row-${sec.sectionTitle}-${idx}`}
                  className="fr-table-row"
                  style={{ gridTemplateColumns: `repeat(${cols}, 320px) 80px` }}
                >
                  {headerFields.map((f) => {
                    const visible = shouldShow(f, getRowValue(idx));
                    if (!visible) {
                      return <div key={`${f.name}-c-${idx}`} className="fr-table-row-cell" />;
                    }
                    return (
                      <div key={`${f.name}-c-${idx}`} className="fr-table-row-cell">
                        <TableField
                          def={f}
                          value={formData[`${f.name}_${idx}`]}
                          error={errors?.[`${f.name}_${idx}`]}
                          onChange={(name, val) => onChange(`${name}_${idx}`, val)}
                          formData={formData}
                          rowIndex={idx}
                        />
                      </div>
                    );
                  })}
                  <div className="fr-table-actions">
                    <Button
                      variant="outline"
                      onClick={() => insertRowAfter(sec.sectionTitle, idx, headerFields)}
                      aria-label="Add row"
                    >
                      +
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => removeRowAt(sec.sectionTitle, idx, headerFields)}
                      aria-label="Remove row"
                      disabled={count <= 1}
                    >
                      −
                    </Button>
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
