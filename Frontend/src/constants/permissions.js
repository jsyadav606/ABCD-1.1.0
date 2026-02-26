// Permission Constants

export const PERMISSION_MODULES = [
  {
    key: "users",
    label: "User Management",
    // New: Main permission key for module visibility
    accessKey: "users:access", 
    pages: [
      {
        key: "users_list",
        label: "User List",
        actions: [
          { key: "add", label: "Add User" },
          { key: "edit", label: "Edit User" },
          { key: "delete", label: "Delete User" },
          { key: "view", label: "View User Details" },
          { key: "disable", label: "Disable User" },
          { key: "enable", label: "Enable User" },
          { key: "change_password", label: "Change Password" },
          { key: "disable_login", label: "Disable Login" },
          { key: "enable_login", label: "Enable Login" },
          { key: "export", label: "Export Users" },
          { key: "assign_reporting", label: "Assign Reporting Manager" }, // New
          { key: "edit_role", label: "Edit User Role" }, // New
        ],
      },
      // Future pages like User Groups, etc.
    ],
  },
  {
    key: "assets",
    label: "Asset Management",
    accessKey: "assets:access",
    pages: [
      {
        key: "inventory",
        label: "Inventory",
        actions: [
          { key: "add", label: "Add Item" },
          { key: "edit", label: "Edit Item" },
          { key: "delete", label: "Delete Item" },
          { key: "view", label: "View Inventory" },
          { key: "export", label: "Export Data" },
        ],
      },
      {
        key: "accessories",
        label: "Accessories",
        actions: [
          { key: "add", label: "Add Accessory" },
          { key: "edit", label: "Edit Accessory" },
          { key: "delete", label: "Delete Accessory" },
          { key: "view", label: "View Accessories" },
        ],
      },
      {
        key: "peripherals",
        label: "Peripherals",
        actions: [
          { key: "add", label: "Add Peripheral" },
          { key: "edit", label: "Edit Peripheral" },
          { key: "delete", label: "Delete Peripheral" },
          { key: "view", label: "View Peripherals" },
        ],
      },
    ],
  },
  {
    key: "upgrades",
    label: "Upgrade Module",
    accessKey: "upgrades:access",
    pages: [
      {
        key: "requests",
        label: "Upgrade Requests",
        actions: [
          { key: "create", label: "Create Request" },
          { key: "approve", label: "Approve Request" },
          { key: "reject", label: "Reject Request" },
          { key: "view", label: "View Requests" },
        ],
      },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    accessKey: "reports:access",
    pages: [
      {
        key: "audit_logs",
        label: "Audit Logs",
        actions: [
          { key: "view", label: "View Logs" },
          { key: "export", label: "Export Logs" },
        ],
      },
    ],
  },
];

// Helper to get all permission keys
export const getAllPermissionKeys = () => {
  const keys = [];
  PERMISSION_MODULES.forEach((module) => {
    // Add module access key
    if (module.accessKey) keys.push(module.accessKey);
    
    module.pages.forEach((page) => {
      page.actions.forEach((action) => {
        keys.push(`${module.key}:${page.key}:${action.key}`);
      });
    });
  });
  return keys;
};
