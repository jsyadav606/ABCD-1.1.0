# Adding New Asset Types to Specifications

## Overview
The specifications system is **100% configuration-driven**. To add a new asset type, you **only need to edit the config file** - no React component changes required!

## Quick Start: Add a New Asset Type in 2 Minutes

### Step 1: Open the Config File
Go to: `Frontend/src/pages/Assets/config/assetSpecsConfig.js`

### Step 2: Add Your Asset Type
Copy-paste this template and customize:

```javascript
PRINTER: {
  icon: "print",  // Material Icon name
  sections: [
    {
      title: "Print Specifications",
      fields: [
        { key: "printTechnology", label: "Print Technology", format: "text" },
        { key: "maxPrintSpeedPPM", label: "Max Print Speed", format: "number", unit: "PPM" },
        { key: "maxResolutionDPI", label: "Max Resolution", format: "number", unit: "DPI" },
      ]
    },
    {
      title: "Paper & Media",
      fields: [
        { key: "maxPaperSizeType", label: "Max Paper Size", format: "text" },
        { key: "paperCapacitySheets", label: "Paper Capacity", format: "number", unit: "sheets" },
      ]
    },
    {
      title: "Connectivity",
      fields: [
        { key: "networkConnectivity", label: "Network", format: "text" },
        { key: "usbPort", label: "USB", format: "boolean" },
      ]
    },
  ]
}
```

### Step 3: Done! 
That's it. The system automatically:
- Renders the sections and fields
- Formats the values correctly
- Shows nice messages if data is missing
- Displays the asset type badge with icon

## Field Configuration Reference

### Available Format Types
- **text** → Display as plain text
- **number** → Display as number (optionally with unit)
- **boolean** → Display as "Yes" or "No"  
- **date** → Display as localized date (MM/DD/YYYY for India)
- **list** → Display as array items (requires `listFormat` property)

### Field Properties

```javascript
{
  key: "fieldName",           // Path to value (supports nested like "memory.totalCapacityGB")
  label: "Display Label",      // What to show as field name
  format: "text|number|boolean|date|list",
  unit: "optional unit",       // Shown after number (e.g., "GB", "PPM")
  listFormat: "ramModule|storageDrive|customName"  // Only for format: "list"
}
```

## Examples of Nested Fields

For nested data like:
```javascript
{
  memory: {
    totalCapacityGB: 16,
    modules: [{ ramCapacityGB: 8, ramType: "DDR4" }]
  }
}
```

Use dot notation in the key:
```javascript
{ key: "memory.totalCapacityGB", label: "Memory Capacity", format: "number", unit: "GB" }
```

## Custom List Formatters

### For Arrays of Objects
If you have an array field, add a custom formatter in `LIST_FORMATTERS`:

```javascript
// In assetSpecsConfig.js
LIST_FORMATTERS: {
  myCustomFormat: (items) => items.map(item => ({
    main: `${item.capacity}GB ${item.type}`,  // Main display text
    sub: item.manufacturer                     // Subtitle (optional)
  }))
}
```

Then use it:
```javascript
{ key: "items", label: "Items", format: "list", listFormat: "myCustomFormat" }
```

## Real Example: Adding a KEYBOARD Asset Type

### Backend Models
First ensure your backend model has these fields:
```javascript
// keyboard.model.js
keyboardType: String,              // "Mechanical", "Membrane", etc.
switchType: String,                // "Cherry MX", "Razer", etc.
keyCount: Number,                  // Number of keys
backlighting: Boolean,
wirelessRange: Number,             // In meters
batteryCapacityMAh: Number
```

### Add to Config
```javascript
// In assetSpecsConfig.js
KEYBOARD: {
  icon: "keyboard",
  sections: [
    {
      title: "Basic Specifications",
      fields: [
        { key: "keyboardType", label: "Type", format: "text" },
        { key: "switchType", label: "Switch Type", format: "text" },
        { key: "keyCount", label: "Key Count", format: "number", unit: "keys" },
      ]
    },
    {
      title: "Features",
      fields: [
        { key: "backlighting", label: "Backlighting", format: "boolean" },
        { key: "wirelessRange", label: "Wireless Range", format: "number", unit: "m" },
      ]
    },
    {
      title: "Power",
      fields: [
        { key: "batteryCapacityMAh", label: "Battery Capacity", format: "number", unit: "mAh" },
      ]
    }
  ]
}
```

### Frontend Automatically Shows It!
No changes needed. When a keyboard asset is displayed, the component will:
1. Get the config for "KEYBOARD"
2. Render all 3 sections
3. Skip any missing fields
4. Show the keyboard icon and label

## How the System Works

```
Frontend Asset Display
       ↓
AssetSpecifications Component
       ↓
Get assetType from asset.assetType
       ↓
Look up config in ASSET_SPECS_CONFIG[assetType]
       ↓
Iterate through sections and fields
       ↓
Render based on configuration
```

## Troubleshooting

### Asset Type Not Showing Specs?
1. Check that `assetType` in your asset matches a key in `ASSET_SPECS_CONFIG`
2. Case must match: "CPU", "MONITOR", "LAPTOP", "CAMERA", "PRINTER", etc.

### Fields Not Displaying?
1. Verify the `key` path matches your backend data exactly
2. Check nested paths use dot notation: `"memory.totalCapacityGB"`
3. If field is optional and missing, it automatically hides

### Numbers Not Formatting Correctly?
1. Make sure `format: "number"` is set
2. Add `unit` property if you want units
3. Ensure backend sends numeric value, not string

### List Items Not Showing?
1. Set `format: "list"`
2. Add `listFormat` property matching a formatter in `LIST_FORMATTERS`
3. Backend should send an array of objects

## Current Supported Asset Types

✅ CPU - Processor, Memory, Storage, Graphics, OS, Security
✅ MONITOR - Display, Connectivity, Power & Efficiency
✅ LAPTOP - Processor, Memory, Storage, Display, Graphics, Battery, Security
✅ CAMERA - Camera Specs, Audio, Connectivity, Physical Properties

## Adding More? Just Follow the Template Above!

Questions? Check the config file comments for more examples.
