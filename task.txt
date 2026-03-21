/**
 * Page: Assets List (placeholder)
 * Description: Is page par category tabs aur "Add Item" CTA diya gaya hai.
 * Abhi data listing empty state dikhata hai; future me yahin inventory list integrate ki ja sakti hai.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./asset.css";
import Button from "../../components/Button/Button.jsx";

const tabs = ["ALL", "FIXED", "PERIPHERAL", "CONSUMABLE", "INTANGIBLE"];

const AssetPage = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("ALL");

  const handleTab = (key) => {
    setActive(key);
  };

  const goAddItem = () => {
    navigate("/assets/add");
  };

  return (
    <div className="asset-page">
      <div className="asset-header">
        <h1>Assets</h1>
        <Button variant="primary" aria-label="Add Item" onClick={goAddItem}>
          Add Item
        </Button>
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
      <div className="asset-content" role="region" aria-live="polite">
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-text">
            {active === "ALL" ? "No items. Click Add Item to create one." : `No ${active.toLowerCase()} items here.`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetPage;
