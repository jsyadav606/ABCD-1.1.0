# Branch Filter - Quick Reference

## What Was Added?
A **Branch** filter field in the Asset filter popup that shows only the branches assigned to the logged-in user.

---

## How It Works

### For Users with 1 Branch:
```
Branch Filter = Single branch (pre-selected, no option to change)
Table = Shows only assets from that branch
```

### For Users with 2+ Branches:
```
Branch Filter = "All Branches" (pre-selected) + list of user's branches
Table = Shows assets from all user's branches (unless filtered to specific branch)
```

---

## Key Code Changes

### asset.jsx
```javascript
// Fetch user's branches on mount
useEffect(() => {
  const resp = await authAPI.getProfile();
  const branchIds = resp.data?.data?.user?.branchId;
  setUserBranchIds(branchIds);
  // Set sensible default based on count
});

// Create branch options (only user's branches)
const branchOptions = useMemo(() => {
  if (userBranchIds.length > 1) options.push("ALL");
  userBranchIds.forEach(id => {
    const branch = branches.find(b => String(b._id) === id);
    if (branch) options.push(String(branch._id));
  });
  return options;
}, [userBranchIds, branches]);

// Filter assets by selected branch
const filteredAssets = useMemo(() => {
  let list = visibleAssets;
  if (appliedFilterBranch !== "ALL") {
    list = list.filter(a => {
      const branchId = a.branchId;
      // Handle string and object types
      if (typeof branchId === "string") return branchId === appliedFilterBranch;
      if (branchId?._id) return String(branchId._id) === appliedFilterBranch;
      return false;
    });
  }
  // ... then apply status, category, type filters
  return list;
}, [visibleAssets, appliedFilterBranch, ...other filters]);
```

---

## Default Selection Logic

```javascript
if (branchIds.length === 0) {
  // No branches → Default to ALL
  setAppliedFilterBranch("ALL");
} else if (branchIds.length === 1) {
  // Single branch → Default to that branch (auto-filtered)
  setAppliedFilterBranch(branchIds[0]);
} else {
  // Multiple branches → Default to "ALL" (show all user's branches)
  setAppliedFilterBranch("ALL");
}
```

---

## Filter Popup Changes

### Before:
```bash
Filters: [Category] [Type] [Status]
```

### After:
```bash
Filters: [Branch] [Category] [Type] [Status]
           ↑
         NEW!
```

---

## API Calls Made

1. `GET /auth/profile` → Get user's branchIds
2. `GET /branches` → Get all branches (then filtered to user's only)
3. `GET /assets` → Get all assets

---

## Testing Quick Check

```javascript
// Test 1: Single branch user
Login → Assets → Filters
✓ See only 1 branch option
✓ It's already selected
✓ Table shows only that branch's assets

// Test 2: Multi-branch user  
Login → Assets → Filters
✓ See "All Branches" + other branch names
✓ "All Branches" is selected
✓ Table shows assets from all user's branches

// Test 3: Apply multiple filters
Select: Branch=X, Category=FIXED, Type=CPU, Status=ACTIVE
✓ Table updates to show only matching assets

// Test 4: Reset filter
Change filters → Click Reset
✓ Filters return to previous values
```

---

## Files Changed
- ✏️ `Frontend/src/pages/Assets/asset.jsx` (Main implementation)
- ✏️ `Frontend/src/components/Filter/FilterPopup.jsx` (Support for custom option labeling)

---

## State Variables Added
```javascript
const [appliedFilterBranch, setAppliedFilterBranch] = useState("ALL");
const [pendingFilterBranch, setPendingFilterBranch] = useState("ALL");
const [userBranchIds, setUserBranchIds] = useState([]);
```

---

## Behavior Summary

| Scenario | Behavior |
|----------|----------|
| 1 branch assigned | Show that branch (only option, auto-selected) |
| 2+ branches assigned | Show "All Branches" option + individual branches (All is default) |
| All 4 filters applied | Table shows intersection (AND logic, not OR) |
| Reset clicked | Reverts pending filters to previously applied values |
| Apply clicked | Applies pending filters and closes popup |

---

## Important: Filter Logic Order
```javascript
filteredAssets = visibleAssets
  .filter(by branch)
  .filter(by status)
  .filter(by category)
  .filter(by type)
// Result: Only assets matching ALL criteria
```

---

## Notes
- No backend changes needed (uses existing endpoints)
- TypeScript errors fixed (optionRenderer added to FilterField typedef)
- Matches Dashboard branch selector behavior/naming
- Works independently of the top-level branch scope selector
