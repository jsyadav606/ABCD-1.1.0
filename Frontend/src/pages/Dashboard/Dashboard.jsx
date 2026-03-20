/**
 * Page: Dashboard
 * Description: Organization ki high-level summary dikhata hai (users count, quick actions, alerts).
 * Major Logics:
 * - User profile fetch + branches dropdown (scope ke hisaab se)
 * - "All branches" option manage + users count compute
 * - Auto sync timer + manual "Sync Now"
 */
import React, { useEffect, useState } from "react";
import { Button, Card, Badge, Table, Select } from "../../components";
import { authAPI } from "../../services/api";
import { fetchBranchesForDropdown, fetchUsersCount, fetchAllUsers } from "../../services/userApi";
import { getSelectedBranch, setSelectedBranch } from "../../utils/scope";
import "./Dashboard.css";

const Dashboard = () => {
  const [branch, setBranch] = useState("");
  const [syncIn, setSyncIn] = useState(59);
  const [lastSync, setLastSync] = useState(new Date());
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    userId: "",
    organizationId: null,
    branchIds: [],
  });
  const [branchOptions, setBranchOptions] = useState([]);
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalFixedAssets, setTotalFixedAssets] = useState(null);

  // Compute users count based on selected branch (all or single)
  async function computeUsersCount(selected) {
    try {
      if (selected === "__ALL__" || !selected) {
        const count = await fetchUsersCount();
        setTotalUsers(count);
        return;
      }
      const all = await fetchAllUsers(Number(import.meta.env.VITE_API_TABLE_SIZE) || 100000, 1);
      const count = all.filter((u) => {
        const ids = Array.isArray(u.branchId) ? u.branchId : [];
        return ids.some((b) => {
          const id = typeof b === "object" && b?._id ? String(b._id) : String(b);
          return id === selected;
        });
      }).length;
      setTotalUsers(count);
    } catch {
      setTotalUsers(null);
    }
  }

  async function computeFixedAssetsCount() {
    try {
      // For simplicity, using users count API as a placeholder. Replace with actual fixed assets count API.
      const count = await fetchUsersCount(); // Replace with actual fixed assets count API
      setTotalFixedAssets(count);
    } catch {
      setTotalFixedAssets(null);
    }
  }


  useEffect(() => {
    const t = setInterval(() => {
      setSyncIn((s) => (s > 0 ? s - 1 : 60));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const resp = await authAPI.getProfile();
        const data = resp.data?.data || {};
        const u = data.user || {};
        if (!isMounted) return;
        const userInfo = {
          name: u.name || "",
          email: u.email || "",
          role: u.role || "",
          userId: u.userId || "",
          organizationId: u.organizationId || null,
          branchIds: Array.isArray(u.branchId) ? u.branchId.map(b => String(b)) : [],
        };
        setProfile(userInfo);
        if (userInfo.organizationId) {
          const branches = await fetchBranchesForDropdown(userInfo.organizationId);
          if (!isMounted) return;
          const opts = branches.map(b => ({ value: String(b._id), label: b.name }));
          setBranchOptions(opts);
          const saved = getSelectedBranch();
          let selectedValue = "";
          if (saved && (saved === "__ALL__" || opts.some(o => o.value === saved))) {
            selectedValue = saved;
          } else {
            selectedValue = opts.length > 1 ? "__ALL__" : (opts[0]?.value || "");
          }
          setBranch(selectedValue);
          await computeUsersCount(selectedValue);
        }
      } catch {
        // Silent fail for dashboard
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  

  const applyFilters = async () => {
    try {
      if (branch) setSelectedBranch(branch);
      // If All branches selected, use server-side total (already scoped by visibility on backend)
      await computeUsersCount(branch);
    } catch {
      setTotalUsers(null);
    }
  };

  const handleSyncNow = async () => {
    try {
      await applyFilters();
      setLastSync(new Date());
      setSyncIn(60);
    } catch {
      setLastSync(new Date());
    }
  };

  const alertsColumns = [
    { header: "Item Name", key: "itemName", sortable: true },
    { header: "Category", key: "category", sortable: true },
    {
      header: "Issue",
      key: "issue",
      render: (row) => <Badge variant={row.issueVariant}>{row.issue}</Badge>,
    },
    { header: "Reported On", key: "reportedOn", sortable: true },
    {
      header: "Status",
      key: "status",
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>,
    },
  ];

  const alertsData = [
    {
      _id: "1",
      itemName: "Dell OptiPlex 3080",
      category: "Desktop",
      issue: "Warranty Expiring Soon",
      issueVariant: "warning",
      reportedOn: "15-Oct-2025",
      status: "In Process",
      statusVariant: "info",
    },
    {
      _id: "2",
      itemName: "Cisco Switch 2960",
      category: "Networking",
      issue: "Device Down",
      issueVariant: "danger",
      reportedOn: "18-Oct-2025",
      status: "Critical",
      statusVariant: "danger",
    },
    {
      _id: "3",
      itemName: "HP EliteBook 850",
      category: "Laptop",
      issue: "Battery Health Moderate",
      issueVariant: "secondary",
      reportedOn: "17-Oct-2025",
      status: "Resolved",
      statusVariant: "success",
    },
    {
      _id: "4",
      itemName: "Projector EPSON X500",
      category: "Peripheral",
      issue: "Lamp Replacement Due",
      issueVariant: "warning",
      reportedOn: "14-Oct-2025",
      status: "Pending",
      statusVariant: "warning",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h1>IT Asset Overview</h1>
        <p>School-wide visibility of assets, issues, and maintenance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-tile">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{totalUsers ?? "—"}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-title">Total Fixed Asset</div>
          <div className="stat-value">{totalFixedAssets ?? "—"}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-title">Computers</div>
          <div className="stat-value">110</div>
        </div>
        <div className="stat-tile">
          <div className="stat-title">Faulty Items</div>
          <div className="stat-value danger">6</div>
        </div>
      </div>

      <Card className="profile-card" title="">
        <div className="profile-row">
          <div className="user-meta">
            <div className="avatar">
              {profile?.name ? (profile.name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase()) : "U"}
            </div>
            <div>
              <div className="user-name">{profile?.name || "--"}</div>
              <div className="user-role">
                {profile?.role ? profile.role.replaceAll("_"," ").toUpperCase() : "—"}
                <span className="user-id"> • ID: {profile?.userId || "--"}</span>
              </div>
              <div className="user-email">{profile?.email || "--"}</div>
            </div>
          </div>

          <div className="filters">
            <div className="filter">
              <label className="filter-label">Branch</label>
              <Select
                name="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                options={
                  branchOptions.length > 1
                    ? [{ value: "__ALL__", label: "All Branches" }, ...branchOptions]
                    : branchOptions
                }
                disabled={branchOptions.length === 1}
                placeholder=""
              />
            </div>
            <div className="filter-btn">
              <Button variant="primary" size="md" onClick={applyFilters}>Apply</Button>
            </div>
          </div>

          <div className="sync-box">
            <div className="sync-times">
              <div className="next-sync">Next Auto Sync in: <strong>{syncIn}s</strong></div>
              <div className="last-sync">Last Synced: {new Date(lastSync).toLocaleString()}</div>
            </div>
            <Button variant="success" size="md" onClick={handleSyncNow}>Sync Now</Button>
          </div>
        </div>
      </Card>

      <div className="quick-actions">
        <Button variant="primary">Add Item</Button>
        <Button variant="secondary">View Reports</Button>
        <Button variant="outline-primary">Export CSV</Button>
      </div>

      <div className="mini-grid">
        <Card title="Recently Added Items">
          <ul className="list">
            <li>
              <span>HP Laptop</span>
              <Badge variant="success">Available</Badge>
            </li>
            <li>
              <span>Dell Monitor</span>
              <Badge variant="info">Assigned</Badge>
            </li>
            <li>
              <span>Cisco Switch</span>
              <Badge variant="danger">Faulty</Badge>
            </li>
          </ul>
          <div className="card-link">View All</div>
        </Card>

        <Card title="Vendor Summary">
          <ul className="list">
            <li><span>HP India</span><strong>42 Items</strong></li>
            <li><span>Lenovo</span><strong>31 Items</strong></li>
            <li><span>Cisco</span><strong>15 Devices</strong></li>
          </ul>
          <div className="card-link">Manage Vendors</div>
        </Card>

        <Card title="Maintenance Schedule">
          <ul className="list">
            <li><span>Printer Room</span><strong>20 Oct</strong></li>
            <li><span>Server Rack</span><strong>25 Oct</strong></li>
            <li><span>Lab 2 PCs</span><strong>28 Oct</strong></li>
          </ul>
          <div className="card-link">View Calendar</div>
        </Card>

        <Card title="Asset Status Overview">
          <ul className="list">
            <li><span>In Stock</span><strong>84</strong></li>
            <li><span>Assigned</span><strong>136</strong></li>
            <li><span>In Repair</span><strong>14</strong></li>
            <li><span>Retired</span><strong>6</strong></li>
          </ul>
        </Card>
      </div>

      <div className="section-title">Alerts & Warnings</div>
      <Card>
        <Table
          columns={alertsColumns}
          data={alertsData}
          pageSize={5}
          showPagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
