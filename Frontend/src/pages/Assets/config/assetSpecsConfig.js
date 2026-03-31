/**
 * Asset Specifications Configuration
 * 
 * EASY TO USE GUIDE:
 * To add specifications for a new asset type, just add a new object following this pattern:
 * 
 * ASSET_TYPE_NAME: {
 *   icon: "material_icon_name",
 *   sections: [
 *     {
 *       title: "Section Name",
 *       fields: [
 *         { key: "fieldName", label: "Display Label", unit: "optional unit", format: "text/number/boolean" },
 *       ]
 *     }
 *   ]
 * }
 * 
 * FORMAT TYPES:
 * - "text" : Shows as plain text
 * - "number" : Shows numbers with optional unit (e.g., "2 GB")
 * - "boolean" : Shows as Yes/No
 * - "list" : Shows array items in a nice list
 * - "date" : Formats date nicely
 * 
 * EXAMPLE for adding PRINTER specs:
 * 
 * PRINTER: {
 *   icon: "print",
 *   sections: [
 *     {
 *       title: "Basic Info",
 *       fields: [
 *         { key: "manufacturer", label: "Manufacturer", format: "text" },
 *         { key: "model", label: "Model", format: "text" },
 *       ]
 *     },
 *     {
 *       title: "Print Specifications",
 *       fields: [
 *         { key: "colorPrinting", label: "Color Printing", format: "boolean" },
 *         { key: "maxPrintSpeedPPM", label: "Print Speed", unit: "PPM", format: "number" },
 *         { key: "maxPaperWidth", label: "Max Paper Width", unit: "mm", format: "number" },
 *       ]
 *     }
 *   ]
 * }
 */

export const ASSET_SPECS_CONFIG = {
  // ======================== CPU ========================
  CPU: {
    icon: "memory",
    sections: [
      {
        title: "Processor",
        fields: [
          { key: "processorManufacturer", label: "Manufacturer", format: "text" },
          { key: "processorModel", label: "Model", format: "text" },
          { key: "processorGeneration", label: "Generation", unit: "th Gen", format: "number" },
          { key: "cores", label: "Cores", format: "number" },
          { key: "threads", label: "Threads", format: "number" },
          { key: "virtualizationEnabled", label: "Virtualization", format: "boolean" },
        ]
      },
      {
        title: "Memory (RAM)",
        fields: [
          { key: "memory.totalCapacityGB", label: "Total Capacity", unit: "GB", format: "number" },
          { key: "memory.modules", label: "Installed Modules", format: "list", listFormat: "ramModule" },
          { key: "memory.modules", label: "Installed Modules", format: "list", listFormat: "ramModule" },
          { key: "memory.modules", label: "Installed Modules", format: "list", listFormat: "ramModule" },
          { key: "memory.modules", label: "Installed Modules", format: "list", listFormat: "ramModule" },
          { key: "memory.modules", label: "Installed Modules", format: "list", listFormat: "ramModule" },
        ]
      },
      {
        title: "Storage",
        fields: [
          { key: "storage.totalCapacityGB", label: "Total Capacity", unit: "GB", format: "number" },
          { key: "storage.devices", label: "Installed Drives", format: "list", listFormat: "storageDrive" },
        ]
      },
      {
        title: "Graphics",
        fields: [
          { key: "gpu", label: "GPU Model", format: "text" },
          { key: "gpuCapacityGB", label: "GPU Memory", unit: "GB", format: "number" },
        ]
      },
      {
        title: "Operating System",
        fields: [
          { key: "osName", label: "OS Name", format: "text" },
          { key: "osEdition", label: "Edition", format: "text" },
          { key: "osVersion", label: "Version", format: "text" },
          { key: "buildNumber", label: "Build Number", format: "text" },
          { key: "domain", label: "Domain", format: "text" },
        ]
      },
      {
        title: "Hardware Security",
        fields: [
          { key: "biosVersion", label: "BIOS Version", format: "text" },
          { key: "tpmVersion", label: "TPM Version", format: "text" },
          { key: "secureBootEnabled", label: "Secure Boot", format: "boolean" },
        ]
      },
    ]
  },

  // ======================== MONITOR ========================
  MONITOR: {
    icon: "desktop_mac",
    sections: [
      {
        title: "Display",
        fields: [
          { key: "screenSizeInches", label: "Screen Size", unit: '"', format: "number" },
          { key: "resolution", label: "Resolution", format: "text" },
          { key: "panelType", label: "Panel Type", format: "text" },
          { key: "refreshRateHz", label: "Refresh Rate", unit: "Hz", format: "number" },
          { key: "aspectRatio", label: "Aspect Ratio", format: "text" },
          { key: "brightnessNits", label: "Brightness", unit: "nits", format: "number" },
          { key: "responseTimeMs", label: "Response Time", unit: "ms", format: "number" },
          { key: "curved", label: "Curved", format: "boolean" },
        ]
      },
      {
        title: "Connectivity",
        fields: [
          { key: "hdmiPorts", label: "HDMI Ports", format: "number" },
          { key: "displayPort", label: "DisplayPort", format: "number" },
          { key: "vgaPort", label: "VGA Port", format: "text" },
          { key: "usbPorts", label: "USB Ports", format: "number" },
          { key: "audioOut", label: "Audio Out", format: "text" },
          { key: "builtInSpeakers", label: "Built-in Speakers", format: "boolean" },
        ]
      },
      {
        title: "Power & Efficiency",
        fields: [
          { key: "powerConsumptionWatt", label: "Power Consumption", unit: "W", format: "number" },
          { key: "energyRating", label: "Energy Rating", format: "text" },
          { key: "voltageRange", label: "Voltage Range", format: "text" },
        ]
      },
    ]
  },

  // ======================== LAPTOP ========================
  LAPTOP: {
    icon: "laptop",
    sections: [
      {
        title: "Processor",
        fields: [
          { key: "processorManufacturer", label: "Manufacturer", format: "text" },
          { key: "processorModel", label: "Model", format: "text" },
          { key: "cores", label: "Cores", format: "number" },
          { key: "threads", label: "Threads", format: "number" },
        ]
      },
      {
        title: "Memory & Storage",
        fields: [
          { key: "memory.totalCapacityGB", label: "RAM", unit: "GB", format: "number" },
          { key: "storage.totalCapacityGB", label: "Storage", unit: "GB", format: "number" },
        ]
      },
      {
        title: "Display",
        fields: [
          { key: "screenSizeInches", label: "Screen Size", unit: '"', format: "number" },
          { key: "resolution", label: "Resolution", format: "text" },
          { key: "panelType", label: "Panel Type", format: "text" },
        ]
      },
      {
        title: "Graphics",
        fields: [
          { key: "graphicsType", label: "Graphics Type", format: "text" },
          { key: "graphicsModel", label: "Graphics Model", format: "text" },
        ]
      },
      {
        title: "Battery & Power",
        fields: [
          { key: "originalCapacitymAh", label: "Battery Capacity", unit: "mAh", format: "number" },
          { key: "chargerCapacityWatt", label: "Charger Capacity", unit: "W", format: "number" },
          { key: "fastChargingSupported", label: "Fast Charging", format: "boolean" },
        ]
      },
      {
        title: "Security Features",
        fields: [
          { key: "fingerprintScanner", label: "Fingerprint Scanner", format: "boolean" },
          { key: "faceRecognition", label: "Face Recognition", format: "boolean" },
          { key: "tpmVersion", label: "TPM Version", format: "text" },
          { key: "secureBootEnabled", label: "Secure Boot", format: "boolean" },
        ]
      },
    ]
  },

  // ======================== CAMERA ========================
  CAMERA: {
    icon: "videocam",
    sections: [
      {
        title: "Camera Specifications",
        fields: [
          { key: "cameraType", label: "Camera Type", format: "text" },
          { key: "resolution", label: "Resolution", format: "text" },
          { key: "frameRate", label: "Frame Rate", unit: "FPS", format: "number" },
          { key: "sensorType", label: "Sensor Type", format: "text" },
          { key: "fieldOfView", label: "Field of View", unit: "°", format: "number" },
          { key: "autoFocus", label: "Auto Focus", format: "boolean" },
        ]
      },
      {
        title: "Audio Features",
        fields: [
          { key: "builtInMicrophone", label: "Built-in Microphone", format: "boolean" },
          { key: "microphoneType", label: "Microphone Type", format: "text" },
          { key: "noiseReduction", label: "Noise Reduction", format: "boolean" },
        ]
      },
      {
        title: "Connectivity",
        fields: [
          { key: "connectionType", label: "Connection Type", format: "text" },
          { key: "cableLength", label: "Cable Length", unit: "m", format: "number" },
          { key: "plugAndPlay", label: "Plug & Play", format: "boolean" },
        ]
      },
      {
        title: "Physical Properties",
        fields: [
          { key: "mountType", label: "Mount Type", format: "text" },
          { key: "color", label: "Color", format: "text" },
          { key: "weight", label: "Weight", unit: "g", format: "number" },
        ]
      },
    ]
  },

  // ======================== PRINTER (EXAMPLE - UNCOMMENT TO USE) ========================
  // Uncomment this to enable Printer specs. This is just an example!
  /*
  PRINTER: {
    icon: "print",
    sections: [
      {
        title: "Basic Information",
        fields: [
          { key: "manufacturer", label: "Manufacturer", format: "text" },
          { key: "model", label: "Model", format: "text" },
          { key: "serialNumber", label: "Serial Number", format: "text" },
        ]
      },
      {
        title: "Print Specifications",
        fields: [
          { key: "colorPrinting", label: "Color Printing", format: "boolean" },
          { key: "maxPrintSpeedPPM", label: "Print Speed", unit: "PPM", format: "number" },
          { key: "maxPaperWidth", label: "Max Paper Width", unit: "mm", format: "number" },
        ]
      },
      {
        title: "Connectivity",
        fields: [
          { key: "wifiEnabled", label: "WiFi Enabled", format: "boolean" },
          { key: "networkPrinting", label: "Network Printing", format: "boolean" },
        ]
      },
    ]
  },
  */
};

/**
 * Custom list formatters for complex fields (arrays)
 * Maps listFormat types to rendering functions
 */
export const LIST_FORMATTERS = {
  ramModule: (modules) => {
    return modules.map((module, idx) => ({
      main: `${module.ramCapacityGB}GB ${module.ramType || 'N/A'}`,
      sub: `${module.ramSpeedMHz || 'N/A'}MHz ${module.ramManufacturer ? `- ${module.ramManufacturer}` : ''}`.trim(),
    }));
  },

  storageDrive: (drives) => {
    return drives.map((drive, idx) => ({
      main: `${drive.driveCapacityGB}GB ${drive.driveType || 'HDD'}`,
      sub: `${drive.driveInterfaceSpeed || 'N/A'} - ${drive.driveManufacturer || 'N/A'}`.trim(),
    }));
  },
};

/**
 * Helper function to get value from nested keys (e.g., "memory.totalCapacityGB")
 */
export const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

/**
 * Helper function to check if a field has data
 */
export const hasFieldData = (asset, fieldKey) => {
  const value = getNestedValue(asset, fieldKey);
  return value !== null && value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
};
