# 🖨️ Cartridge / Toner Details - Improved Implementation

## Overview
Rewrote the Cartridge/Toner section with **smart conditional logic** based on color printing support. The form adapts dynamically to show the right fields based on printer capabilities.

---

## Smart Conditional Logic

### Scenario 1: Black & White Printer (colorSupport = "No")

**Section Title**: "Black Toner/Cartridge Details"

**Displays when**: `colorSupport === "No"`

**Fields shown**:
1. **Cartridge Model** - Text input (e.g., HP CF279A)
2. **Yield (Pages)** - Number input (e.g., 1000)
3. **Part/Cartridge Number** - Text input (e.g., CF279A)
4. **Manufacturer** - Text input (e.g., HP, Canon, Brother)
5. **Last Changed Date** - Date picker
6. **Estimated End Date** - Date picker
7. **Notes** - Textarea for additional notes

**UX Flow**:
- Simple, clean form - only Black cartridge fields
- No table rows needed
- All in single section
- Easy to fill out quickly

### Scenario 2: Color Printer (colorSupport = "Yes")

**Section Title**: "Cartridge / Toner Details"

**Displays when**: `colorSupport === "Yes"`

**Fields shown**:
1. **Total Number of Cartridges** - Number field (1-10)
   - Tells how many cartridges the printer has
   - E.g., 4 for CMYK, 6 for extended color

2. **Cartridge Details** - Dynamic Array (Table Rows)
   - Add/Remove cartridge rows
   - Each row captures:
     - **Cartridge Color** (Dropdown with 11 color options)
     - **Model Number** (Text)
     - **Part/Cartridge Number** (Text)
     - **Manufacturer** (Text)
     - **Yield (Pages)** (Number)
     - **Last Changed Date** (Date)
     - **Estimated End Date** (Date)

**Color Options Available**:
- ⚫ Black
- 🔵 Cyan
- 🔴 Magenta
- 🟡 Yellow
- ⬜ Light Cyan
- 🩷 Light Magenta
- 🖤 Photo Black
- ⚪ Gray
- 🔴 Red
- 🔵 Blue
- 💚 Green

**UX Flow**:
- Total cartridge count displayed first
- Dynamic rows for each cartridge
- Add (+) button to add more cartridges
- Remove (−) button to delete cartridges
- Each cartridge can have different specifications

---

## Form Structure Comparison

### Black & White Printer Form

```
Printer Info Section
├─ Color Printing Supported: No ← Triggers hidden section
├─ Print Speed: 30 PPM
└─ Other print specs...

HIDDEN: Cartridge / Toner Details section (colorSupport = Yes)

SHOWN: Black Toner/Cartridge Details
├─ Cartridge Model: [Text field - e.g. HP CF279A]
├─ Yield (Pages): [Number - e.g. 1000]
├─ Part Number: [Text - e.g. CF279A]
├─ Manufacturer: [Text - e.g. HP]
├─ Last Changed Date: [Date picker]
├─ Estimated End Date: [Date picker]
└─ Notes: [Textarea - optional notes]
```

### Color Printer Form

```
Printer Info Section
├─ Color Printing Supported: Yes ← Triggers dynamic section
├─ Print Speed: 30 PPM
└─ Other print specs...

HIDDEN: Black Toner/Cartridge Details (colorSupport = No)

SHOWN: Cartridge / Toner Details
├─ Total Number of Cartridges: [Number - 1 to 10]
└─ Cartridge Details (Table):
   ┌─────────────────────────────────────────────────────────┐
   │ Row 1: Color [Dropdown] | Model [Text] | Add Remove    │
   │        Part [Text] | Mfg [Text] | Yield [Number]       │
   │        Last Changed [Date] | Est End [Date]            │
   ├─────────────────────────────────────────────────────────┤
   │ Row 2: (User can add via + button)                     │
   └─────────────────────────────────────────────────────────┘
```

---

## Field Details

### Black & White Cartridge Fields

| Field | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| Cartridge Model | Text | No | HP CF279A | Exact model from printer manual |
| Yield (Pages) | Number | No | 1000 | Pages per cartridge |
| Part/Cartridge Number | Text | No | CF279A | Admin code or SKU |
| Manufacturer | Text | No | HP | Brand or supplier |
| Last Changed Date | Date | No | 2024-03-15 | When last replaced |
| Estimated End Date | Date | No | 2024-09-15 | Calculated or estimated |
| Notes | Textarea | No | - | Compatibility notes |

### Color Cartridge Fields (Per Row)

| Field | Type | Required | Options | Example |
|-------|------|----------|---------|---------|
| Cartridge Color | Select | Yes | Black, Cyan, Magenta, Yellow, ... | Cyan |
| Model Number | Text | No | - | HP CF401X |
| Part Number | Text | No | - | CF401X |
| Manufacturer | Text | No | - | HP |
| Yield (Pages) | Number | No | - | 2300 |
| Last Changed | Date | No | - | 2024-02-20 |
| Estimated End | Date | No | - | 2024-05-20 |

---

## Data Saved to Backend

### Black & White Printer Data
```json
{
  "itemId": "PRINTER-001",
  "colorSupport": "No",
  "blackCartridgeModel": "HP CF279A",
  "blackCartridgeYieldPages": 1000,
  "blackCartridgePartNumber": "CF279A",
  "blackCartridgeManufacturer": "HP",
  "blackCartridgeLastChanged": "2024-03-15T00:00:00Z",
  "blackCartridgeEstimatedEnd": "2024-09-15T00:00:00Z",
  "blackCartridgeNotes": "Original HP cartridge"
}
```

### Color Printer Data
```json
{
  "itemId": "PRINTER-002",
  "colorSupport": "Yes",
  "totalCartridgeCount": 4,
  "cartridges": [
    {
      "color": "Black",
      "model": "HP CF279A",
      "partNumber": "CF279A",
      "manufacturer": "HP",
      "yieldPages": 1000,
      "lastChanged": "2024-03-15T00:00:00Z",
      "estimatedEnd": "2024-09-15T00:00:00Z"
    },
    {
      "color": "Cyan",
      "model": "HP CF401X",
      "partNumber": "CF401X",
      "manufacturer": "HP",
      "yieldPages": 2300,
      "lastChanged": "2024-02-20T00:00:00Z",
      "estimatedEnd": "2024-05-20T00:00:00Z"
    },
    {
      "color": "Magenta",
      "model": "HP CF403X",
      "partNumber": "CF403X",
      "manufacturer": "HP",
      "yieldPages": 2300,
      "lastChanged": "2024-02-20T00:00:00Z",
      "estimatedEnd": "2024-05-20T00:00:00Z"
    },
    {
      "color": "Yellow",
      "model": "HP CF402X",
      "partNumber": "CF402X",
      "manufacturer": "HP",
      "yieldPages": 2300,
      "lastChanged": "2024-02-20T00:00:00Z",
      "estimatedEnd": "2024-05-20T00:00:00Z"
    }
  ]
}
```

---

## Real-World Use Cases

### Case 1: HP LaserJet Pro M428fdw (B&W Laser)
- Color Support: **No**
- Form shows: Simple Black cartridge section
- Cartridge: 1 × Black CF279A (1000 pages)

### Case 2: HP Color LaserJet Enterprise M555dn (Color Laser)
- Color Support: **Yes**
- Form shows: Dynamic cartridge section
- Cartridges:
  1. Black CF330A (13,500 pages)
  2. Cyan CF331A (7,700 pages)
  3. Magenta CF333A (7,700 pages)
  4. Yellow CF332A (7,700 pages)

### Case 3: Ricoh MP C2004 (Multifunction Color)
- Color Support: **Yes**
- Form shows: Dynamic cartridge section with extended colors
- Cartridges:
  1. Black (400ml bottle)
  2. Cyan (400ml bottle)
  3. Magenta (400ml bottle)
  4. Yellow (400ml bottle)
  5. Light Cyan (Optional)
  6. Light Magenta (Optional)

---

## Frontend Behavior

### No Color Support (B&W)

```
User Steps:
1. Select Color Printing Supported: No
2. "Black Toner/Cartridge Details" section appears
3. Fill in single cartridge details
4. Click Save
5. Data saved without color-specific fields
```

### Color Support (Color)

```
User Steps:
1. Select Color Printing Supported: Yes
2. "Cartridge / Toner Details" section appears
3. Enter Total Cartridges: 4
4. Fill first cartridge:
   - Color: Black
   - Model: HP CF279A
   - Yield: 1000
   - etc.
5. Click + to add more cartridges
6. Fill each cartridge independently
7. Click Save
8. All cartridges saved to array
```

---

## Backend Requirements

### Model Schema (Printer)

```javascript
// Black cartridge fields (when colorSupport = "No")
blackCartridgeModel: { type: String, default: null },
blackCartridgeYieldPages: { type: Number, default: null },
blackCartridgePartNumber: { type: String, default: null },
blackCartridgeManufacturer: { type: String, default: null },
blackCartridgeLastChanged: { type: Date, default: null },
blackCartridgeEstimatedEnd: { type: Date, default: null },
blackCartridgeNotes: { type: String, default: null },

// Color cartridge fields (when colorSupport = "Yes")
totalCartridgeCount: { type: Number, default: null },
cartridges: [
  {
    color: { type: String },
    model: { type: String },
    partNumber: { type: String },
    manufacturer: { type: String },
    yieldPages: { type: Number },
    lastChanged: { type: Date },
    estimatedEnd: { type: Date }
  }
]
```

---

## Asset Details Page Display

### In Asset Details > Specifications Tab

**For B&W Printer**:
```
Black Toner/Cartridge Details
├─ Model: HP CF279A
├─ Yield: 1000 pages
├─ Part #: CF279A
├─ Manufacturer: HP
├─ Last Changed: 15 Mar 2024
├─ Est. End: 15 Sep 2024
└─ Notes: Original HP cartridge
```

**For Color Printer**:
```
Cartridge Information
├─ Total Cartridges: 4
└─ Cartridges:
   1. Black - HP CF279A - 1000 pages (Changed: 15 Mar 2024)
   2. Cyan - HP CF401X - 2300 pages (Changed: 20 Feb 2024)
   3. Magenta - HP CF403X - 2300 pages (Changed: 20 Feb 2024)
   4. Yellow - HP CF402X - 2300 pages (Changed: 20 Feb 2024)
```

---

## Testing Checklist

- [ ] Create B&W printer (colorSupport = No)
  - [ ] Only Black cartridge section shows
  - [ ] Can fill all 7 fields
  - [ ] Saves correctly

- [ ] Create Color printer (colorSupport = Yes)
  - [ ] Only Color cartridge section shows
  - [ ] Can enter total count
  - [ ] Can add cartridge rows
  - [ ] Can remove cartridge rows
  - [ ] Each row captures all 7 fields
  - [ ] Color dropdown has all 11 options
  - [ ] Saves as array correctly

- [ ] Edit printer
  - [ ] Changes color support
  - [ ] Form switches sections correctly
  - [ ] Existing data preserved if any

- [ ] Asset Details page
  - [ ] B&W cartridge displays in Specifications
  - [ ] Color cartridges display in list format
  - [ ] All dates and numbers show correctly

---

## Build Status

✅ **Build Successful**
- Bundle: fixed-D_hwgYYc.js (64.09 KB / 9.15 KB gzipped)
- Increase: +1.52 KB from previous (additional fields)
- Build time: 22.23s
- No errors

---

## File Changes

| File | Change |
|------|---------|
| `config/items/fixed.js` | Rewrote cartridge section with conditional logic |
| Build output | Added to TABLE_SECTION_TITLES in common.js (already done) |

---

**Status**: ✅ Ready for Testing
**Implementation**: Complete
**Last Updated**: March 29, 2026

