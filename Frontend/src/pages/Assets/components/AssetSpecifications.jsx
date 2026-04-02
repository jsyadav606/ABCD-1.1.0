/**
 * Component: AssetSpecifications
 * Description: Generic specifications component that renders specs based on configuration
 * Now uses exact same Input/Textarea components as the form renderer for consistent UX
 * 
 * HOW TO ADD NEW ASSET TYPES:
 * 1. Go to: Frontend/src/pages/Assets/config/assetSpecsConfig.js
 * 2. Add a new asset type object (see examples in that file)
 * 3. That's it! No changes needed to this component.
 * 
 * The component automatically:
 * - Reads the config for the asset type
 * - Renders sections and fields conditionally
 * - Formats data according to field specifications
 * - Shows nice messages for unsupported types or missing data
 */

import React, { useState } from "react";
import Input from "../../../components/Input/Input.jsx";
import Textarea from "../../../components/Textarea/Textarea.jsx";
import { ASSET_SPECS_CONFIG, LIST_FORMATTERS, getNestedValue, hasFieldData } from "../config/assetSpecsConfig.js";
import "./AssetSpecifications.css";

const AssetSpecifications = ({ asset }) => {
  const [formData, setFormData] = useState({});

  if (!asset) {
    return (
      <div className="specifications-empty">
        <div className="empty-state">
          <span className="material-icons">info</span>
          <h3>No Asset Data</h3>
          <p>Unable to load specifications. Asset data is not available.</p>
        </div>
      </div>
    );
  }

  const assetType = asset.assetType?.toUpperCase();
  const config = ASSET_SPECS_CONFIG[assetType];

  // Format field value based on format type
  const formatFieldValue = (value, format, unit = "") => {
    if (value === null || value === undefined) return null;

    switch (format) {
      case "text":
        return String(value);
      case "number":
        return `${value}${unit ? ` ${unit}` : ""}`;
      case "boolean":
        return String(value).toLowerCase() === "true" || value === true ? "Yes" : "No";
      case "date":
        return new Date(value).toLocaleDateString("en-IN");
      case "list":
        return value; // Will be handled separately
      default:
        return String(value);
    }
  };

  // Render a field item using Input component
  const renderFieldItem = (field) => {
    if (!hasFieldData(asset, field.key)) return null;

    const value = getNestedValue(asset, field.key);

    if (field.format === "list" && Array.isArray(value) && value.length > 0) {
      const formatter = LIST_FORMATTERS[field.listFormat];
      const formattedItems = formatter ? formatter(value) : value;
      const listText = formattedItems
        .map((item) => (item.main ? `${item.main}${item.sub ? ` (${item.sub})` : ""}` : item))
        .join("\n");

      return (
        <div key={field.key} className="spec-item"> 
          <label>{field.label}</label>
          <div className="spec-value multiline" title={listText}>
            {listText}
          </div>
        </div>
      );
    }

    const displayValue = formatFieldValue(value, field.format, field.unit);
    if (!displayValue) return null;

    return (
      <div key={field.key} className="spec-item">
        <label>{field.label}</label>
        <div className="spec-value" title={displayValue}>
          {displayValue}
        </div>
      </div>
    );
  };

  // Render a section
  const renderSection = (section) => {
    const hasFields = section.fields.some((field) => hasFieldData(asset, field.key));
    if (!hasFields) return null;

    return (
      <div key={section.title} className="spec-section">
        <h4>{section.title}</h4>
        <div className="spec-grid">
          {section.fields.map((field) => renderFieldItem(field))}
        </div>
      </div>
    );
  };

  // Render all specifications
  const renderSpecifications = () => {
    if (!config) {
      return (
        <div className="no-specs">
          <span className="material-icons">info</span>
          <p>Specifications not configured for {assetType || "this asset type"}</p>
          <small style={{ marginTop: "8px", fontSize: "0.8rem" }}>
            To add specs for this type, edit: Frontend/src/pages/Assets/config/assetSpecsConfig.js
          </small>
        </div>
      );
    }

    const sections = config.sections.map((section) => renderSection(section));
    const validSections = sections.filter((s) => s !== null);

    if (validSections.length === 0) {
      return (
        <div className="no-specs">
          <span className="material-icons">info</span>
          <p>No specifications available for this {assetType}</p>
        </div>
      );
    }

    return validSections;
  };

  return (
    <div className="asset-specifications">
      {/* <div className="specifications-header">
        <h3>Specifications</h3>
        <div className="asset-type-badge">
          <span className="material-icons">
            {config?.icon ? config.icon : "devices"}
          </span>
          {assetType || "Unknown"}
        </div>
      </div> */}
      <div className="specifications-content">
        {renderSpecifications()}
      </div>
    </div>
  );
};

export default AssetSpecifications;

