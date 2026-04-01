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
import AssetSpecifications from "./components/AssetSpecifications.jsx";
import { fetchAssetDetailsById } from "../../services/assetApi.js";
import { toCapitalizedCase } from "../../utils/string.jsx";

  const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("specifications");

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        const assetType = localStorage.getItem("lastassetType") || "CPU";
        const data = await fetchAssetDetailsById(id, assetType);
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
    if (!warranty) return "NO WARRANTY";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Priority 1: Check if under AMC
    if (warranty.amcAvailable === "Yes" || warranty.amcAvailable === "yes") {
      if (warranty.amcEndDate) {
        const amcEndDate = new Date(warranty.amcEndDate);
        amcEndDate.setHours(0, 0, 0, 0);
        if (amcEndDate >= today) {
          return "Under AMC";
        }
      }
    }
    
    // Priority 2: Check if under warranty
    if (warranty.warrantyAvailable === "Yes" || warranty.warrantyAvailable === "yes") {
      if (warranty.warrantyEndDate) {
        const warrantyEndDate = new Date(warranty.warrantyEndDate);
        warrantyEndDate.setHours(0, 0, 0, 0);
        if (warrantyEndDate >= today) {
          return "Under Warranty";
        } else {
          return "Warranty Expired";
        }
      }
      // If no end date but warranty is available, assume it's under warranty
      return "Under Warranty";
    }
    
    // If warranty was available but now expired
    if (warranty.warrantyAvailable === "No" && warranty.warrantyEndDate) {
      const warrantyEndDate = new Date(warranty.warrantyEndDate);
      warrantyEndDate.setHours(0, 0, 0, 0);
      if (warrantyEndDate < today) {
        return "Warranty Expired";
      }
    }
    
    return "NO WARRANTY";
  };

  const getWarrantyColor = (warranty) => {
    const status = getWarrantyStatus(warranty);
    if (status === "Under AMC") return "info";
    if (status === "Under Warranty") return "success";
    if (status === "Warranty Expired") return "danger";
    return "secondary";
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorNotification error={error} onClose={() => setError(null)} />;
  if (!asset) return <ErrorNotification error="Asset not found" onClose={() => navigate("/assets")} />;

  const purchase = asset.purchase || {};
  const warranty = asset.warranty || {};

  return (
    <div className="asset-details-container">
    {/* Back Button */}
      <div className="back-button-container">
        <Button className="back-button" variant="secondary"  onClick={() => navigate("/assets")}>
          <span className="material-icons">arrow_back</span> Back to Assets
        </Button>
      </div>
      {/* ===== HEADER SECTION ===== */}
      <div className="asset-details-header">
        <div className="header-left">
          <div className="asset-icon">
            {asset.assetType === "MONITOR" && <span className="material-icons">desktop_mac</span>}
            {asset.assetType === "LAPTOP" && <span className="material-icons">laptop</span>}
            {asset.assetType === "CPU" && <span className="material-icons">computer</span>}
            {!["MONITOR", "LAPTOP", "CPU"].includes(asset.assetType) && <span className="material-icons">storage</span>}
          </div>
          <div className="header-info">
            <div className="header-title">
              <h1>{asset.assetId}</h1>
              <Badge variant={getStatusColor(asset.isActive)}>
                {getStatusBadge(asset.isActive)}
              </Badge>
            </div>
            <p className="header-subtitle">
              <span title="Asset Type">
                {["cpu"].includes(asset.assetType?.toLowerCase()) ? "CPU"  : toCapitalizedCase(String(asset.assetType)) || "Unknown Type"}
              </span>              

              {" | "}
              <span title="Manufacturer">
                {toCapitalizedCase(String(asset.manufacturer)) || "Unknown Manufacturer"}
              </span>
              {" | "}
              <span title="Model">
                { toCapitalizedCase(String(asset.model)) || "N/A"}
              </span>
            </p>
            <p className="header-meta">
              Serial: <strong>{asset.serialNumber?.toUpperCase() || "N/A"}</strong> | 
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
              <span className="material-icons" style={{fontSize: '18px', marginRight: '4px'}}>edit</span>Edit
            </Button>
            <Button variant="secondary" size="small">
              <span className="material-icons" style={{fontSize: '18px', marginRight: '4px'}}>send</span>Transfer
            </Button>
            <Button variant="danger" size="small">
              <span className="material-icons" style={{fontSize: '18px', marginRight: '4px'}}>delete</span>Retire
            </Button>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="asset-details-tabs">
        <button
          className={`tab ${activeTab === "specifications" ? "active" : ""}`}
          onClick={() => setActiveTab("specifications")}
        >
          <span className="material-icons">description</span> Specifications
        </button>
        <button
          className={`tab ${activeTab === "assignment" ? "active" : ""}`}
          onClick={() => setActiveTab("assignment")}
        >
          <span className="material-icons">person</span> Assignment
        </button>
        <button
          className={`tab ${activeTab === "warranty" ? "active" : ""}`}
          onClick={() => setActiveTab("warranty")}
        >
          <span className="material-icons">shield</span> Warranty
        </button>
        <button
          className={`tab ${activeTab === "purchase" ? "active" : ""}`}
          onClick={() => setActiveTab("purchase")}
        >
          <span className="material-icons">shopping_cart</span> Purchase
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <span className="material-icons">timeline</span> Timeline
        </button>
      </div>

      {/* ===== CONTENT SECTIONS ===== */}
      <div className="asset-details-content">
        {/* ===== SPECIFICATIONS TAB ===== */}
        {activeTab === "specifications" && (
          <div className="tab-content specifications-tab">
            <div className="info-grid">
              <AssetSpecifications asset={asset} />
            </div>
          </div>
        )}

        {/* ===== ASSIGNMENT TAB ===== */}
        {activeTab === "assignment" && (
          <div className="tab-content assignment-tab">
            <div className="info-grid">
              {/* Current Assignment */}
              <div className="info-section">
                <h3>Current Assignment</h3>
                <div className="info-items">
                  <div className="info-item">
                    <label>Assigned To</label>
                    <p>{asset.assignedToUser?.name || asset.assignedTo || "Not Assigned"}</p>
                  </div>
                  <div className="info-item">
                    <label>Employee ID</label>
                    <p>{asset.assignedToUser?.employeeId || asset.employeeId || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Department</label>
                    <p>{asset.assignedToUser?.department || asset.department || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Assignment Date</label>
                    <p>{asset.assignmentDate ? formatDate(asset.assignmentDate) : "Not Assigned"}</p>
                  </div>
                  <div className="info-item">
                    <label>Location</label>
                    <p>{asset.location || asset.branchId?.branchName || "N/A"}</p>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <p>
                      <Badge variant={asset.assignedTo ? "success" : "secondary"}>
                        {asset.assignedTo ? "Assigned" : "Available"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment History */}
              <div className="info-section">
                <h3>Assignment History</h3>
                <div className="assignment-history">
                  {asset.assignmentHistory && asset.assignmentHistory.length > 0 ? (
                    <div className="history-list">
                      {asset.assignmentHistory.map((assignment, index) => (
                        <div key={index} className="history-item">
                          <div className="history-header">
                            <span className="history-user">{assignment.assignedTo || "Unknown"}</span>
                            <span className="history-date">{formatDate(assignment.assignmentDate)}</span>
                          </div>
                          <div className="history-details">
                            <span>Department: {assignment.department || "N/A"}</span>
                            <span>Location: {assignment.location || "N/A"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="material-icons">history</span>
                      <p>No assignment history available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Actions */}
              <div className="info-section">
                <h3>Assignment Actions</h3>
                <div className="action-buttons">
                  <Button variant="primary" size="small">
                    <span className="material-icons" style={{fontSize: '16px', marginRight: '4px'}}>person_add</span>
                    Assign Asset
                  </Button>
                  <Button variant="secondary" size="small">
                    <span className="material-icons" style={{fontSize: '16px', marginRight: '4px'}}>swap_horiz</span>
                    Transfer Asset
                  </Button>
                  <Button variant="danger" size="small">
                    <span className="material-icons" style={{fontSize: '16px', marginRight: '4px'}}>person_remove</span>
                    Unassign Asset
                  </Button>
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
                      <p>{purchase.assetReceivedOn || "N/A"}</p>
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
                <div className="timeline-marker">[PIN]</div>
                <div className="timeline-content">
                  <h4>Asset Created</h4>
                  <p>{formatDate(asset.createdAt)}</p>
                  <span className="timeline-detail">Initial asset registration in the system</span>
                </div>
              </div>

              {/* Purchase Event */}
              {purchase?.purchaseDate && (
                <div className="timeline-event">
                  <div className="timeline-marker">[WALLET]</div>
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
                  <div className="timeline-marker">[BOX]</div>
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
                  <div className="timeline-marker">[SHIELD]</div>
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
                  <div className="timeline-marker">[USER]</div>
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
                  <div className="timeline-marker">[CHECK]</div>
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
                  <div className="timeline-marker">â°</div>
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
                  <div className="timeline-marker">â„¹ï¸</div>
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

      
    </div>
  );
};

export default AssetDetails;
