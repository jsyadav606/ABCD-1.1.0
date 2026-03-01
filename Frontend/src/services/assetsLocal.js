const TYPES_KEY = "asset_types";
const ITEMS_KEY = "asset_items";

const read = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    return;
  }
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const getTypes = () => {
  const types = read(TYPES_KEY);
  return Array.isArray(types) ? types : [];
};

export const createType = (payload) => {
  const types = getTypes();
  const newType = {
    id: uid(),
    name: payload.name,
    category: payload.category,
    fields: Array.isArray(payload.fields) ? payload.fields : [],
    isActive: true,
    createdAt: Date.now(),
  };
  types.push(newType);
  write(TYPES_KEY, types);
  return newType;
};

export const updateType = (id, updates) => {
  const types = getTypes();
  const idx = types.findIndex((t) => String(t.id) === String(id));
  if (idx !== -1) {
    types[idx] = { ...types[idx], ...updates };
    write(TYPES_KEY, types);
    return types[idx];
  }
  return null;
};

export const getItems = () => {
  const items = read(ITEMS_KEY);
  return Array.isArray(items) ? items : [];
};

export const createItem = (payload) => {
  const items = getItems();
  const newItem = {
    _id: uid(),
    typeId: payload.typeId,
    typeCategory: payload.typeCategory,
    name: payload.name || "",
    ownerId: payload.ownerId || null,
    fields: payload.fields || {},
    status: payload.status || "IN_STOCK",
    createdAt: Date.now(),
  };
  items.push(newItem);
  write(ITEMS_KEY, items);
  return newItem;
};

export const filterItems = ({ tab, ownerId, isSuper, canViewAll }) => {
  let items = getItems();
  if (tab && tab !== "ALL") {
    items = items.filter((it) => it.typeCategory === tab);
  }
  if (!isSuper && !canViewAll) {
    items = items.filter((it) => String(it.ownerId) === String(ownerId));
  }
  return items;
};

export const removeAllAssetsLocal = () => {
  write(TYPES_KEY, []);
  write(ITEMS_KEY, []);
};

