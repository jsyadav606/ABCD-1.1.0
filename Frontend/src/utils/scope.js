export const BRANCH_SCOPE_KEY = "selectedBranch";
export const BRANCH_SCOPE_EVENT = "branch-scope-changed";

export const getSelectedBranch = () => {
  try {
    return localStorage.getItem(BRANCH_SCOPE_KEY) || "";
  } catch {
    return "";
  }
};

export const setSelectedBranch = (branchId) => {
  try {
    if (branchId) {
      localStorage.setItem(BRANCH_SCOPE_KEY, branchId);
    } else {
      localStorage.removeItem(BRANCH_SCOPE_KEY);
    }
    const ev = new CustomEvent(BRANCH_SCOPE_EVENT, { detail: { branchId } });
    window.dispatchEvent(ev);
  } catch {
    // ignore
  }
};

export const onBranchChange = (handler) => {
  const wrapped = (e) => handler(e.detail?.branchId || "");
  window.addEventListener(BRANCH_SCOPE_EVENT, wrapped);
  return () => window.removeEventListener(BRANCH_SCOPE_EVENT, wrapped);
};
