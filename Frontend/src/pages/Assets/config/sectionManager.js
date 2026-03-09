// @ts-ignore
import { genericConfig } from "./items/generic.js";

const clone = (obj) => JSON.parse(JSON.stringify(obj || {}));

const normalize = (s) => String(s || "").trim().toLowerCase();

const genericMap = (() => {
  const map = new Map();
  const list = Array.isArray(genericConfig?.sections) ? genericConfig.sections : [];
  list.forEach((sec) => {
    if (!sec?.sectionTitle) return;
    map.set(normalize(sec.sectionTitle), clone(sec));
  });
  return map;
})();

export const getGenericSection = (title) => {
  const sec = genericMap.get(normalize(title));
  return sec ? clone(sec) : null;
};

/**
 * Build a section from generic config with optional overrides.
 * Options:
 * - sectionTitle: string (override title)
 * - pickFields: string[] (only include these field names)
 * - omitFields | excludeFields: string[] (remove these field names)
 * - addFields: Field[] (append additional fields)
 * - overrideFields: Field[] (override by name; shallow merge)
 */
export const fromGeneric = (title, options = {}) => {
  const base = getGenericSection(title);
  if (!base) {
    return {
      sectionTitle: title || "Unknown Section",
      fields: [
        {
          name: "__missing_section__",
          label: `Missing section "${title}" in generic configuration`,
          type: "text",
          readOnly: true,
        },
      ],
      _error: "missing_section",
    };
  }
  let fields = Array.isArray(base.fields) ? clone(base.fields) : [];

  if (Array.isArray(options.pickFields) && options.pickFields.length) {
    const set = new Set(options.pickFields.map((n) => String(n)));
    fields = fields.filter((f) => set.has(f.name));
  }

  // Remove fields by name if requested
  const omitList = options.omitFields || options.excludeFields;
  if (Array.isArray(omitList) && omitList.length) {
    const omit = new Set(omitList.map((n) => String(n)));
    fields = fields.filter((f) => !omit.has(f.name));
  }

  if (Array.isArray(options.overrideFields) && options.overrideFields.length) {
    const byName = new Map(fields.map((f) => [f.name, f]));
    options.overrideFields.forEach((ov) => {
      const old = byName.get(ov.name);
      if (old) Object.assign(old, ov);
    });
    fields = Array.from(byName.values());
  }

  if (Array.isArray(options.addFields) && options.addFields.length) {
    fields = fields.concat(clone(options.addFields));
  }

  return {
    sectionTitle: options.sectionTitle || base.sectionTitle,
    fields,
  };
};

/**
 * Resolve a sections array that may include references like:
 * { ref: { source: 'generic', title: 'Basic Information' }, addFields: [...] }
 */
export const resolveSections = (sections) => {
  const list = Array.isArray(sections) ? sections : [];
  return list.map((sec) => {
    if (sec?.ref?.source === "generic" && sec?.ref?.title) {
      return fromGeneric(sec.ref.title, {
        sectionTitle: sec.sectionTitle || undefined,
        pickFields: sec.pickFields,
        addFields: sec.addFields,
        overrideFields: sec.overrideFields,
      });
    }
    return sec;
  });
};

