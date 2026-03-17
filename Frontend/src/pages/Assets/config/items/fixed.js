import { common } from "../common.js";
// @ts-ignore
import { fromGeneric } from "../sectionManager.js";

const toBoolEnabledDisabled = () => [
  { value: "Enabled", label: "Enabled" },
  { value: "Disabled", label: "Disabled" },
];

export const fixedConfigs = {
  //TODO  CPU Configuration
  cpu: {
    sections: [
      //! Basic Information
      fromGeneric("Basic Information", {
        // Example: hide description field coming from generic
        omitFields: ["itemDescription", "barcode","itemName","itemTag","itemCategory","itemType","brand","itemCondition",],
        // overrideFields: [{},{},{}  ],
        // addFields: [{},{},{}],
      }),
      //! Location Information
      fromGeneric("Location & Other Information",{
         omitFields: ["organization","rackNumber","rackUnit", "location", "floor", "room", "locationType", "building"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
        }),
      //! Operating System
      {
        sectionTitle: "Operating System",
        fields: [
          { name: "osName", label: "OS Name", placeholder: "e.g. Windows 10", type: "text", maxLength: 100 },
          { name: "osEdition", label: "OS Edition", placeholder: "e.g. Professional", type: "text", maxLength: 80 },
          { name: "osVersion", label: "OS Version", placeholder: "e.g. 10.0.19041", type: "text", maxLength: 40 },
          { name: "buildNumber", label: "Build Number", placeholder: "e.g. 19041", type: "text", maxLength: 40 },
          { name: "osLicenseKey", label: "OS License Key", placeholder: "e.g. XXXXX-XXXXX-XXXXX-XXXXX-XXXXX", type: "text", maxLength: 120 },
          { name: "activationStatus", label: "Activation Status", placeholder: "e.g. Licensed", type: "select", options: common.activationStatus },
          { name: "domain", label: "Domain / Workgroup", type: "select", options: common.domains },
        ],
      },
      //! Memory
      {
        sectionTitle: "Memory",
        fields: [
          { name: "ramManufacturer", placeholder: "e.g. Corsair", label: "Memory Manufacturer", type: "text", maxLength: 80 },
          { name: "ramModelNumber", placeholder: "e.g. Vengeance LPX", label: "Memory Part/Model Number", type: "text", maxLength: 100 },
          { name: "ramSerialNumber", placeholder: "e.g. 1234567890", label: "Memory Serial Number", type: "text", maxLength: 100 },
          { name: "ramCapacityGB", placeholder: "e.g. 16", label: "Memory Capacity (GB)", type: "number", min: 1, max: 512, required: true },
          {
            name: "ramType",
            label: "RAM Type",
            type: "select",
            options: [],
          },
          { name: "ramSpeedMHz", placeholder: "e.g. 3200", label: "Speed (MHz)", type: "number", min: 400, max: 1000000 },
          { name: "ramFormFactor", placeholder: "e.g. DIMM", label: "Form Factor", type: "text", maxLength: 40 },
          { name: "ramSlot", placeholder: "e.g. DIMM Slot 1", label: "Memory Slot", type: "text", maxLength: 40 },
          { name: "ramChannel", placeholder: "e.g. Channel 1", label: "Channel", type: "text", maxLength: 40 },
          
        ],
      },
      //! Processor
      {
        sectionTitle: "Processor",
        fields: [
          
          { 
            name: "cpuManufacturer", 
            label: "Processor Manufacturer",
            type: "select", 
            required: true, 
            options: [
              { value: "intel", label: "Intel" },
              { value: "amd", label: "AMD" },
              { value: "apple", label: "Apple" },

            ] },

            { 
            name: "cpuModel", 
            label: "Processor Series", 
            type: "select", 
            required: true, 
            options:[
              { value: "i9", label: "Intel Core i9", showIf: { cpuManufacturer: "intel" } },
              { value: "i7", label: "Intel Core i7", showIf: { cpuManufacturer: "intel" } },
              { value: "i5", label: "Intel Core i5", showIf: { cpuManufacturer: "intel" } },
              { value: "i3", label: "Intel Core i3", showIf: { cpuManufacturer: "intel" } },

              { value: "ryzen9", label: "AMD Ryzen 9", showIf: { cpuManufacturer: "amd" } },
              { value: "ryzen7", label: "AMD Ryzen 7", showIf: { cpuManufacturer: "amd" } },
              { value: "ryzen5", label: "AMD Ryzen 5", showIf: { cpuManufacturer: "amd" } },
              { value: "ryzen3", label: "AMD Ryzen 3", showIf: { cpuManufacturer: "amd" } },

              { value: "m3", label: "Apple M3", showIf: { cpuManufacturer: "apple" } },
              { value: "m2", label: "Apple M2", showIf: { cpuManufacturer: "apple" } },
              { value: "m1", label: "Apple M1", showIf: { cpuManufacturer: "apple" } },
              
            ] 
          
          },
          { name: "processorGeneration", placeholder: "e.g. 11", label: "Processor Generation", type: "number", min: 0, max: 10 },
          { name: "processorModel", placeholder: "e.g. i7-11800H", label: "Processor Model", type: "number", maxLength: 40 },
          { name: "cores", placeholder: "e.g. 8", label: "Number of Cores", type: "number", min: 1, max: 256 },
          { name: "threads", placeholder: "e.g. 16", label: "Number of Threads",  type: "number", min: 1, max: 512 },
          { name: "virtualizationEnabled", label: "Virtualization Enabled", type: "select", options: common.booleanOptions },
        ],
      },
      //! Storage
      {
        sectionTitle: "Storage",
        fields: [
          { name: "driveManufacturer", label: "Drive Manufacturer", placeholder: "e.g. Samsung", type: "text", maxLength: 80 },
          { name: "driveModelNumber", label: "Drive Model Number", placeholder: "e.g. M.2 SSD", type: "text", maxLength: 120 },
          { name: "driveSerial", label: "Serial Number", placeholder: "e.g. 1234567890", type: "text", maxLength: 120 },
          { name: "driveCapacityGB", label: "Capacity (GB)", placeholder: "e.g. 1000", type: "number", min: 1, max: 200000 },
          {
            name: "driveType",
            label: "Drive Type",
            type: "select",
            options: [],
          },
          { name: "driveInterfaceSpeed", label: "Interface Speed", placeholder: "e.g. PCIe 4.0", type: "text", maxLength: 40 },
          // { name: "driveSlot", label: "Slot Label", type: "text", maxLength: 40 },
          { name: "raidConfigured", label: "RAID Configured", type: "select", options: common.booleanOptions },
          { name: "encryptionEnabled", label: "Disk Encryption Enabled", type: "select", options: common.booleanOptions },
        ],
      },
      //! BIOS & Hardware
      {
        sectionTitle: "BIOS & Hardware",
        fields: [
          { name: "biosVersion", label: "BIOS Version", placeholder: "e.g. 1.00", type: "text", maxLength: 80 },
          { name: "biosDate", label: "BIOS Release Date", placeholder: "e.g. 2023-01-01", type: "date" },
          { name: "motherboardSerial", label: "Motherboard Serial Number", placeholder: "e.g. MB1234567890", type: "text", maxLength: 120 },
          { name: "hardwareUUID", label: "Hardware UUID", placeholder: "e.g. 12345678-1234-1234-1234-1234567890AB", type: "text", maxLength: 120 },
          { name: "tpmVersion", label: "TPM Version", placeholder: "e.g. 2.0", type: "text", maxLength: 40 },
          { name: "secureBootEnabled", label: "Secure Boot Enabled", type: "select", options: common.booleanOptions },
        ],
      },

      //! Graphics Card
      {
        sectionTitle: "Graphics Card",
        fields: [
          {name: "graphicCard", label: "Graphic Card", type: "select", options: common.booleanOptions, defaultValue: "No" },
          { name: "gpuManufacturer", placeholder: "e.g. NVIDIA", label: "Graphics Card Manufacturer", type: "text", maxLength: 80, showIf: { graphicCard: "Yes" } },
          { name: "gpuModelNumber", placeholder: "e.g. RTX 3060", label: "Graphics Card Model Number", type: "text", maxLength: 120, showIf: { graphicCard: "Yes" } },
          { name: "gpuSerialNumber", placeholder: "e.g. 1234567890", label: "Serial Number", type: "text", maxLength: 120, showIf: { graphicCard: "Yes" } },
          { name: "gpuCapacityGB", placeholder: "e.g. 6", label: "Capacity (GB)", type: "number", min: 1, max: 200000, showIf: { graphicCard: "Yes" } },
          {
            name: "gpuType",
            label: "Graphics Card Type",
            type: "select",
            options: [],
            showIf: { graphicCard: "Yes" },
          },
          { name: "gpuInterfaceSpeed", placeholder: "e.g. PCIe 4.0", label: "Interface Speed", type: "text", maxLength: 40, showIf: { graphicCard: "Yes" } },
        ],
      },

      //! Purchase Information
      fromGeneric("Purchase Information",{
         omitFields: ["taxAmount","totalAmount","currency"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      //! Warranty Information
      fromGeneric("Warranty Information",{
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),

      //! Item State
      fromGeneric("Item State",{
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      //! Network Details
      fromGeneric("Network Details",{
         omitFields: ["linkSpeedMbps",],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
    ],
  },
  //TODO  Monitor Configuration
  monitor: {
    sections: [
       //! Basic Information
      fromGeneric("Basic Information", {
        // Example: hide description field coming from generic
        omitFields: ["itemDescription", "barcode","itemName","itemTag","itemCategory","itemType","brand","itemCondition",],
        // overrideFields: [{},{},{}  ],
        // addFields: [{},{},{}],
      }),
      //! Location Information
      fromGeneric("Location & Other Information",{
         omitFields: ["graphicCard","organization","rackNumber","rackUnit", "location", "floor", "room", "locationType", "building"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
        }),
      //! Display Specifications
      {
        sectionTitle: "Display Specifications",
        fields: [
          { name: "screenSizeInches", placeholder: "e.g. 15.6", label: "Screen Size (Inches)", type: "number", min: 10, max: 150 },
          { name: "resolution", placeholder: "e.g. 1920x1080", label: "Resolution", type: "text", maxLength: 40 },
          { name: "panelType", placeholder: "e.g. IPS", label: "Panel Type (IPS/TN/VA/OLED)", type: "text", maxLength: 40 },
          { name: "refreshRateHz", placeholder: "e.g. 60", label: "Refresh Rate (Hz)", type: "number", min: 30, max: 500 },
          { name: "aspectRatio", placeholder: "e.g. 16:9", label: "Aspect Ratio", type: "text", maxLength: 20 },
          { name: "brightnessNits", placeholder: "e.g. 300", label: "Brightness (Nits)", type: "number", min: 100, max: 5000 },
          { name: "responseTimeMs", placeholder: "e.g. 1", label: "Response Time (ms)", type: "number", min: 1, max: 50 },
          { name: "curved", label: "Curved Display", type: "select", options: common.booleanOptions },
        ],
      },
      //! Ports & Connectivity
      {
        sectionTitle: "Ports & Connectivity",
        fields: [
          { name: "hdmiPorts", placeholder: "e.g. 2", label: "HDMI Ports", type: "number", min: 0, max: 10 },
          { name: "displayPort", placeholder: "e.g. 1", label: "DisplayPort Ports", type: "number", min: 0, max: 10 },
          { name: "vgaPort", label: "VGA Port Available", type: "select", options: common.booleanOptions },
          { name: "usbPorts", placeholder: "e.g. 4", label: "USB Ports", type: "number", min: 0, max: 20 },
          { name: "audioOut", label: "Audio Out Port", type: "select", options: common.booleanOptions },
          { name: "builtInSpeakers", label: "Built-in Speakers", type: "select", options: common.booleanOptions },
        ],
      },
      //! Power & Energy
      {
        sectionTitle: "Power & Energy",
        fields: [
          { name: "powerConsumptionWatt", placeholder: "e.g. 150", label: "Power Consumption (Watts)", type: "number", min: 1, max: 2000 },
          { name: "energyRating", placeholder: "e.g. A+", label: "Energy Rating", type: "text", maxLength: 20 },
          { name: "voltageRange", placeholder: "e.g. 12V", label: "Voltage Range", type: "text", maxLength: 40 },
        ],
      },
      
       //! Purchase Information
      fromGeneric("Purchase Information",{
         omitFields: ["taxAmount","totalAmount","currency"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      //! Warranty Information
      fromGeneric ("Warranty Information",{
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),

      //! Item State
      fromGeneric("Item State",{
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      
      
    ],
  },

  //TODO  Printer Configuration
  printer: {
    sections: [
      //! Basic Information
      fromGeneric("Basic Information", {
        // Example: hide description field coming from generic
        omitFields: ["itemDescription", "barcode","itemName","itemTag","itemCategory","itemType","brand","itemCondition",],
        // overrideFields: [{},{},{}  ],
        // addFields: [{},{},{}],
      }),
      //! Location Information
      fromGeneric("Location Information",{
         omitFields: ["organization","rackNumber","rackUnit", "location", "floor", "room", "locationType", "building"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
        }),

        //! Print Specifications
      {
        sectionTitle: "Print Specifications",
        fields: [
          { name: "printTechnology", label: "Print Technology", type: "select", options: common.printTechnologies },
          { name: "colorSupport", label: "Color Printing Supported", type: "select", options: common.booleanOptions },
          { name: "printSpeedPPM", placeholder: "e.g. 300", label: "Print Speed (PPM)", type: "number", min: 1, max: 500 },
          { name: "maxResolutionDPI", placeholder: "e.g. 600", label: "Max Resolution (DPI)", type: "number", min: 300, max: 9600 },
          { name: "monthlyDutyCycle", placeholder: "e.g. 5000", label: "Monthly Duty Cycle (Pages)", type: "number", min: 1000, max: 1000000 },
          { name: "recommendedMonthlyVolume", placeholder: "e.g. 10000", label: "Recommended Monthly Volume", type: "number", min: 1000, max: 500000 },
          { name: "duplexPrinting", label: "Duplex Printing Supported", type: "select", options: common.booleanOptions },
          { name: "networkSupport", label: "Network Support", type: "select", options: common.booleanOptions, defaultValue: "No" },
        ],
      },
      //! Item Lifecycle Status
       {
        sectionTitle: "Item Lifecycle Status",

        fields: [
          { name: "lifecycleStatus", label: "Lifecycle Status", type: "select", options: common.lifecycleStatus },
          { name: "operationalStatus", label: "Operational Status", type: "select", options: common.operationalStatus },
          { name: "totalPrintCount", placeholder: "e.g. 1000000", label: "Total Print Count", type: "number", min: 0, max: 100000000 },
          { name: "lastServiceDate", label: "Last Service Date", type: "date" },
          { name: "condition", label: "Physical Condition", type: "select", options: common.conditionStatus },
          
        ],
      },
      //! Scanner & Copier (If MFP)
      {
        sectionTitle: "Scanner & Copier (If MFP)",
        fields: [
          { name: "scannerAvailable",  label: "Scanner Available", type: "select", options: common.booleanOptions },
          { name: "scanResolutionDPI", placeholder: "e.g. 4800", label: "Scan Resolution (DPI)", type: "number", min: 300, max: 4800 },
          { name: "adfAvailable", label: "ADF Available", type: "select", options: common.booleanOptions },
          { name: "copySpeedCPM", placeholder: "e.g. 300", label: "Copy Speed (CPM)", type: "number", min: 1, max: 500 },
        ],
      },
      //! Cartridge / Toner Details
      {
        sectionTitle: "Cartridge / Toner Details",
        fields: [
          { name: "cartridgeModel", placeholder: "e.g. HP LaserJet", label: "Cartridge / Toner Model", type: "text", maxLength: 120 },
          { name: "cartridgeType", placeholder: "e.g. Black", label: "Cartridge Type (Black/Color)", type: "text", maxLength: 80 },
          { name: "yieldPages", placeholder: "e.g. 10000", label: "Cartridge Yield (Pages)", type: "number", min: 100, max: 100000 },
          { name: "lastCartridgeChangeDate", label: "Last Cartridge Change Date", type: "date" },
        ],
      },
      //!Network Details
      fromGeneric("Network Details",{
        showIf: { networkSupport: "Yes" },
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      
      //! Physical & Power
      {
        sectionTitle: "Physical & Power",
        fields: [
          { name: "color", placeholder: "e.g. Black", label: "Color", type: "text", maxLength: 40 },
          { name: "weightKg", placeholder: "e.g. 1.5", label: "Weight (Kg)", type: "number", min: 0, max: 200 },
          { name: "powerConsumptionWatt", placeholder: "e.g. 200", label: "Power Consumption (Watts)", type: "number", min: 10, max: 5000 },
          { name: "voltageRange", placeholder: "e.g. 220V", label: "Voltage Range", type: "text", maxLength: 40 },
        ],
      },
       //! Purchase Information
      fromGeneric("Purchase Information",{
         omitFields: ["taxAmount","totalAmount","currency"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),

       //! Warranty Information
      fromGeneric ("Warranty Information",{
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      //! Item State
      fromGeneric("Item State",{
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
     
    ],
  },
  
  //TODO  Laptop Configuration
  laptop: {
    sections: [
      //! Basic Information
      fromGeneric("Basic Information", {
        // Example: hide description field coming from generic
        omitFields: ["itemDescription", "barcode","itemName","itemTag","itemCategory","itemType","brand","itemCondition",],
        // overrideFields: [{},{},{}  ],
        // addFields: [{},{},{}],
      }),
      //! Location Information
      fromGeneric("Location Information",{
         omitFields: ["organization","rackNumber","rackUnit", "location", "floor", "room", "locationType", "building"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
        }),
      {
        sectionTitle: "Operating System",
        fields: [
          { name: "osName", placeholder: "e.g. Windows 10", label: "OS Name", type: "text", maxLength: 100 },
          { name: "osEdition", placeholder: "e.g. Professional", label: "OS Edition", type: "text", maxLength: 80 },
          { name: "osVersion", placeholder: "e.g. 10.0.19045", label: "OS Version", type: "text", maxLength: 40 },
          { name: "buildNumber", placeholder: "e.g. 19045", label: "Build Number", type: "text", maxLength: 40 },
          { name: "osLicenseKey", placeholder: "e.g. XXXXX-XXXXX-XXXXX-XXXXX-XXXXX", label: "OS License Key", type: "text", maxLength: 120 },
          { name: "activationStatus", label: "Activation Status", type: "select", options: common.activationStatus },
        ],
      },
      //! Memory
      {
        sectionTitle: "Memory",
        fields: [
          { name: "ramManufacturer", placeholder: "e.g. Corsair", label: "Memory Manufacturer", type: "text", maxLength: 80 },
          { name: "ramModelNumber", placeholder: "e.g. Vengeance LPX", label: "Memory Part/Model Number", type: "text", maxLength: 100 },
          { name: "ramSerialNumber", placeholder: "e.g. 1234567890", label: "Memory Serial Number", type: "text", maxLength: 100 },
          { name: "ramCapacityGB", placeholder: "e.g. 16", label: "Memory Capacity (GB)", type: "number", min: 1, max: 512, required: true },
          {
            name: "ramType",
            label: "RAM Type",
            type: "select",
            options: [],
          },
          { name: "ramSpeedMHz", placeholder: "e.g. 3200", label: "Speed (MHz)", type: "number", min: 400, max: 1000000 },
          { name: "ramFormFactor", placeholder: "e.g. DIMM", label: "Form Factor", type: "text", maxLength: 40 },
          { name: "ramSlot", placeholder: "e.g. DIMM Slot 1", label: "Memory Slot", type: "text", maxLength: 40 },
          { name: "ramChannel", placeholder: "e.g. Channel 1", label: "Channel", type: "text", maxLength: 40 },
          
        ],
      },
      //! Processor
      {
        sectionTitle: "Processor",
        fields: [
          
          { 
            name: "cpuManufacturer", 
            label: "Processor Manufacturer",
            type: "select", 
            required: true, 
            options: [
              { value: "intel", label: "Intel" },
              { value: "amd", label: "AMD" },
              { value: "apple", label: "Apple" },

            ] },

            { 
            name: "cpuModel", 
            label: "Processor Series", 
            type: "select", 
            required: true, 
            options:[
              { value: "i9", label: "Intel Core i9", showIf: { cpuManufacturer: "intel" } },
              { value: "i7", label: "Intel Core i7", showIf: { cpuManufacturer: "intel" } },
              { value: "i5", label: "Intel Core i5", showIf: { cpuManufacturer: "intel" } },
              { value: "i3", label: "Intel Core i3", showIf: { cpuManufacturer: "intel" } },

              { value: "ryzen9", label: "AMD Ryzen 9", showIf: { cpuManufacturer: "amd" } },
              { value: "ryzen7", label: "AMD Ryzen 7", showIf: { cpuManufacturer: "amd" } },
              { value: "ryzen5", label: "AMD Ryzen 5", showIf: { cpuManufacturer: "amd" } },
              { value: "ryzen3", label: "AMD Ryzen 3", showIf: { cpuManufacturer: "amd" } },

              { value: "m3", label: "Apple M3", showIf: { cpuManufacturer: "apple" } },
              { value: "m2", label: "Apple M2", showIf: { cpuManufacturer: "apple" } },
              { value: "m1", label: "Apple M1", showIf: { cpuManufacturer: "apple" } },
              
            ] 
          
          },
          { name: "processorGeneration", placeholder: "e.g. 11", label: "Processor Generation", type: "number", min: 0, max: 10 },
          { name: "processorModel", placeholder: "e.g. i7-11800H", label: "Processor Model", type: "number", maxLength: 40 },
          { name: "cores", placeholder: "e.g. 8", label: "Number of Cores", type: "number", min: 1, max: 256 },
          { name: "threads", placeholder: "e.g. 16", label: "Number of Threads",  type: "number", min: 1, max: 512 },
          { name: "virtualizationEnabled", label: "Virtualization Enabled", type: "select", options: common.booleanOptions },
        ],
      },
      //! Storage
      {
        sectionTitle: "Storage",
        fields: [
          { name: "driveManufacturer", label: "Drive Manufacturer", placeholder: "e.g. Samsung", type: "text", maxLength: 80 },
          { name: "driveModelNumber", label: "Drive Model Number", placeholder: "e.g. M.2 SSD", type: "text", maxLength: 120 },
          { name: "driveSerial", label: "Serial Number", placeholder: "e.g. 1234567890", type: "text", maxLength: 120 },
          { name: "driveCapacityGB", label: "Capacity (GB)", placeholder: "e.g. 1000", type: "number", min: 1, max: 200000 },
          {
            name: "driveType",
            label: "Drive Type",
            type: "select",
            options: [],
          },
          { name: "driveInterfaceSpeed", label: "Interface Speed", placeholder: "e.g. PCIe 4.0", type: "text", maxLength: 40 },
          // { name: "driveSlot", label: "Slot Label", type: "text", maxLength: 40 },
          { name: "raidConfigured", label: "RAID Configured", type: "select", options: common.booleanOptions },
          { name: "encryptionEnabled", label: "Disk Encryption Enabled", type: "select", options: common.booleanOptions },
        ],
      },

      //! Display & Graphics
      {
        sectionTitle: "Display & Graphics",
        fields: [
          { name: "screenSizeInches", label: "Screen Size (Inches)", type: "number", min: 10, max: 20 },
          { name: "resolution", label: "Resolution", type: "text", maxLength: 40 },
          { name: "panelType", label: "Panel Type (IPS/OLED)", type: "text", maxLength: 40 },
          { name: "graphicsType", label: "Graphics Type (Integrated/Dedicated)", type: "text", maxLength: 80 },
          { name: "graphicsModel", label: "Graphics Model", type: "text", maxLength: 100 },
        ],
      },
      {
        sectionTitle: "Battery & Power",
        fields: [
          { name: "batteryCapacityWh", label: "Battery Capacity (Wh)", type: "number", min: 10, max: 200 },
          { name: "batteryHealthPercent", label: "Battery Health (%)", type: "number", min: 0, max: 100 },
          { name: "batteryCycleCount", label: "Battery Cycle Count", type: "number", min: 0, max: 5000 },
          { name: "chargerSerial", label: "Charger Serial Number", type: "text", maxLength: 120 },
          { name: "fastChargingSupported", label: "Fast Charging Supported", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Security & Hardware",
        fields: [
          { name: "tpmVersion", label: "TPM Version", type: "text", maxLength: 40 },
          { name: "secureBootEnabled", label: "Secure Boot Enabled", type: "select", options: common.booleanOptions },
          { name: "fingerprintScanner", label: "Fingerprint Scanner", type: "select", options: common.booleanOptions },
          { name: "faceRecognition", label: "Face Recognition", type: "select", options: common.booleanOptions },
          { name: "hardwareUUID", label: "Hardware UUID", type: "text", maxLength: 120 },
        ],
      },
       //! Purchase Information
      fromGeneric("Purchase Information",{
         omitFields: ["taxAmount","totalAmount","currency"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      //! Item State
      fromGeneric("Item State",{
        //  omitFields: ["","",""],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
      }),
      {
        sectionTitle: "Item Lifecycle Status",
        fields: [
          { name: "lifecycleStatus", label: "Lifecycle Status", type: "select", options: common.lifecycleStatus },
          { name: "operationalStatus", label: "Operational Status", type: "select", options: common.operationalStatus },
          { name: "lastAuditDate", label: "Last Physical Audit Date", type: "date" },
          { name: "condition", label: "Physical Condition", type: "select", options: common.conditionStatus },
          { name: "remarks", label: "Remarks", type: "textarea", maxLength: 500 },
        ],
      },
    ],
  },

  //TODO Interactive Panel
  interactivePanel: {
    sections: [
      //! Basic Information
      fromGeneric("Basic Information", {
        // Example: hide description field coming from generic
        omitFields: ["itemDescription", "barcode","itemName","itemTag","itemCategory","itemType","brand","itemCondition",],
        // overrideFields: [{},{},{}  ],
        // addFields: [{},{},{}],
      }),
      //! Location Information
      fromGeneric("Location Information",{
         omitFields: ["organization","rackNumber","rackUnit", "location", "floor", "room", "locationType", "building"],
        //  overrideFields: [{},{},{},],
        //  addFields:[{},{},{},]
        }),
        //! Display Specifications
      {
        sectionTitle: "Display Specifications",
        fields: [
          { name: "resolution", label: "Resolution", type: "text", maxLength: 40 },
          { name: "aspectRatio", label: "Aspect Ratio", type: "text", maxLength: 40 },
          { name: "brightnessNits", label: "Brightness (Nits)", type: "number", min: 100, max: 1000 },
          { name: "contrastRatio", label: "Contrast Ratio", type: "text", maxLength: 40 },
          { name: "refreshRateHz", label: "Refresh Rate (Hz)", type: "number", min: 30, max: 240 },
          { name: "displayTechnology", label: "Display Technology", type: "select", options: common.displayTechnologies },
    
        ],
      },
      //! Touch & Interaction
      {
        sectionTitle: "Touch & Interaction",
        fields: [
          { name: "touchTechnology", label: "Touch Technology", type: "select", options: common.touchTechnologies },
          { name: "touchPoints", label: "Touch Points", type: "number", min: 1, max: 100 },
          { name: "stylusSupported", label: "Stylus Supported", type: "select", options: common.booleanOptions },
          { name: "gestureSupport", label: "Gesture Support", type: "select", options: common.booleanOptions },
          { name: "responseTimeMs", label: "Touch Response Time (ms)", type: "number", min: 1, max: 50 },
        ],
      },
      //! Operating System
      {
        sectionTitle: "Operating System",
        fields: [
          { name: "osName", label: "Operating System", type: "text", maxLength: 100 },
          { name: "osVersion", label: "OS Version", type: "text", maxLength: 40 },
          { name: "ramGB", label: "RAM (GB)", type: "number", min: 2, max: 64 },
          { name: "internalStorageGB", label: "Internal Storage (GB)", type: "number", min: 8, max: 1024 },
          { name: "cpuModel", label: "Processor Model", type: "text", maxLength: 120 },
        ],
      },
        
      {
        sectionTitle: "Audio & Camera",
        fields: [
          { name: "speakerPowerWatt", label: "Speaker Power (Watts)", type: "number", min: 5, max: 200 },
          { name: "builtInCamera", label: "Built-in Camera", type: "select", options: common.booleanOptions },
          { name: "cameraResolution", label: "Camera Resolution", type: "text", maxLength: 40 },
          { name: "microphoneArray", label: "Microphone Array", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Connectivity",
        fields: [
          { name: "wifiSupported", label: "WiFi Supported", type: "select", options: common.booleanOptions },
          { name: "bluetoothSupported", label: "Bluetooth Supported", type: "select", options: common.booleanOptions },
          { name: "ethernetPort", label: "Ethernet Port", type: "select", options: common.booleanOptions },
          { name: "hdmiPorts", label: "HDMI Ports", type: "number", min: 0, max: 10 },
          { name: "usbPorts", label: "USB Ports", type: "number", min: 0, max: 10 },
          { name: "displayPort", label: "Display Port Available", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Mounting & Physical Details",
        fields: [
          { name: "mountType", label: "Mount Type (Wall/Stand)", type: "select", options: common.mountTypes },
          { name: "weightKg", label: "Weight (Kg)", type: "number", min: 5, max: 200 },
          { name: "color", label: "Color", type: "text", maxLength: 40 },
          { name: "powerConsumptionWatt", label: "Power Consumption (Watts)", type: "number", min: 50, max: 1000 },
        ],
      },
      {
        sectionTitle: "Item Financial Details",
        fields: [
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 80 },
          { name: "serialNumber", label: "Serial Number", type: "text", required: true, maxLength: 120 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 120 },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "acquisitionDate", label: "Acquisition Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "amcAvailable", label: "AMC Available", type: "select", options: common.booleanOptions },
          { name: "amcExpiryDate", label: "AMC Expiry Date", type: "date" },
          { name: "depreciationMethod", label: "Depreciation Method", type: "select", options: common.depreciationMethods },
          { name: "usefulLifeYears", label: "Useful Life (Years)", type: "number", min: 1, max: 15 },
        ],
      },
      {
        sectionTitle: "Item Location & Assignment",
        fields: [
          { name: "branch", label: "Branch", type: "select", options: common.branches },
          { name: "building", label: "Building", type: "text", maxLength: 100 },
          { name: "floor", label: "Floor", type: "text", maxLength: 40 },
          { name: "room", label: "Room / Classroom", type: "text", maxLength: 80 },
          { name: "assignedDepartment", label: "Assigned Department", type: "text", maxLength: 80 },
          { name: "installationDate", label: "Installation Date", type: "date" },
        ],
      },
      {
        sectionTitle: "Item Lifecycle Status",
        fields: [
          { name: "lifecycleStatus", label: "Lifecycle Status", type: "select", options: common.lifecycleStatus },
          { name: "operationalStatus", label: "Operational Status", type: "select", options: common.operationalStatus },
          { name: "lastServiceDate", label: "Last Service Date", type: "date" },
          { name: "condition", label: "Physical Condition", type: "select", options: common.conditionStatus },
          { name: "remarks", label: "Remarks", type: "textarea", maxLength: 500 },
        ],
      },
    ],
  },
  //TODO  Tablet Configuration
  tablet: {
    sections: [
      {
        sectionTitle: "Item Basic Information",
        fields: [
          { name: "itemName", label: "Item Name", type: "text", required: true, maxLength: 120 },
          { name: "itemCategory", label: "Item Category", type: "select", options: common.itemCategories, required: true },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 100 },
          { name: "model", label: "Model", type: "text", required: true, maxLength: 100 },
          { name: "deviceType", label: "Device Type", type: "select", options: common.deviceTypes },
          { name: "formFactor", label: "Form Factor", type: "text", maxLength: 80 },
        ],
      },
      {
        sectionTitle: "Item Operating System",
        fields: [
          { name: "osName", label: "OS Name", type: "text", maxLength: 80 },
          { name: "osVersion", label: "OS Version", type: "text", maxLength: 40 },
          { name: "buildNumber", label: "Build Number", type: "text", maxLength: 40 },
          { name: "securityPatchLevel", label: "Security Patch Level", type: "text", maxLength: 40 },
          { name: "activationStatus", label: "Activation Status", type: "select", options: common.activationStatus },
        ],
      },
      {
        sectionTitle: "Hardware Specifications",
        fields: [
          { name: "cpuModel", label: "Processor Model", type: "text", maxLength: 120 },
          { name: "ramGB", label: "RAM (GB)", type: "number", min: 1, max: 32 },
          { name: "storageCapacityGB", label: "Storage Capacity (GB)", type: "number", min: 16, max: 2000 },
          { name: "storageType", label: "Storage Type", type: "select", options: common.storageTypes },
          { name: "gpuModel", label: "Graphics Processor", type: "text", maxLength: 100 },
        ],
      },
      {
        sectionTitle: "Display",
        fields: [
          { name: "screenSizeInches", label: "Screen Size (Inches)", type: "number", min: 5, max: 20 },
          { name: "resolution", label: "Resolution", type: "text", maxLength: 40 },
          { name: "panelType", label: "Panel Type", type: "text", maxLength: 40 },
          { name: "touchSupport", label: "Touch Support", type: "select", options: common.booleanOptions },
          { name: "stylusSupport", label: "Stylus Support", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Battery & Power",
        fields: [
          { name: "batteryCapacityMah", label: "Battery Capacity (mAh)", type: "number", min: 1000, max: 20000 },
          { name: "batteryHealthPercent", label: "Battery Health (%)", type: "number", min: 0, max: 100 },
          { name: "fastChargingSupported", label: "Fast Charging Supported", type: "select", options: common.booleanOptions },
          { name: "chargerType", label: "Charger Type", type: "text", maxLength: 80 },
          { name: "chargerSerial", label: "Charger Serial Number", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Connectivity",
        fields: [
          { name: "wifiSupported", label: "WiFi Supported", type: "select", options: common.booleanOptions },
          { name: "bluetoothVersion", label: "Bluetooth Version", type: "text", maxLength: 40 },
          { name: "cellularSupported", label: "Cellular Supported", type: "select", options: common.booleanOptions },
          { name: "simNumber", label: "SIM Number", type: "text", maxLength: 40 },
          { name: "imeiNumber", label: "IMEI Number", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
        ],
      },
      {
        sectionTitle: "Camera & Audio",
        fields: [
          { name: "frontCameraMP", label: "Front Camera (MP)", type: "number", min: 0, max: 50 },
          { name: "rearCameraMP", label: "Rear Camera (MP)", type: "number", min: 0, max: 200 },
          { name: "microphoneAvailable", label: "Microphone Available", type: "select", options: common.booleanOptions },
          { name: "speakerType", label: "Speaker Type", type: "text", maxLength: 80 },
        ],
      },
      {
        sectionTitle: "Security & Management",
        fields: [
          { name: "deviceEncryption", label: "Device Encryption Enabled", type: "select", options: common.booleanOptions },
          { name: "biometricSupport", label: "Biometric Support", type: "select", options: common.booleanOptions },
          { name: "mdmEnrolled", label: "MDM Enrolled", type: "select", options: common.booleanOptions },
          { name: "mdmPlatform", label: "MDM Platform", type: "text", maxLength: 80 },
          { name: "deviceUUID", label: "Device UUID", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Financial Details",
        fields: [
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 80 },
          { name: "serialNumber", label: "Serial Number", type: "text", required: true, maxLength: 120 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 120 },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 5000000 },
          { name: "acquisitionDate", label: "Acquisition Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "amcAvailable", label: "AMC Available", type: "select", options: common.booleanOptions },
          { name: "amcExpiryDate", label: "AMC Expiry Date", type: "date" },
          { name: "depreciationMethod", label: "Depreciation Method", type: "select", options: common.depreciationMethods },
          { name: "usefulLifeYears", label: "Useful Life (Years)", type: "number", min: 1, max: 10 },
        ],
      },
      {
        sectionTitle: "Item Location & Assignment",     
        fields: [
          { name: "branch", label: "Branch", type: "select", options: common.branches },
          { name: "building", label: "Building", type: "text", maxLength: 100 },
          { name: "floor", label: "Floor", type: "text", maxLength: 40 },
          { name: "room", label: "Room", type: "text", maxLength: 80 },
          { name: "assignedTo", label: "Assigned To (User ID)", type: "text", maxLength: 80 },
          { name: "assignmentDate", label: "Assignment Date", type: "date" },
        ],
      },
      {
        sectionTitle: "Item Lifecycle Status",  
        fields: [
          { name: "itemLifecycleStatus", label: "Item Lifecycle Status", type: "select", options: common.lifecycleStatus },
          { name: "operationalStatus", label: "Operational Status", type: "select", options: common.operationalStatus },
          { name: "lastAuditDate", label: "Last Physical Audit Date", type: "date" },
          { name: "condition", label: "Physical Condition", type: "select", options: common.conditionStatus },
          { name: "remarks", label: "Remarks", type: "textarea", maxLength: 500 },
        ],
      },
    ],
  },
  //TODO  Projector Configuration
  projector: {
    sections: [
      {
        sectionTitle: "Item Basic Information",
        fields: [
          { name: "itemName", label: "Item Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "itemManufacturer", label: "Item Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "projectorType",
            label: "Projector Type",
            type: "select",
            options: [
              { value: "DLP", label: "DLP" },
              { value: "LCD", label: "LCD" },
              { value: "LED", label: "LED" },
              { value: "Laser", label: "Laser" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Display Specifications",
        fields: [
          { name: "nativeResolution", label: "Native Resolution", type: "text", maxLength: 40 },
          { name: "brightness", label: "Brightness (Lumens)", type: "number", min: 0, max: 20000 },
          { name: "contrastRatio", label: "Contrast Ratio", type: "text", maxLength: 40 },
          { name: "aspectRatio", label: "Aspect Ratio", type: "text", maxLength: 20 },
          { name: "projectionSize", label: "Projection Size Range (inches)", type: "text", maxLength: 60 },
        ],
      },
      {
        sectionTitle: "Lamp Details",
        fields: [
          {
            name: "lampType",
            label: "Lamp Type",
            type: "select",
            options: [
              { value: "UHP", label: "UHP" },
              { value: "LED", label: "LED" },
              { value: "Laser", label: "Laser" },
            ],
          },
          { name: "lampLifeHours", label: "Lamp Life (Hours)", type: "number", min: 0, max: 100000 },
          { name: "lampUsedHours", label: "Lamp Used Hours", type: "number", min: 0, max: 100000 },
          { name: "lampReplacementDate", label: "Last Lamp Replacement Date", type: "date" },
        ],
      },
      {
        sectionTitle: "Connectivity",
        fields: [
          { name: "hdmiPorts", label: "HDMI Ports", type: "number", min: 0, max: 10 },
          { name: "vgaPorts", label: "VGA Ports", type: "number", min: 0, max: 10 },
          { name: "usbPorts", label: "USB Ports", type: "number", min: 0, max: 10 },
          { name: "wifiSupport", label: "WiFi Support", type: "select", options: common.booleanOptions },
          { name: "bluetoothSupport", label: "Bluetooth Support", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Audio",
        fields: [
          { name: "builtInSpeaker", label: "Built-in Speaker", type: "select", options: common.booleanOptions },
          { name: "speakerPower", label: "Speaker Power (W)", type: "number", min: 0, max: 200 },
        ],
      },
      {
        sectionTitle: "Installation Details",
        fields: [
          {
            name: "mountType",
            label: "Mount Type",
            type: "select",
            options: [
              { value: "Ceiling", label: "Ceiling" },
              { value: "Table", label: "Table" },
              { value: "Wall", label: "Wall" },
              { value: "Portable", label: "Portable" },
            ],
          },
          { name: "installationDate", label: "Installation Date", type: "date" },
          { name: "roomLocation", label: "Room / Hall Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "assignedTo", label: "Assigned To", type: "text", maxLength: 120 },
          { name: "stateComments", label: "Comments", type: "textarea", maxLength: 400 },
        ],
      },
      {
        sectionTitle: "Maintenance",
        fields: [
          { name: "lastServiceDate", label: "Last Service Date", type: "date" },
          { name: "nextServiceDate", label: "Next Service Date", type: "date" },
          { name: "serviceVendor", label: "Service Vendor", type: "text", maxLength: 120 },
        ],
      },
    ],
  },
  //TODO  Network Switch Configuration
  networkSwitch: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Switch Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "switchType",
            label: "Switch Type",
            type: "select",
            options: [
              { value: "Unmanaged", label: "Unmanaged" },
              { value: "Managed", label: "Managed" },
              { value: "Smart", label: "Smart / Web Managed" },
              { value: "Layer2", label: "Layer 2" },
              { value: "Layer3", label: "Layer 3" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Port Configuration",
        fields: [
          { name: "totalPorts", label: "Total Ports", type: "number", min: 1, max: 128 },
          { name: "gigabitPorts", label: "Gigabit Ethernet Ports", type: "number", min: 0, max: 128 },
          { name: "tenGigPorts", label: "10G Ports", type: "number", min: 0, max: 32 },
          { name: "sfpPorts", label: "SFP Ports", type: "number", min: 0, max: 32 },
          { name: "sfpPlusPorts", label: "SFP+ Ports", type: "number", min: 0, max: 32 },
          { name: "poeSupport", label: "PoE Support", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Performance",
        fields: [
          { name: "switchingCapacity", label: "Switching Capacity (Gbps)", type: "number", min: 0, max: 10000 },
          { name: "forwardingRate", label: "Forwarding Rate (Mpps)", type: "number", min: 0, max: 10000 },
          { name: "macAddressTable", label: "MAC Address Table Size", type: "number", min: 0, max: 200000 },
          { name: "vlanSupport", label: "VLAN Support", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Network Configuration",
        fields: [
          { name: "managementIP", label: "Management IP Address", type: "text", maxLength: 40 },
          { name: "subnetMask", label: "Subnet Mask", type: "text", maxLength: 40 },
          { name: "defaultGateway", label: "Default Gateway", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "firmwareVersion", label: "Firmware Version", type: "text", maxLength: 80 },
          {
            name: "managementInterface",
            label: "Management Interface",
            type: "select",
            options: [
              { value: "Web UI", label: "Web UI" },
              { value: "CLI", label: "CLI" },
              { value: "SNMP", label: "SNMP" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Physical Information",
        fields: [
          { name: "rackMountable", label: "Rack Mountable", type: "select", options: common.booleanOptions },
          { name: "rackUnit", label: "Rack Unit (U)", type: "number", min: 1, max: 10 },
          { name: "powerConsumption", label: "Power Consumption (Watts)", type: "number", min: 0, max: 2000 },
          {
            name: "coolingType",
            label: "Cooling Type",
            type: "select",
            options: [
              { value: "Passive", label: "Passive" },
              { value: "Fan", label: "Fan" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "state", label: "State", type: "select", options: common.status },
          { name: "stateComments", label: "State Comments", type: "textarea", maxLength: 400 },
        ],
      },
      {
        sectionTitle: "Maintenance",
        fields: [
          { name: "lastServiceDate", label: "Last Service Date", type: "date" },
          { name: "nextServiceDate", label: "Next Service Date", type: "date" },
          { name: "serviceVendor", label: "Service Vendor", type: "text", maxLength: 120 },
        ],
      },
    ],
  },
  //TODO  Router Configuration
  router: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Router Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "routerType",
            label: "Router Type",
            type: "select",
            options: [
              { value: "Wired", label: "Wired Router" },
              { value: "Wireless", label: "Wireless Router" },
              { value: "Core", label: "Core Router" },
              { value: "Edge", label: "Edge Router" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Interface Configuration",
        fields: [
          { name: "wanPorts", label: "WAN Ports", type: "number", min: 0, max: 10 },
          { name: "lanPorts", label: "LAN Ports", type: "number", min: 0, max: 32 },
          { name: "usbPorts", label: "USB Ports", type: "number", min: 0, max: 10 },
          { name: "sfpPorts", label: "SFP Ports", type: "number", min: 0, max: 16 },
          { name: "poeSupport", label: "PoE Support", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Network Configuration",
        fields: [
          { name: "wanIPAddress", label: "WAN IP Address", type: "text", maxLength: 40 },
          { name: "lanIPAddress", label: "LAN IP Address", type: "text", maxLength: 40 },
          { name: "subnetMask", label: "Subnet Mask", type: "text", maxLength: 40 },
          { name: "defaultGateway", label: "Default Gateway", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "dhcpServer", label: "DHCP Server Enabled", type: "select", options: common.booleanOptions },
          { name: "dnsServer", label: "DNS Server", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Wireless Configuration",
        fields: [
          { name: "wifiSupport", label: "WiFi Support", type: "select", options: common.booleanOptions },
          {
            name: "wifiStandard",
            label: "WiFi Standard",
            type: "select",
            options: [
              { value: "802.11n", label: "802.11n" },
              { value: "802.11ac", label: "802.11ac" },
              { value: "802.11ax", label: "802.11ax (WiFi 6)" },
            ],
          },
          {
            name: "frequencyBands",
            label: "Frequency Bands",
            type: "select",
            options: [
              { value: "2.4GHz", label: "2.4 GHz" },
              { value: "5GHz", label: "5 GHz" },
              { value: "Dual Band", label: "Dual Band" },
            ],
          },
          { name: "maxWirelessSpeed", label: "Max Wireless Speed (Mbps)", type: "number", min: 0, max: 10000 },
        ],
      },
      {
        sectionTitle: "Performance",
        fields: [
          { name: "routingCapacity", label: "Routing Capacity (Gbps)", type: "number", min: 0, max: 10000 },
          { name: "vpnSupport", label: "VPN Support", type: "select", options: common.booleanOptions },
          { name: "firewallSupport", label: "Firewall", type: "select", options: common.booleanOptions },
          { name: "firmwareVersion", label: "Firmware Version", type: "text", maxLength: 80 },
        ],
      },
      {
        sectionTitle: "Physical Information",
        fields: [
          { name: "rackMountable", label: "Rack Mountable", type: "select", options: common.booleanOptions },
          { name: "rackUnit", label: "Rack Unit (U)", type: "number", min: 1, max: 10 },
          { name: "powerConsumption", label: "Power Consumption (Watts)", type: "number", min: 0, max: 2000 },
          {
            name: "coolingType",
            label: "Cooling Type",
            type: "select",
            options: [
              { value: "Passive", label: "Passive" },
              { value: "Fan", label: "Fan" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "state", label: "State", type: "select", options: common.status },
          { name: "stateComments", label: "State Comments", type: "textarea", maxLength: 400 },
        ],
      },
      {
        sectionTitle: "Maintenance",
        fields: [
          { name: "lastServiceDate", label: "Last Service Date", type: "date" },
          { name: "nextServiceDate", label: "Next Service Date", type: "date" },
          { name: "serviceVendor", label: "Service Vendor", type: "text", maxLength: 120 },
        ],
      },
    ],
  },
  //TODO  Barcode Printer Configuration
  barcodePrinter: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Printer Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "printerType",
            label: "Printer Type",
            type: "select",
            options: [
              { value: "Thermal", label: "Thermal" },
              { value: "Direct Thermal", label: "Direct Thermal" },
              { value: "Thermal Transfer", label: "Thermal Transfer" },
              { value: "Inkjet", label: "Inkjet" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Print Specifications",
        fields: [
          { name: "printResolution", label: "Print Resolution (DPI)", type: "number", min: 100, max: 1200 },
          { name: "printSpeed", label: "Print Speed (mm/sec)", type: "number", min: 0, max: 1000 },
          { name: "maxPrintWidth", label: "Maximum Print Width (mm)", type: "number", min: 0, max: 500 },
          { name: "maxPrintLength", label: "Maximum Print Length (mm)", type: "number", min: 0, max: 2000 },
          { name: "supportedBarcodeFormats", label: "Supported Barcode Formats", type: "text", maxLength: 200 },
        ],
      },
      {
        sectionTitle: "Media Handling",
        fields: [
          {
            name: "mediaType",
            label: "Media Type",
            type: "select",
            options: [
              { value: "Labels", label: "Labels" },
              { value: "Tags", label: "Tags" },
              { value: "Wristbands", label: "Wristbands" },
            ],
          },
          { name: "labelWidth", label: "Label Width (mm)", type: "number", min: 0, max: 500 },
          { name: "labelLength", label: "Label Length (mm)", type: "number", min: 0, max: 2000 },
          { name: "ribbonSupport", label: "Ribbon Support", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Connectivity",
        fields: [
          { name: "usb", label: "USB", type: "select", options: common.booleanOptions },
          { name: "ethernet", label: "Ethernet", type: "select", options: common.booleanOptions },
          { name: "wifi", label: "WiFi", type: "select", options: common.booleanOptions },
          { name: "bluetooth", label: "Bluetooth", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Network Details",
        fields: [
          { name: "ipAddress", label: "IP Address", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "firmwareVersion", label: "Firmware Version", type: "text", maxLength: 80 },
          { name: "hostname", label: "Hostname", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "state", label: "State", type: "select", options: common.status },
          { name: "stateComments", label: "State Comments", type: "textarea", maxLength: 400 },
        ],
      },
      {
        sectionTitle: "Maintenance",
        fields: [
          { name: "lastServiceDate", label: "Last Service Date", type: "date" },
          { name: "nextServiceDate", label: "Next Service Date", type: "date" },
          { name: "serviceVendor", label: "Service Vendor", type: "text", maxLength: 120 },
        ],
      },
    ],
  },
  //TODO  Barcode Scanner Configuration
  barcodeScanner: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Scanner Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "scannerType",
            label: "Scanner Type",
            type: "select",
            options: [
              { value: "Handheld", label: "Handheld" },
              { value: "Fixed Mount", label: "Fixed Mount" },
              { value: "Wireless", label: "Wireless" },
              { value: "Presentation", label: "Presentation" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Scanning Specifications",
        fields: [
          {
            name: "scanTechnology",
            label: "Scan Technology",
            type: "select",
            options: [
              { value: "Laser", label: "Laser" },
              { value: "CCD", label: "CCD" },
              { value: "Imager", label: "Imager" },
            ],
          },
          { name: "supportedBarcodeTypes", label: "Supported Barcode Types", type: "text", maxLength: 200 },
          { name: "scanSpeed", label: "Scan Speed (scans/sec)", type: "number", min: 0, max: 10000 },
          { name: "scanDistance", label: "Scan Distance (cm)", type: "number", min: 0, max: 200 },
          { name: "scanAngle", label: "Scan Angle", type: "text", maxLength: 80 },
        ],
      },
      {
        sectionTitle: "Connectivity",
        fields: [
          {
            name: "connectionType",
            label: "Connection Type",
            type: "select",
            options: [
              { value: "USB", label: "USB" },
              { value: "Bluetooth", label: "Bluetooth" },
              { value: "WiFi", label: "WiFi" },
              { value: "Serial", label: "Serial (RS232)" },
            ],
          },
          {
            name: "interface",
            label: "Interface",
            type: "select",
            options: [
              { value: "Keyboard Wedge", label: "Keyboard Wedge" },
              { value: "HID", label: "HID" },
              { value: "Virtual COM", label: "Virtual COM" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Battery Details",
        fields: [
          { name: "batteryPowered", label: "Battery Powered", type: "select", options: common.booleanOptions },
          { name: "batteryType", label: "Battery Type", type: "text", maxLength: 80 },
          { name: "batteryCapacity", label: "Battery Capacity (mAh)", type: "number", min: 0, max: 20000 },
          { name: "batteryLife", label: "Battery Life (hours)", type: "number", min: 0, max: 1000 },
        ],
      },
      {
        sectionTitle: "Physical Information",
        fields: [
          { name: "color", label: "Color", type: "text", maxLength: 40 },
          { name: "weight", label: "Weight (grams)", type: "number", min: 0, max: 2000 },
          { name: "cableLength", label: "Cable Length (meters)", type: "number", min: 0, max: 10 },
          { name: "ipRating", label: "IP Rating (Dust/Water Protection)", type: "text", maxLength: 20 },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "state", label: "State", type: "select", options: common.status },
          { name: "stateComments", label: "State Comments", type: "textarea", maxLength: 400 },
        ],
      },
      {
        sectionTitle: "Maintenance",
        fields: [
          { name: "lastServiceDate", label: "Last Service Date", type: "date" },
          { name: "nextServiceDate", label: "Next Service Date", type: "date" },
          { name: "serviceVendor", label: "Service Vendor", type: "text", maxLength: 120 },
        ],
      },
    ],
  },
  //TODO  Scanner Configuration
  scanner: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Scanner Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "scannerType",
            label: "Scanner Type",
            type: "select",
            options: [
              { value: "Flatbed", label: "Flatbed" },
              { value: "Sheetfed", label: "Sheet-fed" },
              { value: "Handheld", label: "Handheld" },
              { value: "ADF", label: "ADF Scanner" },
              { value: "Drum", label: "Drum Scanner" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Scan Specifications",
        fields: [
          { name: "scanResolution", label: "Max Resolution (DPI)", type: "number", min: 0, max: 10000 },
          { name: "colorSupport", label: "Color Support", type: "select", options: common.booleanOptions },
          { name: "scanSpeed", label: "Scan Speed (ppm)", type: "number", min: 0, max: 1000 },
          { name: "adfCapacity", label: "ADF Capacity (Sheets)", type: "number", min: 0, max: 1000 },
        ],
      },
      {
        sectionTitle: "Software & Drivers",
        fields: [
          { name: "driverSupport", label: "Driver Support", type: "text", maxLength: 120 },
          { name: "softwareBundle", label: "Scanning Software", type: "text", maxLength: 120 },
          { name: "supportedOS", label: "Supported OS", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Connectivity",
        fields: [
          { name: "ipAddress", label: "IP Address", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "networkType", label: "Network Type", type: "select", options: common.networks },
          { name: "hostname", label: "Hostname", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "acquisitionDate", label: "Acquisition Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "state", label: "State", type: "select", options: common.status },
          { name: "stateComments", label: "State Comments", type: "textarea", maxLength: 400 },
        ],
      },
    ],
  },
  //TODO  Firewall Configuration
  firewall: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Firewall Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "firewallType",
            label: "Firewall Type",
            type: "select",
            options: [
              { value: "Hardware", label: "Hardware Firewall" },
              { value: "Virtual", label: "Virtual Firewall" },
              { value: "Cloud", label: "Cloud Firewall" },
            ],
          },
          {
            name: "deploymentMode",
            label: "Deployment Mode",
            type: "select",
            options: [
              { value: "Routed", label: "Routed Mode" },
              { value: "Transparent", label: "Transparent Mode" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Hardware Specifications",
        fields: [
          { name: "cpu", label: "CPU / Processor", type: "text", maxLength: 80 },
          { name: "ram", label: "RAM", type: "text", maxLength: 40 },
          { name: "storage", label: "Storage", type: "text", maxLength: 40 },
          { name: "portCount", label: "Total Network Ports", type: "number", min: 1, max: 128 },
          {
            name: "portType",
            label: "Port Type",
            type: "select",
            options: [
              { value: "RJ45", label: "RJ45" },
              { value: "SFP", label: "SFP" },
              { value: "SFP+", label: "SFP+" },
              { value: "Mixed", label: "Mixed" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Performance",
        fields: [
          { name: "throughput", label: "Firewall Throughput (Gbps)", type: "number", min: 0, max: 1000 },
          { name: "vpnThroughput", label: "VPN Throughput (Gbps)", type: "number", min: 0, max: 1000 },
          { name: "maxSessions", label: "Maximum Concurrent Sessions", type: "number", min: 0, max: 100000000 },
          { name: "ipsThroughput", label: "IPS Throughput (Gbps)", type: "number", min: 0, max: 1000 },
        ],
      },
      {
        sectionTitle: "Firmware & Software",
        fields: [
          { name: "firmwareVersion", label: "Firmware Version", type: "text", maxLength: 40 },
          { name: "osName", label: "Firewall OS", type: "text", maxLength: 80 },
          { name: "osVersion", label: "OS Version", type: "text", maxLength: 40 },
          {
            name: "licenseType",
            label: "License Type",
            type: "select",
            options: [
              { value: "Perpetual", label: "Perpetual" },
              { value: "Subscription", label: "Subscription" },
              { value: "Trial", label: "Trial" },
            ],
          },
          { name: "licenseExpiry", label: "License Expiry Date", type: "date" },
        ],
      },
      {
        sectionTitle: "Network Configuration",
        fields: [
          { name: "managementIP", label: "Management IP Address", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "hostname", label: "Hostname", type: "text", maxLength: 120 },
          { name: "defaultGateway", label: "Default Gateway", type: "text", maxLength: 80 },
          { name: "network", label: "Network", type: "select", options: common.networks },
          { name: "dhcpEnabled", label: "DHCP Enabled", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Security Features",
        fields: [
          { name: "vpnSupport", label: "VPN Support", type: "select", options: common.booleanOptions },
          {
            name: "idsIps",
            label: "IDS / IPS",
            type: "select",
            options: [
              { value: "Supported", label: "Supported" },
              { value: "Not Supported", label: "Not Supported" },
            ],
          },
          { name: "contentFiltering", label: "Content Filtering", type: "select", options: toBoolEnabledDisabled() },
          { name: "antivirus", label: "Gateway Antivirus", type: "select", options: toBoolEnabledDisabled() },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "acquisitionDate", label: "Acquisition Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "condition", label: "Condition", type: "select", options: common.conditionStatus },
          { name: "stateComments", label: "Comments", type: "textarea", maxLength: 400 },
        ],
      },
    ],
  },
  //TODO  Biometric Device Configuration
  biometricDevice: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Device Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "deviceType",
            label: "Device Type",
            type: "select",
            options: [
              { value: "Fingerprint", label: "Fingerprint" },
              { value: "Face Recognition", label: "Face Recognition" },
              { value: "Card + Fingerprint", label: "Card + Fingerprint" },
              { value: "Card + Face", label: "Card + Face" },
              { value: "Multi-Biometric", label: "Multi-Biometric" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Hardware Specifications",
        fields: [
          { name: "cpu", label: "Processor", type: "text", maxLength: 80 },
          { name: "memory", label: "Memory", type: "text", maxLength: 40 },
          { name: "storage", label: "Storage", type: "text", maxLength: 40 },
          { name: "displaySize", label: "Display Size (inches)", type: "number", min: 0, max: 20 },
          { name: "camera", label: "Camera", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Biometric Capacity",
        fields: [
          { name: "fingerprintCapacity", label: "Fingerprint Capacity", type: "number", min: 0, max: 100000 },
          { name: "faceCapacity", label: "Face Capacity", type: "number", min: 0, max: 100000 },
          { name: "cardCapacity", label: "Card Capacity", type: "number", min: 0, max: 100000 },
          { name: "logCapacity", label: "Log Storage Capacity", type: "number", min: 0, max: 1000000 },
        ],
      },
      {
        sectionTitle: "Connectivity",
        fields: [
          {
            name: "networkType",
            label: "Network Type",
            type: "select",
            options: [
              { value: "LAN", label: "LAN" },
              { value: "WiFi", label: "WiFi" },
              { value: "LAN + WiFi", label: "LAN + WiFi" },
            ],
          },
          {
            name: "communicationPort",
            label: "Communication Port",
            type: "select",
            options: [
              { value: "TCP/IP", label: "TCP/IP" },
              { value: "RS232", label: "RS232" },
              { value: "RS485", label: "RS485" },
              { value: "USB", label: "USB" },
            ],
          },
          { name: "ipAddress", label: "IP Address", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "hostname", label: "Hostname", type: "text", maxLength: 120 },
          { name: "network", label: "Network", type: "select", options: common.networks },
        ],
      },
      {
        sectionTitle: "Firmware & Software",
        fields: [
          { name: "firmwareVersion", label: "Firmware Version", type: "text", maxLength: 40 },
          { name: "sdkVersion", label: "SDK Version", type: "text", maxLength: 40 },
          { name: "softwareIntegration", label: "Integrated Software", type: "text", maxLength: 120 },
          {
            name: "timeSync",
            label: "Time Synchronization",
            type: "select",
            options: [
              { value: "NTP", label: "NTP Server" },
              { value: "Manual", label: "Manual" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Power Details",
        fields: [
          {
            name: "powerType",
            label: "Power Type",
            type: "select",
            options: [
              { value: "Adapter", label: "Adapter" },
              { value: "PoE", label: "PoE" },
              { value: "Adapter + Battery", label: "Adapter + Battery" },
            ],
          },
          { name: "voltage", label: "Voltage", type: "text", maxLength: 40 },
          { name: "batteryBackup", label: "Battery Backup", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "acquisitionDate", label: "Acquisition Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "condition", label: "Condition", type: "select", options: common.conditionStatus },
          { name: "stateComments", label: "Comments", type: "textarea", maxLength: 400 },
        ],
      },
    ],
  },
  //TODO  NAS Storage Configuration
  nasStorage: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Device Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "nasType",
            label: "NAS Type",
            type: "select",
            options: [
              { value: "Desktop", label: "Desktop NAS" },
              { value: "Rackmount", label: "Rackmount NAS" },
            ],
          },
          { name: "bayCount", label: "Drive Bays", type: "number", min: 1, max: 60 },
        ],
      },
      {
        sectionTitle: "Processor",
        fields: [
          { name: "cpuModel", label: "CPU Model", type: "text", maxLength: 120 },
          { name: "cpuManufacturer", label: "CPU Manufacturer", type: "text", maxLength: 80 },
          { name: "cores", label: "CPU Cores", type: "number", min: 1, max: 64 },
          { name: "clockSpeedGHz", label: "Clock Speed (GHz)", type: "number", min: 0, max: 10 },
        ],
      },
      {
        sectionTitle: "Memory",
        fields: [
          { name: "ramInstalled", label: "Installed RAM", type: "text", maxLength: 40 },
          {
            name: "ramType",
            label: "RAM Type",
            type: "select",
            options: [
              { value: "DDR3", label: "DDR3" },
              { value: "DDR4", label: "DDR4" },
              { value: "DDR5", label: "DDR5" },
              { value: "ECC", label: "ECC RAM" },
            ],
          },
          { name: "maxRamSupported", label: "Max RAM Supported", type: "text", maxLength: 40 },
        ],
      },
      {
        sectionTitle: "Storage Configuration",
        fields: [
          {
            name: "diskType",
            label: "Disk Type",
            type: "select",
            options: [
              { value: "HDD", label: "HDD" },
              { value: "SSD", label: "SSD" },
              { value: "NVMe", label: "NVMe" },
            ],
          },
          { name: "diskCount", label: "Installed Disks", type: "number", min: 0, max: 60 },
          { name: "diskCapacityTB", label: "Disk Capacity (TB)", type: "number", min: 0, max: 1000 },
          { name: "totalStorage", label: "Total Storage (TB)", type: "number", min: 0, max: 10000 },
          {
            name: "raidLevel",
            label: "RAID Level",
            type: "select",
            options: [
              { value: "RAID0", label: "RAID 0" },
              { value: "RAID1", label: "RAID 1" },
              { value: "RAID5", label: "RAID 5" },
              { value: "RAID6", label: "RAID 6" },
              { value: "RAID10", label: "RAID 10" },
              { value: "SHR", label: "Synology Hybrid RAID" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Network Interfaces",
        fields: [
          { name: "nicCount", label: "Number of LAN Ports", type: "number", min: 1, max: 16 },
          {
            name: "nicSpeed",
            label: "NIC Speed",
            type: "select",
            options: [
              { value: "1GbE", label: "1 GbE" },
              { value: "2.5GbE", label: "2.5 GbE" },
              { value: "10GbE", label: "10 GbE" },
            ],
          },
          { name: "ipAddress", label: "IP Address", type: "text", maxLength: 40 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "hostname", label: "Hostname", type: "text", maxLength: 120 },
          { name: "network", label: "Network", type: "select", options: common.networks },
        ],
      },
      {
        sectionTitle: "Services & Features",
        fields: [
          { name: "fileProtocols", label: "Supported Protocols", type: "text", maxLength: 120 },
          { name: "snapshotSupport", label: "Snapshot Support", type: "select", options: common.booleanOptions },
          {
            name: "virtualizationSupport",
            label: "Virtualization Support",
            type: "select",
            options: [
              { value: "VMware", label: "VMware" },
              { value: "Hyper-V", label: "Hyper-V" },
              { value: "Both", label: "Both" },
              { value: "None", label: "None" },
            ],
          },
          { name: "backupSoftware", label: "Backup Software", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Power & Physical",
        fields: [
          { name: "powerSupplyCount", label: "Power Supply Units", type: "number", min: 1, max: 4 },
          { name: "redundantPower", label: "Redundant Power Supply", type: "select", options: common.booleanOptions },
          { name: "rackUnit", label: "Rack Unit (U)", type: "number", min: 1, max: 10 },
        ],
      },
      {
        sectionTitle: "Item Details",
        fields: [
          { name: "itemSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "acquisitionDate", label: "Acquisition Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
          { name: "rackLocation", label: "Rack Location", type: "text", maxLength: 80 },
        ],
      },
      {
        sectionTitle: "Item Status",
        fields: [
          { name: "itemStatus", label: "Item Status", type: "select", options: common.status },
          { name: "condition", label: "Condition", type: "select", options: common.conditionStatus },
          { name: "stateComments", label: "Comments", type: "textarea", maxLength: 400 },
        ],
      },
    ],
  },
};

