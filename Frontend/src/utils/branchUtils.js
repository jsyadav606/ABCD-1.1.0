/**
 * Branch Utilities
 *
 * Logics:
 * - getBranchName(branchId, branches):
 *   Returns branch name for given ID from branches array, or 'Unknown' if not found.
 * - This utility is reusable across components for displaying branch names.
 */

export const getBranchName = (branchId, branches) => {
  if (!branchId || !branches || branches.length === 0) return '--';

  // Normalize branchId to string for comparison
  let id = '';
  if (typeof branchId === 'string') {
    id = branchId;
  } else if (typeof branchId === 'object' && branchId._id) {
    id = String(branchId._id);
  } else if (typeof branchId === 'object' && branchId.id) {
    id = String(branchId.id);
  } else if (typeof branchId === 'object' && branchId.branchId) {
    id = String(branchId.branchId);
  }

  // Try to find branch by _id, id, or branchId
  const branch = branches.find(
    b => String(b._id) === id || String(b.id) === id || String(b.branchId) === id
  );
  if (branch) return branch.branchName || branch.name || '--';

  // If branchId is object with branchName
  if (typeof branchId === 'object' && branchId.branchName) {
    return branchId.branchName;
  }

  return '--';
};