export const BRANCH_SCOPE_KEY = "selectedBranch";
export const BRANCH_SCOPE_EVENT = "branch-scope-changed";

export const getSelectedBranch = () => {
  try {
    const stored = localStorage.getItem(BRANCH_SCOPE_KEY);
    if (stored) {
      // Check if it's JSON or old string format
      if (stored.startsWith('{')) {
        const parsed = JSON.parse(stored);
        return parsed.id || "";
      } else {
        // Old format, return as is
        return stored;
      }
    }
    return "";
  } catch {
    return "";
  }
};

export const getSelectedBranchName = () => {
  try {
    const stored = localStorage.getItem(BRANCH_SCOPE_KEY);
    if (stored) {
      if (stored.startsWith('{')) {
        const parsed = JSON.parse(stored);
        return parsed.name || "";
      } else {
        // Old format, no name stored
        return "";
      }
    }
    return "";
  } catch {
    return "";
  }
};

export const setSelectedBranch = (branchId, branchName = "") => {
  try {
    if (branchId) {
      const data = { id: branchId, name: branchName };
      localStorage.setItem(BRANCH_SCOPE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(BRANCH_SCOPE_KEY);
    }
    const ev = new CustomEvent(BRANCH_SCOPE_EVENT, { detail: { branchId, branchName } });
    window.dispatchEvent(ev);
  } catch {
    // ignore
  }
};

export const onBranchChange = (handler) => {
  const wrapped = (e) => handler(e.detail?.branchId || "", e.detail?.branchName || "");
  window.addEventListener(BRANCH_SCOPE_EVENT, wrapped);
  return () => window.removeEventListener(BRANCH_SCOPE_EVENT, wrapped);
};
