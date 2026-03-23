/**
 * Page: Assets List
 * Description: Assets ka industry-standard dashboard view with summary cards aur filtered table.
 * Logics:
 * - Top cards show category-wise counts
 * - Tabs se category filter
 * - Table me assets list with actions
 */
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./asset.css";
import Button from "../../components/Button/Button.jsx";
import Table from "../../components/Table/Table.jsx";
import Card from "../../components/Card/Card.jsx";
import { PageLoader } from "../../components/Loader/Loader.jsx";
import { ErrorNotification } from "../../components/ErrorBoundary/ErrorNotification.jsx";
import { fetchAllAssets } from "../../services/assetApi.js";
import { fetchAllBranches } from "../../services/branchApi.js";
import { getBranchName } from "../../utils/branchUtils.js";
import { getSelectedBranch, onBranchChange } from "../../utils/scope";

const tabs = ["ALL", "FIXED", "PERIPHERAL", "CONSUMABLE", "INTANGIBLE"];

const AssetPage = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("ALL");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(getSelectedBranch() || "");
  const [visibleAssets, setVisibleAssets] = useState([]);
  const [branches, setBranches] = useState([]);

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
      } catch (err) {
        console.error("Failed to fetch assets", err);
        setError(err.message || "Failed to load assets");
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, []);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await fetchAllBranches();
        setBranches(data);
      } catch (err) {
        console.error("Failed to fetch branches", err);
        // Don't set error for branches, as it's not critical
      }
    };
    loadBranches();
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

  const categoryCounts = useMemo(() => {
    const counts = { ALL: visibleAssets.length };
    tabs.slice(1).forEach(cat => {
      counts[cat] = visibleAssets.filter(a => {
        const assetCategory = String(a.itemCategory || "").trim().toUpperCase();
        return assetCategory === cat;
      }).length;
    });
    return counts;
  }, [visibleAssets]);

  const handleTab = (key) => {
    setActive(key);
  };

  const goAddItem = () => {
    navigate("/assets/add");
  };

  const filteredAssets = active === "ALL" ? visibleAssets : visibleAssets.filter(a => {
    const assetCategory = String(a.itemCategory || "").trim().toUpperCase();
    return assetCategory === active;
  });

  const getTooltipDetails = (row) => {
    const itemType = row.itemType?.toUpperCase();
    
    if (itemType === 'CPU') {
      const totalRam = Number(row.memory?.totalCapacityGB) || (row.memory?.modules?.reduce((sum, module) => sum + (Number(module.ramCapacityGB) || 0), 0) || 0);
      const totalStorage = Number(row.storage?.totalCapacityGB) || (row.storage?.devices?.reduce((sum, device) => sum + (Number(device.driveCapacityGB) || 0), 0) || 0);
      
      return `Model: ${row.model || 'N/A'}, CPU: ${row.processorModel || 'N/A'}, RAM: ${totalRam || 'N/A'}GB, Storage: ${totalStorage || 'N/A'}GB`;
    } else if (itemType === 'MONITOR') {
      return `Size: ${row.screenSizeInches || 'N/A'}" , Resolution: ${row.resolution || 'N/A'}, Panel: ${row.panelType || 'N/A'}, Refresh Rate: ${row.refreshRateHz || 'N/A'}Hz`;
    }
    else if (itemType === 'LAPTOP') {
      const totalRam = Number(row.memory?.totalCapacityGB) || (row.memory?.modules?.reduce((sum, module) => sum + (Number(module.ramCapacityGB) || 0), 0) || 0);
      const totalStorage = Number(row.storage?.totalCapacityGB) || (row.storage?.devices?.reduce((sum, device) => sum + (Number(device.driveCapacityGB) || 0), 0) || 0);  
      return `Model: ${row.model || 'N/A'}, CPU: ${row.processorModel || 'N/A'}, RAM: ${totalRam || 'N/A'}GB, Storage: ${totalStorage || 'N/A'}GB`;
    }
    
    // Default fallback
    return `Model: ${row.model || 'N/A'}, Serial: ${row.serialNumber || 'N/A'}, Manufacturer: ${row.manufacturer || 'N/A'}`;
  };

  const columns = [
    { 
      header: "Item ID", 
      key: "itemId", 
      sortable: true,
      render: (row) => (
        <span title={getTooltipDetails(row)}>
          {row.itemId}
        </span>
      )
    },
    { header: "Type", key: "itemType", sortable: true },
    { header: "Category", key: "itemCategory", sortable: true },
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
  if (error) return <ErrorNotification error={error} />;

  return (
    <div className="asset-page">
      <div className="asset-header">
        <h1>Assets</h1>
        <Button variant="primary" aria-label="Add Item" onClick={goAddItem}>
          Add Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="asset-summary">
        {tabs.map((cat) => (
          <Card
            key={cat}
            title={cat === "ALL" ? "Total Assets" : cat.charAt(0) + cat.slice(1).toLowerCase()}
            className="summary-card"
          >
            <div className="count">{categoryCounts[cat] || 0}</div>
          </Card>
        ))}
      </div>

      <div className="asset-tabs" role="tablist" aria-label="Asset Categories">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={active === t}
            className={`tab-btn ${active === t ? "active" : ""}`}
            onClick={() => handleTab(t)}
          >
            {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="asset-content">
        {filteredAssets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div className="empty-text">
              {active === "ALL" ? "No items. Click Add Item to create one." : `No ${active.toLowerCase()} items here.`}
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredAssets}
            showSearch={true}
            showPagination={true}
            pageSize={20}
          />
        )}
      </div>
    </div>
  );
};

export default AssetPage;
