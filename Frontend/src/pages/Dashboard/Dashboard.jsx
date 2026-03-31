/**
 * Page: Dashboard
 * Description: Organization ki high-level summary dikhata hai (users count, quick actions, alerts).
 * Major Logics:
 * - User profile fetch + branches dropdown (scope ke hisaab se)
 * - "All branches" option manage + users count compute
 * - Auto sync timer + manual "Sync Now"
 */
import React, { useEffect, useState, useRef } from "react";
import { Button, Card, Badge, Table, Select } from "../../components";
import { authAPI } from "../../services/api";
import { fetchBranchesForDropdown, fetchUsersCount, fetchAllUsers } from "../../services/userApi";
import { fetchAssetsCount } from "../../services/assetApi";
import { getSelectedBranch, setSelectedBranch } from "../../utils/scope";
import { useAuth } from "../../hooks/useAuth";
import "./Dashboard.css";

const Dashboard = () => {
  const statsRef = useRef(null);
  const { user } = useAuth();

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const wheelTimeoutRef = useRef(null);
  const [isMarqueeEnabled, setIsMarqueeEnabled] = useState(false);

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
  const [totalAssets, setTotalAssets] = useState(null);

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

  async function computeAssetsCount(selected) {
    try {
      const count = await fetchAssetsCount(selected);
      setTotalAssets(count);
    } catch (error) {
      console.error("Error fetching assets count:", error);
      setTotalAssets(null);
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

        const branches = await fetchBranchesForDropdown(userInfo.organizationId);
        if (!isMounted) return;

        const allOpts = branches.map(b => ({ value: String(b._id), label: b.name }));

        // Filter branches based on user's assigned branches
        let availableOpts = allOpts;
        if (userInfo.branchIds.length > 0) {
          availableOpts = allOpts.filter(o => userInfo.branchIds.includes(o.value));
        }

        setBranchOptions(availableOpts);

        const saved = getSelectedBranch();
        let selectedValue = "";

        if (saved && (saved === "__ALL__" || availableOpts.some(o => o.value === saved))) {
          selectedValue = saved;
        } else {
          selectedValue = availableOpts.length > 1 ? "__ALL__" : (availableOpts[0]?.value || "");
        }

        setBranch(selectedValue);

        // Set the selected branch with name
        const selectedOpt = availableOpts.find(o => o.value === selectedValue);
        setSelectedBranch(selectedValue, selectedOpt?.label || "");

        await computeUsersCount(selectedValue);
        await computeAssetsCount(selectedValue);
      } catch {}
    };

    init();
    return () => { isMounted = false; };
  }, []);

  const applyFilters = async () => {
    try {
      if (branch) {
        const selectedOpt = branchOptions.find(o => o.value === branch);
        setSelectedBranch(branch, selectedOpt?.label || "");
      }
      await computeUsersCount(branch);
      await computeAssetsCount(branch);
    } catch {
      setTotalUsers(null);
      setTotalAssets(null);
    }
  };

  // Check if marquee should be enabled based on overflow
  useEffect(() => {
    const checkOverflow = () => {
      const el = statsRef.current;
      if (el) {
        // Force reflow to ensure accurate measurements
        el.offsetHeight;
        const grid = el.querySelector('.stats-grid');
        if (grid) {
          const containerWidth = el.clientWidth;
          const contentWidth = grid.scrollWidth;
          const hasOverflow = contentWidth > containerWidth;
         
          setIsMarqueeEnabled(hasOverflow);
          if (!hasOverflow) {
            setIsAutoScrolling(false);
            el.scrollLeft = 0; // Reset scroll position
          } else {
            setIsAutoScrolling(true);
          }
        }
      }
    };

    const handleResize = () => {
      checkOverflow();
    };

    // Check multiple times to ensure DOM is fully rendered
    const timeout1 = setTimeout(checkOverflow, 100);
    const timeout2 = setTimeout(checkOverflow, 500);
    const timeout3 = setTimeout(checkOverflow, 1000);

    // Listen for window resize
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      window.removeEventListener('resize', handleResize);
    };
  }, [totalUsers, totalAssets]);

  // Auto-scroll loop (for continuous marquee effect)
  useEffect(() => {
    const el = statsRef.current;
    if (!el || !isAutoScrolling || isDown || !isMarqueeEnabled) return;

    const interval = setInterval(() => {
      const third = el.scrollWidth / 3;
      let next = el.scrollLeft + 1.3;
      if (next >= third) next -= third;
      el.scrollLeft = next;
    }, 16);

    return () => clearInterval(interval);
  }, [isAutoScrolling, isDown, isMarqueeEnabled]);

  const resetAutoScrollDelay = () => {
    setIsAutoScrolling(false);
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => setIsAutoScrolling(true), 1500);
  };

  // [ARROW] Drag Scroll Logic
  const handleMouseDown = (e) => {
    if (!isMarqueeEnabled) return;
    setIsDown(true);
    setIsAutoScrolling(false);
    setStartX(e.pageX - statsRef.current.offsetLeft);
    setScrollLeft(statsRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    if (!isMarqueeEnabled) return;
    setIsDown(false);
    setIsAutoScrolling(true);
  };
  const handleMouseUp = () => {
    if (!isMarqueeEnabled) return;
    setIsDown(false);
    setIsAutoScrolling(true);
  };

  const handleMouseMove = (e) => {
    if (!isDown || !isMarqueeEnabled) return;
    e.preventDefault();
    const x = e.pageX - statsRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    statsRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e) => {
    if (!isMarqueeEnabled) return;
    e.preventDefault();
    setIsAutoScrolling(false);
    resetAutoScrollDelay();
    statsRef.current.scrollLeft += e.deltaY; // touchpad/wheel control
    const third = statsRef.current.scrollWidth / 3;
    if (statsRef.current.scrollLeft >= third) {
      statsRef.current.scrollLeft -= third;
    } else if (statsRef.current.scrollLeft < 0) {
      statsRef.current.scrollLeft += third;
    }
  };

  const alertsColumns = [
    { header: "Asset Name", key: "assetName", sortable: true },
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

  const statsTiles = [
    { title: "Total Users", value: totalUsers ?? "--" },
    { title: "Total Asset", value: totalAssets ?? "--" },
    { title: "Computers", value: 110 },
    { title: "Faulty Items", value: 6, danger: true },
    // { title: "Total Desktop", value: 110 }, 
    // { title: "Total CPU", value: 110 },
    // { title: "Total Monitor", value: 110 },
    // { title: "Total Printers", value: 20 },
    // { title: "Total Servers", value: 6 },
    // { title: "Total Laptops", value: 10 },
    // { title: "Total Keyboard", value: 200 },
    // { title: "Total Faulty", value: 70, danger: true },
  ];
  const animatedTiles = isMarqueeEnabled ? [...statsTiles, ...statsTiles, ...statsTiles] : statsTiles;

  const alertsData = [
    {
      _id: "1",
      assetName: "Dell OptiPlex 3080",
      category: "Desktop",
      issue: "Warranty Expiring Soon",
      issueVariant: "warning",
      reportedOn: "15-Oct-2025",
      status: "In Process",
      statusVariant: "info",
    },
    {
      _id: "2",
      assetName: "Cisco Switch 2960",
      category: "Networking",
      issue: "Device Down",
      issueVariant: "danger",
      reportedOn: "18-Oct-2025",
      status: "Critical",
      statusVariant: "danger",
    },
    {
      _id: "3",
      assetName: "HP EliteBook 850",
      category: "Laptop",
      issue: "Battery Health Moderate",
      issueVariant: "secondary",
      reportedOn: "17-Oct-2025",
      status: "Resolved",
      statusVariant: "success",
    },
    {
      _id: "4",
      assetName: "Projector EPSON X500",
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

      <div
        className="stats-wrapper"
        ref={statsRef}
        onMouseDown={isMarqueeEnabled ? handleMouseDown : undefined}
        onMouseUp={isMarqueeEnabled ? handleMouseUp : undefined}
        onMouseLeave={isMarqueeEnabled ? handleMouseLeave : undefined}
        onMouseMove={isMarqueeEnabled ? handleMouseMove : undefined}
        onWheel={isMarqueeEnabled ? handleWheel : undefined}
        onMouseEnter={isMarqueeEnabled ? () => setIsAutoScrolling(false) : undefined}
      >
        <div className="stats-grid">
          {animatedTiles.map((stat, idx) => (
            <div key={`${stat.title}-${idx}`} className="stat-tile">
              <div className="stat-title">{stat.title}</div>
              <div className={`stat-value ${stat.danger ? "danger" : ""}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <Card className="profile-card" title="">
        <div className="profile-row">
          <div className="user-meta">
            <div className="avatar">
              {profile?.name ? profile.name.split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase() : "U"}
            </div>
            <div>
              <div className="user-name">{profile?.name || "--"}</div>
              <div className="user-role">
                {profile?.role ? profile.role.replaceAll("_"," ").toUpperCase() : "N/A"}
                <span className="user-id"> | ID: {profile?.userId || "--"}</span>
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
        </div>
      </Card>

      <div className="quick-actions">
        <Button variant="primary" redirect="/assets/add">
          Add Item
        </Button>
        <Button variant="secondary">View Reports</Button>
        <Button variant="outline-primary">Export CSV</Button>
      </div>

      <div className="mini-grid">
        <Card title="Recently Added Items">
          <ul className="list">
            <li><span>HP Laptop</span><Badge variant="success">Available</Badge></li>
            <li><span>Dell Monitor</span><Badge variant="info">Assigned</Badge></li>
            <li><span>Cisco Switch</span><Badge variant="danger">Faulty</Badge></li>
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
          onSelectionChange={() => {}}
          isRowSelectable={() => false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;