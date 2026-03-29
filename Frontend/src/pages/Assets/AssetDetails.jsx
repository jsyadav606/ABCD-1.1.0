/**
 * Page: Asset Details
 * Description: Industry-standard asset detail view with complete information including
 * basic info, specifications, warranty, purchase, assignment history, repair history, and timeline
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./assetdetails.css";
import { PageLoader } from "../../components/Loader/Loader.jsx";
import { ErrorNotification } from "../../components/ErrorBoundary/ErrorNotification.jsx";
import Button from "../../components/Button/Button.jsx";
import Badge from "../../components/Badge/Badge.jsx";
import { fetchAssetDetailsById } from "../../services/assetApi.js";

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        const itemType = localStorage.getItem("lastItemType") || "CPU";
        const data = await fetchAssetDetailsById(id, itemType);
        setAsset(data);
      } catch (err) {
        console.error("Failed to fetch asset details", err);
        setError(err.message || "Failed to load asset details");
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    const isActive = status !== false;
    return isActive ? "ACTIVE" : "INACTIVE";
  };

  const getStatusColor = (status) => {
    const isActive = status !== false;
    return isActive ? "success" : "danger";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getWarrantyStatus = (warranty) => {
    if (!warranty || warranty.warrantyAvailable === "No") return "NO WARRANTY";
    if (warranty.warrantyStatus === "Under Warranty") return "ACTIVE";
    if (warranty.warrantyStatus === "Expired") return "EXPIRED";
    return "UNKNOWN";
  };

  const getWarrantyColor = (warranty) => {
    const status = getWarrantyStatus(warranty);
    if (status === "ACTIVE") return "success";
    if (status === "EXPIRED") return "danger";
    return "secondary";
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorNotification error={error} onClose={() => setError(null)} />;
  if (!asset) return <ErrorNotification error="Asset not found" onClose={() => navigate("/assets")} />;

  const purchase = asset.purchase || {};
  const warranty = asset.warranty || {};

  const storage = asset.storage || {};
  const memory = asset.memory || {};
  const totalRam = memory.totalCapacityGB || (memory.modules?.reduce((sum, m) => sum + (m.ramCapacityGB || 0), 0) || 0);
  const totalStorage = storage.totalCapacityGB || (storage.devices?.reduce((sum, d) => sum +  (d.driveCapacityGB || 0), 0) || 0);

  return (
    <div className="asset-details-container">
      {/* ===== HEADER SECTION ===== */}
      <div className="asset-details-header">
        <div className="header-left">
          <div className="asset-icon">
            {asset.itemType === "MONITOR" && "🖥️"}
            {asset.itemType === "LAPTOP" && "💻"}
            {asset.itemType === "CPU" && "🖥️"}
            {!["MONITOR", "LAPTOP", "CPU"].includes(asset.itemType) && "📦"}
          </div>
          <div className="header-info">
            <div className="header-title">
              <h1>{asset.itemId}</h1>
              <Badge variant={getStatusColor(asset.isActive)}>
                {getStatusBadge(asset.isActive)}
              </Badge>
            </div>
            <p className="header-subtitle">
              {asset.itemType} • {asset.manufacturer || "Unknown"} • {asset.model || "N/A"}
            </p>
            <p className="header-meta">
              Serial: <strong>{asset.serialNumber || "N/A"}</strong> • 
              Added: <strong>{formatDate(asset.createdAt)}</strong>
            </p>
          </div>
        </div>

        <div className="header-right">
          <div className="warranty-badge">
            <Badge variant={getWarrantyColor(warranty)}>
              {getWarrantyStatus(warranty)}
            </Badge>
            {warranty.warrantyEndDate && (
              <p className="warranty-date">{formatDate(warranty.warrantyEndDate)}</p>
            )}
          </div>
          <div className="header-actions">
            <Button variant="secondary" size="small" onClick={() => navigate(`/assets/edit/${id}`)}>
              ✏️ Edit
            </Button>
            <Button variant="secondary" size="small">
              ⤴️ Transfer
            </Button>
            <Button variant="danger" size="small">
              🗑️ Retire
            </Button>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="asset-details-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📋 Overview
        </button>
        <button
          className={`tab ${activeTab === "specifications" ? "active" : ""}`}
          onClick={() => setActiveTab("specifications")}
        >
          ⚙️ Specifications
        </button>
        <button
          className={`tab ${activeTab === "warranty" ? "active" : ""}`}
          onClick={() => setActiveTab("warranty")}
        >
          🛡️ Warranty
        </button>
        <button
          className={`tab ${activeTab === "purchase" ? "active" : ""}`}
          onClick={() => setActiveTab("purchase")}
        >
          💳 Purchase
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📜 Timeline
        </button>
      </div>

      {/* ===== CONTENT SECTIONS ===== */}
      <div className="asset-details-content">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div className="tab-content overview-tab">
            <div className="info-grid">
              <div className="info-section">
                <h3>Asset Information</h3>
                <div className="info-items">
                  <div className="info-item">
                    <label>Asset ID</label>
                    <p>{asset.itemId || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Item Type</label>
                    <p>{asset.itemType || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Category</label>
                    <p>{typeof asset.itemCategory === "string" ? asset.itemCategory : asset.itemCategory?.name || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <p>
                      <Badge variant={getStatusColor(asset.isActive)}>
                        {getStatusBadge(asset.isActive)}
                      </Badge>
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Location/Branch</label>
                    <p>{typeof asset.branchId === "string" ? asset.branchId : asset.branchId?.branchName || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Created Date</label>
                    <p>{formatDate(asset.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Product Details</h3>
                <div className="info-items">
                  <div className="info-item">
                    <label>Manufacturer</label>
                    <p>{asset.manufacturer || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Model</label>
                    <p>{asset.model || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Serial Number</label>
                    <p className="serial-number">{asset.serialNumber || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Asset Tag</label>
                    <p className="asset-tag">{asset.assetTag || asset.itemId || "N/A"}</p>
                  </div>
                  {asset.osName && (
                    <div className="info-item">
                      <label>Operating System</label>
                      <p>{asset.osName}</p>
                    </div>
                  )}
                  {asset.processorModel && (
                    <div className="info-item">
                      <label>Processor</label>
                      <p>{asset.processorModel}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h3>Assignment</h3>
                <div className="info-items">
                  <div className="info-item">
                    <label>Assigned To</label>
                    <p>{asset.assignedToUser?.name || asset.assignedTo || "Unassigned"}</p>
                  </div>
                  <div className="info-item">
                    <label>Assignment Date</label>
                    <p>{asset.assignmentDate ? formatDate(asset.assignmentDate) : "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Department</label>
                    <p>{asset.department || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SPECIFICATIONS TAB ===== */}
        {activeTab === "specifications" && (
          <div className="tab-content specifications-tab">
            <div className="info-grid">
              {/* RAM Section */}
              {(totalRam > 0 || memory.modules?.length > 0) && (
                <div className="info-section">
                  <h3>Memory (RAM)</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <label>Total Capacity</label>
                      <p>{totalRam} GB</p>
                    </div>
                    {memory.modules?.length > 0 && (
                      <div className="info-item">
                        <label>Modules</label>
                        <ul className="spec-list">
                          {memory.modules.map((module, idx) => (
                            <li key={idx}>
                              {module.ramCapacityGB}GB - {module.ramType || "N/A"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Storage Section */}
              {(totalStorage > 0 || storage.devices?.length > 0) && (
                <div className="info-section">
                  <h3>Storage</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <label>Total Capacity</label>
                      <p>{totalStorage} GB</p>
                    </div>
                    {storage.devices?.length > 0 && (
                      <div className="info-item">
                        <label>Drives</label>
                        <ul className="spec-list">
                          {storage.devices.map((device, idx) => (
                            <li key={idx}>
                              {device.driveCapacityGB}GB {device.driveType || "HDD"} - {device.interfaceType || "SATA"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Monitor Specifications */}
              {asset.itemType === "MONITOR" && (
                <div className="info-section">
                  <h3>Display Specifications</h3>
                  <div className="info-items">
                    {asset.screenSizeInches && (
                      <div className="info-item">
                        <label>Screen Size</label>
                        <p>{asset.screenSizeInches}"</p>
                      </div>
                    )}
                    {asset.resolution && (
                      <div className="info-item">
                        <label>Resolution</label>
                        <p>{asset.resolution}</p>
                      </div>
                    )}
                    {(asset.panelType || asset.panel_type) && (
                      <div className="info-item">
                        <label>Panel Type</label>
                        <p>{asset.panelType || asset.panel_type}</p>
                      </div>
                    )}
                    {(asset.refreshRateHz || asset.refresh_rate_hz) && (
                      <div className="info-item">
                        <label>Refresh Rate</label>
                        <p>{asset.refreshRateHz || asset.refresh_rate_hz} Hz</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GPU Section */}
              {asset.gpu && (
                <div className="info-section">
                  <h3>Graphics</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <label>GPU Model</label>
                      <p>{asset.gpu}</p>
                    </div>
                    {asset.gpuMemoryGB && (
                      <div className="info-item">
                        <label>GPU Memory</label>
                        <p>{asset.gpuMemoryGB} GB</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* General Specs */}
              <div className="info-section">
                <h3>General Information</h3>
                <div className="info-items">
                  {asset.color && (
                    <div className="info-item">
                      <label>Color</label>
                      <p>{asset.color}</p>
                    </div>
                  )}
                  {asset.weight && (
                    <div className="info-item">
                      <label>Weight</label>
                      <p>{asset.weight}</p>
                    </div>
                  )}
                  {asset.notes && (
                    <div className="info-item">
                      <label>Notes</label>
                      <p>{asset.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== WARRANTY TAB ===== */}
        {activeTab === "warranty" && (
          <div className="tab-content warranty-tab">
            {warranty && warranty.warrantyAvailable !== "No" ? (
              <div className="info-grid">
                <div className="info-section warranty-section">
                  <div className="warranty-header">
                    <h3>Warranty Coverage</h3>
                    <Badge variant={getWarrantyColor(warranty)}>
                      {getWarrantyStatus(warranty)}
                    </Badge>
                  </div>
                  <div className="info-items">
                    <div className="info-item">
                      <label>Warranty Available</label>
                      <p>{warranty.warrantyAvailable || "No"}</p>
                    </div>
                    <div className="info-item">
                      <label>Warranty Type</label>
                      <p>{warranty.warrantyMode || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Start Date</label>
                      <p>{formatDate(warranty.warrantyStartDate)}</p>
                    </div>
                    <div className="info-item">
                      <label>End Date</label>
                      <p>{formatDate(warranty.warrantyEndDate)}</p>
                    </div>
                    <div className="info-item">
                      <label>Coverage Period</label>
                      <p>
                        {warranty.inYear || 0} Year(s) {warranty.inMonth || 0} Month(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Support Details</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <label>Warranty Provider</label>
                      <p>{warranty.warrantyProvider || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Support Vendor</label>
                      <p>{warranty.supportVendor || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Support Phone</label>
                      <p>{warranty.supportPhone ? <a href={`tel:${warranty.supportPhone}`}>{warranty.supportPhone}</a> : "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Support Email</label>
                      <p>{warranty.supportEmail ? <a href={`mailto:${warranty.supportEmail}`}>{warranty.supportEmail}</a> : "N/A"}</p>
                    </div>
                  </div>
                </div>

                {warranty.amcAvailable && (
                  <div className="info-section">
                    <h3>AMC Details</h3>
                    <div className="info-items">
                      <div className="info-item">
                        <label>AMC Available</label>
                        <p>{warranty.amcAvailable}</p>
                      </div>
                      <div className="info-item">
                        <label>AMC Vendor</label>
                        <p>{warranty.amcVendor || "N/A"}</p>
                      </div>
                      <div className="info-item">
                        <label>AMC Start Date</label>
                        <p>{formatDate(warranty.amcStartDate)}</p>
                      </div>
                      <div className="info-item">
                        <label>AMC End Date</label>
                        <p>{formatDate(warranty.amcEndDate)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Warranty Information</h3>
                <p>This asset does not have warranty coverage information.</p>
                <Button variant="primary" onClick={() => navigate(`/assets/edit/${id}`)}>
                  Add Warranty Details
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ===== PURCHASE TAB ===== */}
        {activeTab === "purchase" && (
          <div className="tab-content purchase-tab">
            {purchase && purchase.purchaseDate ? (
              <div className="info-grid">
                <div className="info-section">
                  <h3>Purchase Information</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <label>Purchase Date</label>
                      <p>{formatDate(purchase.purchaseDate)}</p>
                    </div>
                    <div className="info-item">
                      <label>Purchase Type</label>
                      <p>{purchase.purchaseType || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Delivery Date</label>
                      <p>{formatDate(purchase.deliveryDate)}</p>
                    </div>
                    <div className="info-item">
                      <label>Received By</label>
                      <p>{purchase.receivedBy || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Item Received On</label>
                      <p>{purchase.itemReceivedOn || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Purchase Documents</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <label>PO Number</label>
                      <p>{purchase.poNumber || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>PO Date</label>
                      <p>{formatDate(purchase.poDate)}</p>
                    </div>
                    <div className="info-item">
                      <label>Invoice Number</label>
                      <p>{purchase.invoiceNumber || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Invoice Date</label>
                      <p>{formatDate(purchase.invoiceDate)}</p>
                    </div>
                    <div className="info-item">
                      <label>Receipt Number</label>
                      <p>{purchase.receiptNumber || "N/A"}</p>
                    </div>
                    <div className="info-item">
                      <label>Delivery Challan</label>
                      <p>{purchase.deliveryChallanNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Financial Details</h3>
                  <div className="info-items cost-items">
                    <div className="info-item">
                      <label>Purchase Cost</label>
                      <p className="amount">{formatCurrency(purchase.purchaseCost)}</p>
                    </div>
                    <div className="info-item">
                      <label>Tax Amount</label>
                      <p className="amount">{formatCurrency(purchase.taxAmount)}</p>
                    </div>
                    <div className="info-item highlight">
                      <label>Total Amount</label>
                      <p className="amount total">{formatCurrency(purchase.totalAmount)}</p>
                    </div>
                    {purchase.currency && (
                      <div className="info-item">
                        <label>Currency</label>
                        <p>{purchase.currency}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Purchase Information</h3>
                <p>Purchase details are not available for this asset.</p>
                <Button variant="primary" onClick={() => navigate(`/assets/edit/${id}`)}>
                  Add Purchase Details
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ===== TIMELINE TAB ===== */}
        {activeTab === "history" && (
          <div className="tab-content history-tab">
            <div className="timeline">
              {/* Creation Event */}
              <div className="timeline-event">
                <div className="timeline-marker">📝</div>
                <div className="timeline-content">
                  <h4>Asset Created</h4>
                  <p>{formatDate(asset.createdAt)}</p>
                  <span className="timeline-detail">Initial asset registration in the system</span>
                </div>
              </div>

              {/* Purchase Event */}
              {purchase?.purchaseDate && (
                <div className="timeline-event">
                  <div className="timeline-marker">💳</div>
                  <div className="timeline-content">
                    <h4>Asset Purchased</h4>
                    <p>{formatDate(purchase.purchaseDate)}</p>
                    <span className="timeline-detail">
                      {purchase.purchaseType || "Purchase"} - {formatCurrency(purchase.purchaseCost)}
                    </span>
                  </div>
                </div>
              )}

              {/* Delivery Event */}
              {purchase?.deliveryDate && (
                <div className="timeline-event">
                  <div className="timeline-marker">📦</div>
                  <div className="timeline-content">
                    <h4>Asset Delivered</h4>
                    <p>{formatDate(purchase.deliveryDate)}</p>
                    <span className="timeline-detail">Received by {purchase.receivedBy || "Unknown"}</span>
                  </div>
                </div>
              )}

              {/* Warranty Event */}
              {warranty?.warrantyStartDate && (
                <div className="timeline-event">
                  <div className="timeline-marker">🛡️</div>
                  <div className="timeline-content">
                    <h4>Warranty Started</h4>
                    <p>{formatDate(warranty.warrantyStartDate)}</p>
                    <span className="timeline-detail">
                      Coverage: {warranty.warrantyMode || "Standard"} until {formatDate(warranty.warrantyEndDate)}
                    </span>
                  </div>
                </div>
              )}

              {/* Assignment Event */}
              {asset.assignmentDate && (
                <div className="timeline-event">
                  <div className="timeline-marker">👤</div>
                  <div className="timeline-content">
                    <h4>Asset Assigned</h4>
                    <p>{formatDate(asset.assignmentDate)}</p>
                    <span className="timeline-detail">
                      Assigned to {asset.assignedToUser?.name || asset.assignedTo || "Unknown"}
                    </span>
                  </div>
                </div>
              )}

              {/* Update Event */}
              {asset.updatedAt && asset.updatedAt !== asset.createdAt && (
                <div className="timeline-event">
                  <div className="timeline-marker">✏️</div>
                  <div className="timeline-content">
                    <h4>Last Updated</h4>
                    <p>{formatDate(asset.updatedAt)}</p>
                    <span className="timeline-detail">Asset information was modified</span>
                  </div>
                </div>
              )}

              {/* Warranty Expiration Event */}
              {warranty?.warrantyEndDate && (
                <div className={`timeline-event ${new Date() > new Date(warranty.warrantyEndDate) ? "expired" : ""}`}>
                  <div className="timeline-marker">⏰</div>
                  <div className="timeline-content">
                    <h4>Warranty Expires</h4>
                    <p>{formatDate(warranty.warrantyEndDate)}</p>
                    <span className="timeline-detail">
                      {new Date() > new Date(warranty.warrantyEndDate) ? "Warranty has expired" : "Upcoming warranty expiration"}
                    </span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!purchase?.purchaseDate && !warranty?.warrantyStartDate && !asset.assignmentDate && (
                <div className="timeline-event">
                  <div className="timeline-marker">ℹ️</div>
                  <div className="timeline-content">
                    <h4>Limited History</h4>
                    <p>More details will appear as asset events are recorded.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="asset-details-footer">
        <Button variant="secondary" onClick={() => navigate("/assets")}>
          ← Back to Assets
        </Button>
      </div>
    </div>
  );
};

export default AssetDetails;
