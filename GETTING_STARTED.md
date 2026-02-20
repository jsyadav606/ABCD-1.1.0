# Getting Started - Add New User Feature

## 🚀 First Time Setup

### Prerequisites
- Node.js and MongoDB running
- Backend server running
- Frontend server running

### Step 1: Start Your Servers

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
# or
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### Step 2: Access the Application
```
Open browser: http://localhost:5173
```

---

## 📖 Using the Add New User Feature

### Method 1: Click "Add New User" Button
1. Go to **Users** page (left sidebar)
2. Click **"+ Add New User"** button (top right)
3. Form page loads automatically

### Method 2: Direct URL
```
http://localhost:5173/users/add
```

---

## 📝 Filling the Form

### Required Fields (must fill to submit)
```
1. User ID *
   Example: john123, emp_001, user_john
   
2. Full Name *
   Example: John Doe, Jane Smith
   
3. Role * (Dropdown)
   - Click dropdown
   - Select from available roles
   - Example: Admin, Manager, User
   
4. Branches * (Multi-Select)
   - Click to open dropdown
   - Hold Ctrl/Cmd and click to select multiple
   - Example: Branch1, Branch2, Branch3
```

### Optional Fields (can leave blank)
```
1. Email
   Format: user@example.com
   Auto-validated if provided
   
2. Phone Number
   Format: 10 digits only (e.g., 9876543210)
   Auto-validated if provided
   
3. Designation
   Example: Manager, Executive, Supervisor
   
4. Department
   Example: Sales, IT, HR, Finance
   
5. Enable Login (Checkbox)
   - Unchecked by default
   - Check if user should login immediately
   - Otherwise, enable login later from Users page
   
6. Remarks
   Example: Contract employee, Probation period ends 2025-03-15
```

---

## ✅ Form Validation Examples

### Valid Submission
```
✅ User ID: user_john123
✅ Name: John Smith Doe
✅ Role: Admin (selected)
✅ Branch: Main Branch (selected)
✅ Email: john@company.com (optional, valid format)
✅ Phone: 9876543210 (optional, 10 digits)
↓
All good! Click "Create User"
```

### Invalid Submission (Error Examples)
```
❌ User ID: [EMPTY]
   Error: "User ID is required"
   
❌ Role: [NOTHING SELECTED]
   Error: "Role is required"
   
❌ Branches: [NOTHING SELECTED]
   Error: "At least one branch must be selected"
   
❌ Email: john@company (INVALID FORMAT)
   Error: "Please enter a valid email address"
   
❌ Phone: 9876 (NOT 10 DIGITS)
   Error: "Phone number must be 10 digits"
```

---

## 🎬 Complete Walkthrough

### Scenario: Creating a New User

```
Step 1: Navigate
└─ Users page → Click "Add New User" button

Step 2: See Beautiful Form
└─ Purple gradient header: "Add New User"
   "Create a new user account with role and branch assignments"

Step 3: Fill Basic Information
   ┌─────────────────────────────────────────────┐
   │ BASIC INFORMATION                           │
   ├─────────────────────────────────────────────┤
   │ User ID: emp_john001                        │
   │ Full Name: John David Smith                 │
   │ Email: john.smith@company.com               │
   │ Phone Number: 9876543210                    │
   │ Designation: Senior Manager                 │
   │ Department: Sales & Operations              │
   └─────────────────────────────────────────────┘

Step 4: Select Role & Branches
   ┌─────────────────────────────────────────────┐
   │ ROLE & BRANCH ASSIGNMENT                    │
   ├─────────────────────────────────────────────┤
   │ Role: Admin (administrative_user)           │
   │                                              │
   │ Branches: [Multi-Select - Ctrl+Click]       │
   │   ☑ New York (NYC)                         │
   │   ☑ Los Angeles (LAX)                      │
   │   ☐ Chicago (CHI)                          │
   └─────────────────────────────────────────────┘

Step 5: Set Access Level
   ┌─────────────────────────────────────────────┐
   │ ACCESS & PERMISSIONS                        │
   ├─────────────────────────────────────────────┤
   │ ☐ Enable Login (canLogin)                   │
   │   ✗ User cannot login yet (default)         │
   │   (Can be enabled later from Users page)    │
   └─────────────────────────────────────────────┘

Step 6: Add Remarks
   ┌─────────────────────────────────────────────┐
   │ ADDITIONAL INFORMATION                      │
   ├─────────────────────────────────────────────┤
   │ Remarks:                                    │
   │                                              │
   │ New hire starting 2025-02-20                │
   │ Will report to Sarah Johnson                │
   │ Probation period: 3 months                  │
   └─────────────────────────────────────────────┘

Step 7: Submit
   ┌─────────────────────────────────────────────┐
   │ [Cancel]         [Create User]              │
   └─────────────────────────────────────────────┘
   └─ Click "Create User" button

Step 8: Success!
   ✅ "User created successfully! Redirecting..."
   └─ After 2 seconds, automatically goes to Users page

Step 9: Verify
   └─ Users page loads
      └─ Search for "emp_john001" in table
      └─ You see your new user! 🎉
```

---

## 🔍 Understanding What Gets Saved

When you create a user, here's what gets saved to the database:

```
MongoDB User Collection
{
  "_id": ObjectId("..."),
  "userId": "emp_john001",                    ← Your input
  "name": "John David Smith",                 ← Your input
  "email": "john.smith@company.com",          ← Your input (or null)
  "phone_no": 9876543210,                     ← Your input converted to number
  "designation": "Senior Manager",             ← Your input
  "department": "Sales & Operations",          ← Your input
  "role": "admin",                             ← Role name (from your selection)
  "roleId": ObjectId("60d5..."),              ← Role ID (auto-filled from dropdown)
  "branchId": [
    ObjectId("60d5..."),                       ← Branch IDs (from multi-select)
    ObjectId("60d6...")
  ],
  "canLogin": false,                           ← Your checkbox (default: false)
  "organizationId": ObjectId("60d4..."),      ← From logged-in user context
  "isActive": true,                            ← Default
  "isBlocked": false,                          ← Default
  "createdBy": ObjectId("60d3..."),           ← From logged-in user context
  "createdAt": Date("2025-02-19T..."),
  "updatedAt": Date("2025-02-19T...")
}
```

---

## troubleshooting

### Problem: Roles dropdown is empty

**Causes & Solutions:**
```
1. No roles in database
   └─ Go to Backend: run role seed
   └─ npm run seed:roles

2. API endpoint not working
   └─ Check backend is running
   └─ Open browser console: F12
   └─ Check Network tab for /users/dropdown/roles call

3. Wrong organization ID
   └─ Check you're logged in
   └─ Verify organizationId is set in auth context
```

### Problem: Branches dropdown is empty

**Causes & Solutions:**
```
1. No branches in database
   └─ Go to Backend: run branch seed
   └─ npm run seed:branches

2. Organization has no branches
   └─ Create branches first via admin panel
   └─ Associate branches with your organization

3. API not called with correct orgId
   └─ Check browser console
   └─ Verify organizationId is being passed
```

### Problem: Form validation errors keep appearing

**Solutions:**
```
1. Email format error
   └─ Use format: user@example.com
   └─ Include @ and domain

2. Phone format error
   └─ Use exactly 10 digits
   └─ No special characters
   └─ Examples: 9876543210 (✓) vs 987-654-3210 (✗)

3. Required fields
   └─ Ensure User ID is filled
   └─ Ensure Name is filled
   └─ Ensure Role is selected from dropdown
   └─ Ensure at least 1 branch is selected
```

### Problem: Form won't submit / button stays disabled

**Causes:**
```
1. Form has validation errors
   └─ Check for red error messages
   └─ Fix errors before submitting

2. Network is slow
   └─ Wait for loading to complete
   └─ Check browser console for errors

3. Backend not responding
   └─ Check if backend server is running
   └─ Check if /users endpoint is accessible
   └─ Try curl: curl http://localhost:3000/users
```

---

## 💡 Pro Tips

### Tip 1: Multi-Select Branches
```
On Windows/Linux:
  Hold Ctrl + Click multiple branches

On Mac:
  Hold Cmd + Click multiple branches

Also works:
  Click first branch
  Hold Shift
  Click last branch (selects range)
```

### Tip 2: Reusable User Template
```
If creating similar users:
1. Fill the form completely first time
2. Note down the values
3. Create second user using similar values
4. Only change User ID and Name
5. Rest can be same (copy-paste in notes)
```

### Tip 3: Enabling Login Later
```
If you create user with canLogin OFF:
1. Go to Users page
2. Find the user in table
3. Click action menu (⋯)
4. Enable "Allow Login"
5. User can now login

This is safer - create first, enable later!
```

### Tip 4: Fixing Mistakes
```
If you made a mistake during creation:
1. User is created as-is
2. Go to Users page
3. Find and click the user
4. Use edit feature to fix
(Note: Edit feature should be in Users page)
```

---

## 🎯 Common Use Cases

### Use Case 1: Onboarding New Employee
```
1. Get employee list from HR
2. For each employee:
   - Open Add User form
   - Enter: userId, name, email, phone
   - Select: role (e.g., "user"), branches
   - Leave canLogin OFF
3. HR/Admin later enables login + sends credentials
```

### Use Case 2: Creating Admin User
```
1. Fill: userId, name, email, phone
2. Select: role = "admin"
3. Select: all branches (or specific ones)
4. Check: Enable Login ✓
5. Submit
6. System auto-creates login credentials
```

### Use Case 3: Contractor/Temporary User
```
1. Fill all fields normally
2. In Remarks: "Contract until 2025-05-31"
3. Select: limited branches (only their workspace)
4. Leave canLogin OFF
5. Submit
6. Enable login when work starts
7. Disable when contract ends
```

---

## 📞 Finding Help

### If something doesn't work:

1. **Check the Documentation:**
   - `ADD_NEW_USER_FEATURE_GUIDE.md` - Comprehensive guide
   - `QUICK_REFERENCE.md` - Quick lookup
   - `TECHNICAL_ARCHITECTURE.md` - How it works internally

2. **Check Browser Console:**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for red error messages
   - Can help identify the issue

3. **Check Backend Logs:**
   - Look at terminal where backend runs
   - Check for error messages
   - May show database or validation issues

4. **Verify Data Exists:**
   - Roles: Are they in database?
   - Branches: Do they exist for your organization?
   - Organization: Are you logged in correctly?

---

## ✨ Next Steps

### After Creating Users:
1. ✅ Go to Users page
2. ✅ See your new user in the table
3. ✅ Enable login for specific users
4. ✅ Assign additional roles/branches if needed
5. ✅ Disable users who leave
6. ✅ Keep user database organized

### Future Enhancements:
- [ ] Department dropdown (from role)
- [ ] Branch filtering by logged-in user's branches
- [ ] Bulk user import from CSV
- [ ] User templates for quick creation
- [ ] Email notifications on user creation

---

## 🎉 You're All Set!

You now have a complete, production-ready Add New User feature!

**What you can do:**
- ✅ Create new users with complete information
- ✅ Assign roles from database
- ✅ Assign multiple branches to users
- ✅ Control login access (enable/disable)
- ✅ Add remarks and notes
- ✅ See validation in real-time
- ✅ Get success/error feedback
- ✅ Auto-redirect after creation

**Start creating users now!** 🚀

---

**Last Updated**: February 19, 2026
**Status**: ✅ Ready to Use
**Need Help**: Check the 4 guide documents in the project root
