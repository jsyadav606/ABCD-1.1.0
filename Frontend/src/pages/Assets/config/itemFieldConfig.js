// @ts-ignore
import { genericConfig } from "./items/generic.js";

export const CATEGORY_ITEMS = {
  fixed: [
    { value: "cpu", label: "CPU" },
    { value: "monitor", label: "Monitor" },
    { value: "laptop", label: "Laptop" },
    { value: "printer", label: "Printer" },
    { value: "tablet", label: "Tablet" },
    { value: "interactivePanel", label: "Interactive Panel" },
    { value: "projector", label: "Projector" },
    { value: "networkSwitch", label: "Network Switch" },
    { value: "router", label: "Router" },
    { value: "firewall", label: "Firewall" },
    { value: "barcodePrinter", label: "Barcode Printer" },
    { value: "barcodeScanner", label: "Barcode Scanner" },
    { value: "scanner", label: "Scanner" },
    { value: "biometricDevice", label: "Biometric Device" },
    { value: "nasStorage", label: "NAS Storage" },
  ],
  peripheral: [
    { value: "keyboard", label: "Keyboard" },
    { value: "camera", label: "Camera" },
    { value: "mouse", label: "Mouse" },
    { value: "headphone", label: "Headphone" },
  ],
  consumable: [
    { value: "toner", label: "Toner" },
    { value: "cable", label: "Cable" },
  ],
  intangible: [
    { value: "software_license", label: "Software License" },
    { value: "domain", label: "Domain" },
  ],
};

const typeToCategory = (() => {
  const map = new Map();
  Object.entries(CATEGORY_ITEMS).forEach(([category, items]) => {
    (items || []).forEach((i) => {
      if (i?.value) map.set(String(i.value).toLowerCase(), category);
    });
  });
  return map;
})();

const loadedCategoryModules = new Map();
const configCache = new Map();

const normalizeConfigKeys = (cfg) => {
  const out = {};
  if (!cfg || typeof cfg !== "object") return out;
  Object.keys(cfg).forEach((k) => {
    out[String(k).toLowerCase()] = cfg[k];
  });
  return out;
};

const loadCategoryConfigs = async (category) => {
  const key = String(category || "").toLowerCase();
  if (loadedCategoryModules.has(key)) return loadedCategoryModules.get(key);
  let p;
  if (key === "fixed") {
    // @ts-ignore
    p = import("./items/fixed.js").then((m) => normalizeConfigKeys(m.fixedConfigs));
  } else if (key === "peripheral") {
    // @ts-ignore
    p = import("./items/peripheral.js").then((m) => normalizeConfigKeys(m.peripheralConfigs));
  } else {
    p = Promise.resolve({});
  }
  loadedCategoryModules.set(key, p);
  return p;
};

export const getItemFieldConfig = async (itemType) => {
  const type = String(itemType || "").trim().toLowerCase();
  if (!type) return genericConfig;
  if (configCache.has(type)) return configCache.get(type);
  const category = typeToCategory.get(type);
  const categoryConfigs = await loadCategoryConfigs(category);
  const cfg = categoryConfigs?.[type] || genericConfig;
  configCache.set(type, cfg);
  return cfg;
};

export const ITEM_FIELD_CONFIG = {};

