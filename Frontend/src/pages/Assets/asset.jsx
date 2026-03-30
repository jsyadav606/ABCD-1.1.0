/**
 * Page: Assets List
 * Description: Assets ka industry-standard dashboard view with summary cards aur filtered table.
 * Logics:
 * - Top cards show category-wise counts
 * - Tabs se category filter
 * - Table me assets list with actions
 */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./asset.css";
import Button from "../../components/Button/Button.jsx";
import Table from "../../components/Table/Table.jsx";
import Card from "../../components/Card/Card.jsx";
import FilterPopup from "../../components/Filter/FilterPopup.jsx";
import FilterDisplay from "../../components/Filter/FilterDisplay.jsx";
import { PageLoader } from "../../components/Loader/Loader.jsx";
import { ErrorNotification } from "../../components/ErrorBoundary/ErrorNotification.jsx";
import { fetchAllAssets, fetchAssetCategories } from "../../services/assetApi.js";
import { getBranchName } from "../../utils/branchUtils.js";
import { getSelectedBranch, onBranchChange } from "../../utils/scope";
import { authAPI } from "../../services/api.js";
import { fetchBranchesForDropdown } from "../../services/userApi.js";
import { getTooltipDetails, highlightText } from "../../utils/assetUtils.jsx";

const tabs = ["ALL", "FIXED", "PERIPHERAL", "CONSUMABLE", "INTANGIBLE"];

const AssetPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [assetCategories, setAssetCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(getSelectedBranch() || "");
  const [visibleAssets, setVisibleAssets] = useState([]);
  const [branches, setBranches] = useState([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilterStatus, setAppliedFilterStatus] = useState("ACTIVE");
  const [appliedFilterCategory, setAppliedFilterCategory] = useState("ALL");
  const [appliedFilterType, setAppliedFilterType] = useState("ALL");
  const [appliedFilterBranch, setAppliedFilterBranch] = useState("ALL");
  const [pendingFilterStatus, setPendingFilterStatus] = useState("ACTIVE");
  const [pendingFilterCategory, setPendingFilterCategory] = useState("ALL");
  const [pendingFilterType, setPendingFilterType] = useState("ALL");
  const [pendingFilterBranch, setPendingFilterBranch] = useState("ALL");
  const [userBranchIds, setUserBranchIds] = useState([]);
  const filterButtonRef = useRef(null);

  useEffect(() => {
    if (isFilterOpen) {
      setPendingFilterStatus(appliedFilterStatus);
      setPendingFilterCategory(appliedFilterCategory);
      setPendingFilterType(appliedFilterType);
      setPendingFilterBranch(appliedFilterBranch);
    }
  }, [isFilterOpen]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllAssets();
        // Remove duplicates based on _id
        const uniqueData = data.filter((item, index, self) => 
          self.findIndex(a => a._id === item._id) === index
        );
        setAssets(uniqueData);
        // Debug: log sample monitor rows so we can verify available fields
        try {
          console.debug('Fetched assets sample (first 5 monitors):', uniqueData.filter(a => String(a.itemType || '').toUpperCase() === 'MONITOR').slice(0,5));
        } catch {
          console.debug('Fetched assets (first 5):', uniqueData.slice(0,5));
        }
      } catch (err) {
        console.error("Failed to fetch assets", err);
        setError(err.message || "Failed to load assets");
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, []);

  // Fetch user profile to get their assigned branches
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const resp = await authAPI.getProfile();
        const userInfo = resp.data?.data?.user || {};

        const rawBranchList = Array.isArray(userInfo.branchId)
          ? userInfo.branchId
          : Array.isArray(userInfo.branchIds)
            ? userInfo.branchIds
            : [];

        const branchIds = rawBranchList.map((b) => {
          if (!b && b !== 0) return '';
          if (typeof b === 'object') {
            if (b._id) return String(b._id);
            if (b.id) return String(b.id);
            if (b.branchId) return String(b.branchId);
            return String(b.branchName || b.name || '');
          }
          return String(b);
        }).filter(Boolean);

        setUserBranchIds(branchIds);

        // Also load branches for this organization (same as dashboard logic)
        const branchesData = await fetchBranchesForDropdown(userInfo.organizationId);
        setBranches(branchesData);

        // Set default branch filter
        if (branchIds.length === 0) {
          setAppliedFilterBranch("ALL");
          setPendingFilterBranch("ALL");
        } else if (branchIds.length === 1) {
          // Single branch - default to that branch
          setAppliedFilterBranch(branchIds[0]);
          setPendingFilterBranch(branchIds[0]);
        } else {
          // Multiple branches - default to "All"
          setAppliedFilterBranch("ALL");
          setPendingFilterBranch("ALL");
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setAppliedFilterBranch("ALL");
        setPendingFilterBranch("ALL");
      }
    };
    loadUserProfile();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAssetCategories();
        setAssetCategories(data);
      } catch (err) {
        console.error("Failed to fetch asset categories", err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const off = onBranchChange((branchId) => {
      setSelectedBranch(branchId || "");
    });
    return off;
  }, []);


  useEffect(() => {
    if (!selectedBranch || selectedBranch === "__ALL__") {
      setVisibleAssets(assets);
      return;
    }
    const filtered = assets.filter((asset) => {
      const branchId = asset.branchId;
      if (!branchId) return false;
      if (typeof branchId === "string") {
        return branchId === selectedBranch;
      }
      if (typeof branchId === "object" && branchId?._id) {
        return String(branchId._id) === selectedBranch;
      }
      return false;
    });
    setVisibleAssets(filtered);
  }, [selectedBranch, assets]);

  const statusOptions = useMemo(() => {
    return ["ALL", "ACTIVE", "INACTIVE"];
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map();
    assetCategories.forEach((cat) => {
      if (cat?._id) {
        map.set(String(cat._id), cat.name || cat.code || String(cat._id));
      }
    });
    return map;
  }, [assetCategories]);

  const getCategoryName = useCallback((itemCategory) => {
    if (!itemCategory) return "";

    if (typeof itemCategory === "object") {
      if (itemCategory.name) return itemCategory.name;
      if (itemCategory._id) {
        const mapped = categoryMap.get(String(itemCategory._id));
        if (mapped) return mapped;
        return itemCategory.name || itemCategory.value || String(itemCategory._id);
      }
      if (itemCategory.value) return itemCategory.value;
      return String(itemCategory);
    }

    if (typeof itemCategory === "string") {
      const mapped = categoryMap.get(itemCategory);
      if (mapped) return mapped;
      return itemCategory;
    }

    return String(itemCategory);
  }, [categoryMap]);

  const categoryOptions = useMemo(() => {
    // Build ONLY from assetCategories fetched from backend
    const values = new Set(["ALL"]);

    assetCategories.forEach((cat) => {
      if (cat?.name) {
        values.add(String(cat.name).trim().toUpperCase());
      }
    });

    return ["ALL", ...Array.from(values).filter((v) => v !== "ALL").sort()];
  }, [assetCategories]);

  const branchOptions = useMemo(() => {
    const options = [];

    // Allow list: assigned branches from user profile, else all branches from API
    const allowedBranchIds = userBranchIds.length > 0
      ? userBranchIds
      : branches.map((b) => String(b._id || b.id || b.branchId || ''))
          .filter(Boolean);

    const assignedBranchItems = allowedBranchIds
      .map((branchId) => {
        const id = String(branchId);
        const branch = branches.find(
          (b) => String(b._id) === id || String(b.id) === id || String(b.branchId) === id
        );
        return {
          id,
          label: branch?.branchName || branch?.name || id,
        };
      })
      .filter((x, idx, arr) => x.id && arr.findIndex((item) => item.id === x.id) === idx);

    // Add "ALL" if user has multiple assigned branches
    if (assignedBranchItems.length > 1) {
      options.push("ALL");
    }

    assignedBranchItems.forEach((item) => {
      options.push(item.id);
    });

    // If still no options, fallback to ALL
    if (options.length === 0) {
      options.push("ALL");
    }

    return options;
  }, [userBranchIds, branches]);

  const getBranchDisplayName = useCallback((branchId) => {
    if (branchId === "ALL") return "All Branches";
    const branch = branches.find(
      (b) => String(b._id) === branchId || String(b.id) === branchId || String(b.branchId) === branchId
    );
    return branch ? branch.branchName || branch.name || branchId : branchId;
  }, [branches]);

  // Function to get filters that should be displayed (non-default values)
  const getActiveFilters = useCallback(() => {
    const filters = [];
    
    // Branch: show if not "ALL" (default)
    if (appliedFilterBranch !== "ALL") {
      filters.push({
        label: "Branch",
        value: getBranchDisplayName(appliedFilterBranch),
      });
    }
    
    // Category: show if not "ALL" (default)
    if (appliedFilterCategory !== "ALL") {
      filters.push({
        label: "Category",
        value: appliedFilterCategory,
      });
    }
    
    // Type: show if not "ALL" (default)
    if (appliedFilterType !== "ALL") {
      filters.push({
        label: "Type",
        value: appliedFilterType,
      });
    }
    
    // Status: show if not "ALL" (default)
    if (appliedFilterStatus !== "ALL") {
      filters.push({
        label: "Status",
        value: appliedFilterStatus,
      });
    }
    
    return filters;
  }, [appliedFilterBranch, appliedFilterCategory, appliedFilterType, appliedFilterStatus, getBranchDisplayName]);

  const typeOptions = useMemo(() => {
    const values = new Set();
    
    // Filter assets by pending category first
    let baseAssets = assets;
    if (pendingFilterCategory && pendingFilterCategory !== "ALL") {
      baseAssets = assets.filter((a) => {
        const assetCategory = String(getCategoryName(a.itemCategory) || "").trim().toUpperCase();
        return assetCategory === pendingFilterCategory.trim().toUpperCase();
      });
    }
    
    // Then get types from filtered assets
    baseAssets.forEach((a) => {
      if (a.itemType) {
        const normalized = String(a.itemType).trim().toUpperCase();
        values.add(normalized);
      }
    });
    return ["ALL", ...Array.from(values).sort()];
  }, [assets, pendingFilterCategory]);

  const activeVisibleAssets = useMemo(() => {
    return visibleAssets.filter((a) => a.isActive !== false);
  }, [visibleAssets]);

  const categoryCounts = useMemo(() => {
    const counts = { ALL: activeVisibleAssets.length };
    
    // Build counts dynamically from assetCategories
    assetCategories.forEach((cat) => {
      const categoryName = String(cat.name || "").trim().toUpperCase();
      counts[categoryName] = activeVisibleAssets.filter(a => {
        const assetCategory = String(getCategoryName(a.itemCategory) || "").trim().toUpperCase();
        return assetCategory === categoryName;
      }).length;
    });
    
    return counts;
  }, [activeVisibleAssets, assetCategories, getCategoryName]);

  const goAddItem = () => {
    navigate("/assets/add");
  };

  const capitalizeText = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredAssets = useMemo(() => {
    let list = visibleAssets;

    // Filter by Branch
    if (appliedFilterBranch !== "ALL") {
      list = list.filter((a) => {
        const branchId = a.branchId;
        if (!branchId) return false;
        if (typeof branchId === "string") {
          return branchId === appliedFilterBranch;
        }
        if (typeof branchId === "object" && branchId?._id) {
          return String(branchId._id) === appliedFilterBranch;
        }
        return false;
      });
    }

    // Filter by Status (using isActive field)
    if (appliedFilterStatus === "ALL") {
      // Show both active and inactive
      list = list; // No filter
    } else if (appliedFilterStatus === "ACTIVE") {
      // Show only active - check for true, and treat undefined as active
      list = list.filter((a) => a.isActive !== false);
    } else if (appliedFilterStatus === "INACTIVE") {
      // Show only inactive - must be explicitly false
      list = list.filter((a) => a.isActive === false);
    }

    // Filter by Category
    if (appliedFilterCategory !== "ALL") {
      list = list.filter((a) => {
        const assetCategory = String(getCategoryName(a.itemCategory) || "").trim().toUpperCase();
        return assetCategory === appliedFilterCategory.trim().toUpperCase();
      });
    }

    // Filter by Type
    if (appliedFilterType !== "ALL") {
      list = list.filter((a) => {
        const assetType = String(a.itemType || "").trim().toUpperCase();
        return assetType === appliedFilterType.trim().toUpperCase();
      });
    }

    return list;
  }, [visibleAssets, appliedFilterStatus, appliedFilterCategory, appliedFilterType, appliedFilterBranch]);

  const filterFields = [
    ...(userBranchIds.length > 1 && (!selectedBranch || selectedBranch === "__ALL__" || selectedBranch === "") ? [
      {
        key: 'branch',
        label: 'Branch',
        type: 'select',
        value: pendingFilterBranch,
        onChange: (e) => setPendingFilterBranch(e.target.value),
        options: branchOptions,
        optionRenderer: getBranchDisplayName,
      }
    ] : []),
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      value: pendingFilterCategory,
      onChange: (e) => setPendingFilterCategory(e.target.value),
      options: categoryOptions,
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      value: pendingFilterType,
      onChange: (e) => setPendingFilterType(e.target.value),
      options: typeOptions,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: pendingFilterStatus,
      onChange: (e) => setPendingFilterStatus(e.target.value),
      options: statusOptions,
    },
  ];

  const tableExtraActions = null;

  const columns = [
    { 
      header: "Item ID", 
      key: "itemId", 
      sortable: true,
      render: (row, search) => (
        <button
          onClick={() => {
            localStorage.setItem('lastItemType', row.itemType || 'cpu');
            navigate(`/assets/${row._id}`);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#0284c7',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            padding: 0,
          }}
          title={getTooltipDetails(row)}
        >
          {highlightText(row.itemId, search)}
        </button>
      )
    },
    { header: "Type", key: "itemType", sortable: true },
    {
      header: "Category",
      key: "itemCategory",
      sortable: true,
      render: (row) => getCategoryName(row.itemCategory),
    },
    { 
      header: "Branch", 
      key: "branchId", 
      sortable: true,
      render: (row) => getBranchName(row.branchId, branches)
    },
    { header: "Model", key: "model", sortable: true },
    { header: "Serial Number", key: "serialNumber", sortable: true },
    { header: "Manufacturer", key: "manufacturer", sortable: true },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="asset-actions">
          <Button variant="secondary" size="small" onClick={() => navigate(`/assets/${row._id}`)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <PageLoader />;
  if (error) return <ErrorNotification error={error} onClose={() => setError(null)} />;

  return (
    <div className="asset-page">
      <div className="asset">
      {/* <div className="asset-breadcrumbs" aria-label="Breadcrumb">
        <span className="breadcrumb-item">Home</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item active" aria-current="page">Assets</span>
      </div> */}
        <div className="asset-header">
          <h1>Assets</h1>
          <Button variant="primary" aria-label="Add Item" onClick={goAddItem}>
            Add Item
          </Button>
        </div>

      {/* Summary Cards */}
      <div className="asset-summary">
        {/* ALL Card */}
        <Card
          key="ALL"
          title="Total Assets"
          subtitle=""
          footer=""
          className="summary-card"
        >
          <div className="count">{categoryCounts["ALL"] || 0}</div>
        </Card>
        
        {/* Dynamic Category Cards from assetCategories */}
        {assetCategories.map((cat) => {
          const categoryName = String(cat.name || "").trim().toUpperCase();
          const displayName = cat.name || cat.code || "Unknown";
          return (
            <Card
              key={cat._id}
              title={displayName}
              subtitle=""
              footer=""
              className="summary-card"
            >
              <div className="count">{categoryCounts[categoryName] || 0}</div>
            </Card>
          );
        })}
      </div>

      {/* Filter button is moved into table header controls via extraActions prop */}

      <FilterPopup
        isOpen={isFilterOpen}
        anchorRef={filterButtonRef}
        fields={filterFields}
        onClose={() => setIsFilterOpen(false)}
        onReset={() => {
          // Reset pending filters to default values
          setPendingFilterStatus("ACTIVE");
          setPendingFilterCategory("ALL");
          setPendingFilterType("ALL");
          setPendingFilterBranch("ALL");
        }}
        onApply={() => {
          // Apply pending filters and close popup
          setAppliedFilterStatus(pendingFilterStatus);
          setAppliedFilterCategory(pendingFilterCategory);
          setAppliedFilterType(pendingFilterType);
          setAppliedFilterBranch(pendingFilterBranch);
          setIsFilterOpen(false);
        }}
      />

      <div className="asset-content">
        {/* Filter Display Row - Always visible */}
        <FilterDisplay filters={getActiveFilters()} />

        {/* Table always visible - handles empty state internally */}
        {filteredAssets.length === 0 ? (
          <>
            {/* Table header with search/filters button - still visible */}
            <div className="table__options">
              <div className="table__actions">
                <Button ref={filterButtonRef} variant="secondary" size="small" onClick={() => setIsFilterOpen((v) => !v)}>
                  Filters
                </Button>
              </div>
              <div className="table__summary">0 to 0 of 0</div>
            </div>
            {/* Empty state message */}
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-text">
                {appliedFilterCategory === "ALL" ? "No items. Click Add Item to create one." : `No ${capitalizeText(appliedFilterCategory)} items here.`}
              </div>
            </div>
          </>
        ) : (
          <Table
            columns={columns}
            data={filteredAssets}
            showSearch={true}
            showPagination={true}
            pageSize={20}
            onSelectionChange={() => {}}
            isRowSelectable={() => true}
            rowClassName=""
            extraActions={
              <Button ref={filterButtonRef} variant="secondary" size="small" onClick={() => setIsFilterOpen((v) => !v)}>
                Filters
              </Button>
            }
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default AssetPage;
