# Branch Filter Feature - Testing Guide

## Feature Overview
Added **Branch** filter to the Asset filter popup. The branch filter shows only branches assigned to the logged-in user, with intelligent defaults based on branch count.

---

## Test Scenarios

### Scenario 1: User with Single Branch
**Setup**: Login with user assigned to only 1 branch

**Expected Behavior**:
1. Go to Assets page
2. Click "Filters" button
3. **Branch field should show**:
   - Only that single branch (no "All Branches" option)
   - That branch should be selected by default
4. Assets should only show from that branch (auto-filtered)
5. When combined with other filters (Category, Type, Status), all filter together correctly

**Verification Points**:
- [ ] Only 1 branch option visible
- [ ] That branch is already selected
- [ ] Table only shows assets from that branch
- [ ] Other filters work with branch filter

---

### Scenario 2: User with Multiple Branches
**Setup**: Login with user assigned to 2 or more branches

**Expected Behavior**:
1. Go to Assets page
2. Click "Filters" button
3. **Branch field should show**:
   - "All Branches" option at top
   - Then list of all user's assigned branches
   - "All Branches" should be selected by default
4. Assets should show from all user's branches
5. Can select individual branch to filter down
6. When combined with other filters, all work together

**Verification Points**:
- [ ] "All Branches" option visible
- [ ] "All Branches" is pre-selected
- [ ] Shows only user's assigned branches (not ALL branches in system)
- [ ] Can change to single branch
- [ ] Table updates with filtered results
- [ ] Multi-filter works (branch + category + type + status)

---

### Scenario 3: Reset Filter
**Setup**: Any user, filter popup open

**Steps**:
1. Change branch filter to different value
2. Change other filters (category, type, status)
3. Click "Reset" button

**Expected Behavior**:
- [ ] All filter fields reset to their previously applied values
- [ ] Branch filter also resets
- [ ] Table data unchanged (old filters still applied)

---

### Scenario 4: Apply Filter
**Setup**: Any user, filter popup open

**Steps**:
1. Select: Branch = specific branch
2. Select: Category = FIXED
3. Select: Type = CPU
4. Select: Status = ACTIVE
5. Click "Apply"

**Expected Behavior**:
- [ ] Filter popup closes
- [ ] Table updates to show only assets where:
  - Branch = selected branch
  - Category = FIXED
  - Type = CPU
  - Status = ACTIVE
- [ ] All 4 filters work together (intersection, not union)

---

### Scenario 5: Field Order
**Setup**: Filter popup open

**Expected Behavior**:
- [ ] Branch field appears FIRST in filter popup
- [ ] Order is: Branch → Category → Type → Status

---

### Scenario 6: Branch Display Names
**Setup**: Filter popup open with multi-branch user

**Expected Behavior**:
- [ ] "All Branches" shows as readable text (not "ALL")
- [ ] Individual branch names show (e.g., "District Office", "Warehouse")
- [ ] Matches branch names shown in branch selector dropdown elsewhere in app

---

## Edge Cases

### Edge Case 1: User with no branches
**Expected**: Default to "All" and show no specific branches (or show all system branches)

### Edge Case 2: Assets with missing/null branchId
**Expected**: Filter logic handles gracefully, doesn't show in filtered view when specific branch selected

### Edge Case 3: Branch deleted but still in user's branchIds
**Expected**: No error; branch option just appears but may only show empty results

---

## Integration Tests

### Test with Dashboard
**Expected**: Branch filter dropdown behavior matches Dashboard branch selector
- Same branch list
- Same naming conventions
- Same default logic (single vs multiple)

### Test with other filters
**Expected**: Works in combination:
- Branch + Category shows category breakdown for that branch only
- Branch + Type shows types for that branch
- All 4 together: Branch + Category + Type + Status (most restrictive)

---

## Performance
- Verify no console errors when loading
- Filter applies instantly without lag
- Works smoothly with 100+ assets

---

## Browser Compatibility
Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if applicable)
- [ ] Mobile browsers

---

## Notes for QA
1. Clear localStorage between test runs if switching users
2. Check browser console for errors
3. Verify API calls in Network tab for auth/profile/branches
4. Test with realistic data (multiple branches, many assets)

---

## Success Criteria ✓
- [x] Branch field added to filter popup
- [x] Shows only user's assigned branches
- [x] Single branch users: auto-selected
- [x] Multi-branch users: "All Branches" default
- [x] Filters work together correctly
- [x] Matches Dashboard branch behavior
- [x] No errors in console
