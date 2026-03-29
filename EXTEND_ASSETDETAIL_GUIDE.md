## 🎯 Quick Reference Guide - Adding New Asset Types

### Example 1: Add a "Printer" Asset Type

#### Step 1: Define the schema in `/Frontend/src/utils/assetFieldSchema.js`

```javascript
// Add after MONITOR_SCHEMA
export const PRINTER_SCHEMA = {
  type: 'printer',
  label: 'Printer',
  icon: '🖨️',
  fields: [
    // Identification
    createField('itemId', 'Asset ID', { group: ASSET_FIELD_GROUPS.IDENTIFICATION, required: true }),
    createField('serialNumber', 'Serial Number', { group: ASSET_FIELD_GROUPS.IDENTIFICATION }),
    createField('itemTag', 'Asset Tag', { group: ASSET_FIELD_GROUPS.IDENTIFICATION }),
    
    // Basic Info
    createField('manufacturer', 'Brand', { group: ASSET_FIELD_GROUPS.BASIC_INFO }),
    createField('model', 'Model Number', { group: ASSET_FIELD_GROUPS.BASIC_INFO }),
    
    // Specifications
    createField('colorPrinting', 'Color Printing', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS }),
    createField('maxPageSize', 'Max Page Size', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS }),
    createField('printSpeedPPM', 'Print Speed (PPM)', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS, type: 'number' }),
    
    // Connectivity
    createField('networkPrinter', 'Network Printer', { group: ASSET_FIELD_GROUPS.CONNECTIVITY, type: 'boolean' }),
    createField('usbPort', 'USB Connection', { group: ASSET_FIELD_GROUPS.CONNECTIVITY, type: 'boolean' }),
    
    // Supply Info
    createField('tonerType', 'Toner Type', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS }),
    createField('cartridgeLife', 'Cartridge Page Yield', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS, type: 'number' }),
    
    // Status
    createField('itemStatus', 'Status', { group: ASSET_FIELD_GROUPS.STATUS }),
    createField('itemCondition', 'Condition', { group: ASSET_FIELD_GROUPS.STATUS }),
  ],
};
```

#### Step 2: Register in ASSET_SCHEMAS

```javascript
export const ASSET_SCHEMAS = {
  cpu: CPU_SCHEMA,
  desktop: CPU_SCHEMA,
  laptop: LAPTOP_SCHEMA,
  monitor: MONITOR_SCHEMA,
  printer: PRINTER_SCHEMA,  // ← ADD THIS
  default: CPU_SCHEMA,
};
```

#### Step 3: Done! ✅

Now when asset.itemType === 'printer', it will automatically show the printer fields!

---

### Example 2: Add a "USB Hub" Asset Type

```javascript
export const USB_HUB_SCHEMA = {
  type: 'usb-hub',
  label: 'USB Hub',
  icon: '🔌',
  fields: [
    createField('itemId', 'Asset ID', { group: ASSET_FIELD_GROUPS.IDENTIFICATION, required: true }),
    createField('serialNumber', 'Serial Number', { group: ASSET_FIELD_GROUPS.IDENTIFICATION }),
    
    createField('manufacturer', 'Manufacturer', { group: ASSET_FIELD_GROUPS.BASIC_INFO }),
    createField('model', 'Model', { group: ASSET_FIELD_GROUPS.BASIC_INFO }),
    
    createField('portCount', 'Number of Ports', { group: ASSET_FIELD_GROUPS.CONNECTIVITY, type: 'number' }),
    createField('usb3Ports', 'USB 3.0 Ports', { group: ASSET_FIELD_GROUPS.CONNECTIVITY, type: 'number' }),
    createField('usb2Ports', 'USB 2.0 Ports', { group: ASSET_FIELD_GROUPS.CONNECTIVITY, type: 'number' }),
    
    createField('powerSource', 'Power Source', { group: ASSET_FIELD_GROUPS.POWER }),
    createField('maxPowerOutput', 'Max Power Output (W)', { group: ASSET_FIELD_GROUPS.POWER, type: 'number' }),
    
    createField('itemStatus', 'Status', { group: ASSET_FIELD_GROUPS.STATUS }),
    createField('itemCondition', 'Condition', { group: ASSET_FIELD_GROUPS.STATUS }),
  ],
};

// Register it:
export const ASSET_SCHEMAS = {
  // ... others
  'usb-hub': USB_HUB_SCHEMA,
};
```

---

### Example 3: Add a "Keyboard" Asset Type

```javascript
export const KEYBOARD_SCHEMA = {
  type: 'keyboard',
  label: 'Keyboard',
  icon: '⌨️',
  fields: [
    // Identification
    createField('itemId', 'Asset ID', { group: ASSET_FIELD_GROUPS.IDENTIFICATION, required: true }),
    createField('serialNumber', 'Serial Number', { group: ASSET_FIELD_GROUPS.IDENTIFICATION }),
    
    // Basic Info
    createField('manufacturer', 'Brand', { group: ASSET_FIELD_GROUPS.BASIC_INFO }),
    createField('model', 'Model', { group: ASSET_FIELD_GROUPS.BASIC_INFO }),
    
    // Specifications
    createField('keyboardType', 'Type', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS }),
    createField('switchType', 'Switch Type', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS }),
    createField('layout', 'Layout (e.g., QWERTY)', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS }),
    createField('backlit', 'Backlit', { group: ASSET_FIELD_GROUPS.SPECIFICATIONS, type: 'boolean' }),
    
    // Connectivity
    createField('connectionType', 'Connection Type', { group: ASSET_FIELD_GROUPS.CONNECTIVITY }),
    createField('wireless', 'Wireless', { group: ASSET_FIELD_GROUPS.CONNECTIVITY, type: 'boolean' }),
    
    // Status
    createField('itemStatus', 'Status', { group: ASSET_FIELD_GROUPS.STATUS }),
    createField('itemCondition', 'Condition', { group: ASSET_FIELD_GROUPS.STATUS }),
  ],
};
```

---

## 🛠️ How to Create Custom Field Groups

Want to add your own field group category? Here's how:

```javascript
// 1. Add to ASSET_FIELD_GROUPS
export const ASSET_FIELD_GROUPS = {
  // ... existing groups
  CUSTOM_GROUP: 'customGroup',  // ← Add this
};

// 2. Add label to FIELD_GROUP_LABELS
export const FIELD_GROUP_LABELS = {
  // ... existing labels
  [ASSET_FIELD_GROUPS.CUSTOM_GROUP]: { 
    label: '🎯 My Custom Group', 
    icon: '🎯' 
  },
};

// 3. Use it in any schema
export const SOMEONE_SCHEMA = {
  fields: [
    createField('myField', 'My Field', { 
      group: ASSET_FIELD_GROUPS.CUSTOM_GROUP  // ← Use it here
    }),
  ],
};
```

---

## 📋 Complete Asset Type Template

Copy this template to add a new asset type quickly:

```javascript
export const MYNEWTYPE_SCHEMA = {
  type: 'mynewtype',           // ← Change this
  label: 'My New Type',        // ← And this
  icon: '🎯',                  // ← And this
  fields: [
    // ID & Basic
    createField('itemId', 'Asset ID', { 
      group: ASSET_FIELD_GROUPS.IDENTIFICATION, 
      required: true 
    }),
    createField('serialNumber', 'Serial Number', { 
      group: ASSET_FIELD_GROUPS.IDENTIFICATION 
    }),
    createField('manufacturer', 'Brand', { 
      group: ASSET_FIELD_GROUPS.BASIC_INFO 
    }),
    createField('model', 'Model', { 
      group: ASSET_FIELD_GROUPS.BASIC_INFO 
    }),
    
    // Specific fields for this type
    createField('customField1', 'Custom Field 1', { 
      group: ASSET_FIELD_GROUPS.SPECIFICATIONS 
    }),
    createField('customField2', 'Custom Field 2', { 
      group: ASSET_FIELD_GROUPS.SPECIFICATIONS,
      type: 'number'  // optional: text, number, date, boolean
    }),
    
    // Status
    createField('itemStatus', 'Status', { 
      group: ASSET_FIELD_GROUPS.STATUS 
    }),
    createField('itemCondition', 'Condition', { 
      group: ASSET_FIELD_GROUPS.STATUS 
    }),
  ],
};

// Register:
export const ASSET_SCHEMAS = {
  // ...
  'mynewtype': MYNEWTYPE_SCHEMA,
};
```

---

## 🎨 Field Type Options

When creating a field, you can specify:

```javascript
createField('fieldKey', 'Field Label', {
  type: 'text',              // text | number | date | boolean
  group: ASSET_FIELD_GROUPS.BASIC_INFO,
  icon: '📝',                // Any emoji or icon
  required: true,            // Mark as required
  visible: true,             // Show by default
  editable: true,            // Allow editing (future)
  format: 'short-date',      // Date format (future)
});
```

---

## ✅ Checklist for Adding New Asset Type

- [ ] Create schema in `assetFieldSchema.js`
- [ ] Add all required fields (itemId, serialNumber)
- [ ] Add type-specific fields
- [ ] Include status fields (itemStatus, itemCondition)
- [ ] Register in ASSET_SCHEMAS
- [ ] Test with real data
- [ ] Verify all groups show correctly
- [ ] Check data completeness meter
- [ ] Test on mobile (responsive check)

---

## 🧪 Quick Test Method

1. Navigate to an asset detail page
2. Open browser DevTools
3. Change itemType in localStorage:
   ```javascript
   localStorage.setItem('lastItemType', 'printer');
   ```
4. Reload the page
5. Verify new fields appear correctly!

---

## 🐛 Common Issues & Solutions

### Issue: New fields not showing
**Solution**: Make sure you registered the schema in ASSET_SCHEMAS

### Issue: Field not in right group
**Solution**: Check that ASSET_FIELD_GROUPS exists and is used correctly

### Issue: Icon showing as emoji placeholder
**Solution**: Use standard emoji - all browsers support them

### Issue: Data not loading
**Solution**: Verify backend returns fields with correct field names matching your schema

---

## 💡 Tips

1. **Keep field names consistent** - Use camelCase (e.g., `printSpeedPPM`)
2. **Use meaningful icons** - Makes scanning easier (e.g., 🖨️ for printer)
3. **Group logically** - Put related fields in same group
4. **Set required fields** - Mark critical fields as required
5. **Use correct types** - Use `type: 'number'` for numeric fields
6. **Add descriptions** - Use clear labels that explain what each field is

---

**Last Updated**: March 28, 2026  
**Quick Start Time**: ~5 minutes to add a new asset type!
