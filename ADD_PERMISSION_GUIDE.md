# Guide: How to Add New Permissions and Buttons

This guide explains step-by-step how to add a new permission (Right) to the system and use it to control the visibility of a button in the frontend.

## Step 1: Define the New Permission
First, you need to register the new permission in the constants file. This makes it appear in the **Setup > Role & Rights** page so you can assign it to roles.

**File:** `Frontend/src/constants/permissions.js`

1.  Open `permissions.js`.
2.  Locate the module where you want to add the permission (e.g., `users`).
3.  Add a new object to the `actions` array with a unique `key` and a descriptive `label`.

**Example:** Adding an "Export Users" permission.

```javascript
// Frontend/src/constants/permissions.js

export const PERMISSION_MODULES = [
  {
    key: "users", // Module Key
    label: "User Management",
    pages: [
      {
        key: "users_list", // Page Key
        label: "User List",
        actions: [
          // Existing actions...
          { key: "add", label: "Add User" },
          { key: "edit", label: "Edit User" },
          
          // ✅ ADD THIS NEW LINE:
          { key: "export", label: "Export Users" }, 
        ],
      },
    ],
  },
  // ... other modules
];
```

The system will automatically generate a permission key string in the format: `module:page:action`.
In this case: **`users:users_list:export`**.

---

## Step 2: Assign the Permission to a Role
1.  Go to your application in the browser.
2.  Navigate to **Setup > Role & Rights**.
3.  Edit a Role (e.g., "Admin" or "Manager").
4.  You will now see the **"Export Users"** checkbox under **User Management > User List**.
5.  Check the box and click **Save**.

---

## Step 3: Implement the Button in Frontend
Now, you need to add the button to your React component and hide it behind the permission check.

**File:** `Frontend/src/pages/users/UsersList/Users.jsx` (or wherever your button belongs).

1.  Import the `hasPermission` helper or use the `useAuth` hook.
2.  Wrap your button in a conditional check using the permission key `users:users_list:export`.

**Example Code:**

```jsx
// 1. Import useAuth hook
import { useAuth } from "../../../hooks/useAuth";

const Users = () => {
  // 2. Get the permission checker function
  const { hasPermission } = useAuth(); 

  return (
    <div>
      <h1>User List</h1>
      
      <div className="actions-bar">
        {/* Existing Add Button */}
        {hasPermission("users:users_list:add") && (
          <button onClick={handleAdd}>Add User</button>
        )}

        {/* ✅ ADD THIS NEW BUTTON */}
        {/* Only visible if the logged-in user has 'users:users_list:export' right */}
        {hasPermission("users:users_list:export") && (
          <button 
            className="btn-export"
            onClick={() => console.log("Exporting...")}
          >
            Export Users
          </button>
        )}
      </div>
      
      {/* ... rest of the component */}
    </div>
  );
};
```

### 💡 Key Concept: `hasPermission`
The `hasPermission` function checks if the logged-in user's role has the specific string `"users:users_list:export"` assigned to it.
- If **Yes**: The code inside the `{ && (...) }` block runs, and the button renders.
- If **No**: React skips that block, and the button remains hidden.

---

## Summary
1.  **Define**: Add `{ key: "action_name", label: "Label" }` in `permissions.js`.
2.  **Assign**: Enable it for a role in the Setup page.
3.  **Check**: Use `{hasPermission("module:page:action_name") && <Button />}` in your code.
