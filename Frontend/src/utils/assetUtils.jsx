/**
 * Asset Tooltip Utilities
 * Provides tooltip details for different asset types in the asset table
 */

import React from 'react';

export const getTooltipDetails = (row) => {
  const safe = (value) => (value || value === 0 ? value : "N/A");
  const itemType = row.itemType?.toUpperCase();

  const totalRam = Number(row.memory?.totalCapacityGB) || (row.memory?.modules?.reduce((sum, module) => sum + (Number(module.ramCapacityGB) || 0), 0) || 0);
  const totalStorage = Number(row.storage?.totalCapacityGB) || (row.storage?.devices?.reduce((sum, device) => sum + (Number(device.driveCapacityGB) || 0), 0) || 0);

  if (itemType === 'CPU') {
    return `OS: ${safe(row.osName)}, Model: ${safe(row.model)}, CPU: ${safe(row.processorModel)}, RAM: ${totalRam ? `${totalRam}GB` : 'N/A'}, Storage: ${totalStorage ? `${totalStorage}GB` : 'N/A'}`;
  }

  if (itemType === 'LAPTOP') {
    return `OS: ${safe(row.osName)}, Model: ${safe(row.model)}, CPU: ${safe(row.processorModel)}, RAM: ${totalRam ? `${totalRam}GB` : 'N/A'}, Storage: ${totalStorage ? `${totalStorage}GB` : 'N/A'}`;
  }

  if (itemType === 'MONITOR') {
    const size = safe(row.screenSizeInches);
    const resolution = safe(row.resolution);
    const panel = safe(row.panelType ?? row.panel_type);
    const refresh = safe(row.refreshRateHz ?? row.refresh_rate_hz);
    return `Size: ${size}", Resolution: ${resolution}, Panel: ${panel}, Refresh Rate: ${refresh}Hz`;
  }

  if (itemType === 'PRINTER') {
    return `Model: ${safe(row.model)}, Type: ${safe(row.printerType)}, Technology: ${safe(row.printTechnology)}, Max Resolution: ${safe(row.maxResolution)}`;
  }

  if (itemType === 'CAMERA') {
    return `Model: ${safe(row.model)}, Type: ${safe(row.cameraType)}, Resolution: ${safe(row.resolution)}, Interface: ${safe(row.interfaceType)}`;
  }

  if (itemType === 'KEYBOARD') {
    return `Model: ${safe(row.model)}, Type: ${safe(row.keyboardType)}, Interface: ${safe(row.interfaceType)}, Layout: ${safe(row.layout)}`;
  }

  if (itemType === 'MOUSE') {
    return `Model: ${safe(row.model)}, Type: ${safe(row.mouseType)}, Interface: ${safe(row.interfaceType)}, DPI: ${safe(row.dpi)}`;
  }

  if (itemType === 'HEADPHONE') {
    return `Model: ${safe(row.model)}, Type: ${safe(row.headphoneType)}, Interface: ${safe(row.interfaceType)}, Driver Size: ${safe(row.driverSize)}`;
  }

  // Default fallback
  return `Model: ${safe(row.model)}, Serial: ${safe(row.serialNumber)}, Manufacturer: ${safe(row.manufacturer)}`;
};

/**
 * Highlight text based on search value
 * @param {string} text - Text to highlight
 * @param {string} searchValue - Search term
 * @returns {string|JSX.Element} - Highlighted text or original text
 */
export const highlightText = (text, searchValue) => {
  if (!searchValue || !text) return text;
  const normalizedSearch = searchValue.trim();
  if (!normalizedSearch) return text;

  const regex = new RegExp(`(${normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = String(text).split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === normalizedSearch.toLowerCase() ? (
      <span key={index} className="highlight">
        {part}
      </span>
    ) : (
      part
    )
  );
};