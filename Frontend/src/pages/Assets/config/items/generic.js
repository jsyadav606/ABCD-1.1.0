import { common } from "../common.js";

// export const genericConfig = {
//   sections: [
//     {
//       sectionTitle: "Basic Information",
//       fields: [
//         { name: "assetName", label: "Asset Name", type: "text", required: true, maxLength: 120 },
//         { name: "manufacturer", label: "Manufacturer", type: "text", maxLength: 100 },
//         { name: "model", label: "Model", type: "text", maxLength: 100 },
//       ],
//     },
//     {
//       sectionTitle: "Asset Financial Details",
//       fields: [
//         { name: "assetTag", label: "Asset Tag", type: "text", required: true, maxLength: 80 },
//         { name: "serialNumber", label: "Serial Number", type: "text", maxLength: 120 },
//         { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
//         { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 120 },
//         { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 50000000 },
//         { name: "acquisitionDate", label: "Acquisition Date", type: "date" },
//         { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
//       ],
//     },
//     {
//       sectionTitle: "Location & Assignment",
//       fields: [
//         { name: "branch", label: "Branch", type: "select", options: common.branches },
//         { name: "building", label: "Building", type: "text", maxLength: 100 },
//         { name: "floor", label: "Floor", type: "text", maxLength: 40 },
//         { name: "room", label: "Room", type: "text", maxLength: 80 },
//         { name: "assignedTo", label: "Assigned To (User ID)", type: "text", maxLength: 80 },
//         { name: "assignmentDate", label: "Assignment Date", type: "date" },
//       ],
//     },
//     {
//       sectionTitle: "Asset Lifecycle Status",
//       fields: [
//         { name: "lifecycleStatus", label: "Lifecycle Status", type: "select", options: common.lifecycleStatus },
//         { name: "operationalStatus", label: "Operational Status", type: "select", options: common.operationalStatus },
//         { name: "remarks", label: "Remarks", type: "textarea", maxLength: 500 },
//       ],
//     },
//   ],
// };

export const genericConfig = {
  sections: [

    {
      sectionTitle: "Basic Information",
      fields: [
        { name: "assetId", label: "Asset ID", type: "text", readOnly: true },
        { name: "assetTag", label: "Asset Tag", type: "text", required: true, maxLength: 80 },
        // { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 120 },

        { name: "assetName", label: "Asset Name", type: "text", required: true, maxLength: 120 },
        { name: "assetDescription", label: "Description", type: "textarea", maxLength: 500 },

        { name: "assetCategory", label: "Category", type: "select", options: common.assetCategories },
        { name: "assetType", label: "Asset Type", type: "select", options: common.assetTypes },
        { name: "assetSubType", label: "Sub Type", type: "text", maxLength: 80 },

        { name: "manufacturer", label: "Manufacturer", type: "text", maxLength: 100 },
        { name: "brand", label: "Brand", type: "text", maxLength: 100 },
        { name: "model", label: "Model", type: "text", maxLength: 100 },
        { name: "modelNumber", label: "Model Number", type: "text", maxLength: 100 },
        { name: "partNumber", label: "Part Number", type: "text", maxLength: 100 },
        { name: "serialNumber", label: "Serial Number", type: "text", maxLength: 120 },

        { name: "assetCondition", label: "Condition", type: "select", options: common.assetCondition },
        { name: "ownershipType", label: "Ownership Type", type: "select", options: common.ownershipTypes },

        { name: "manufacturingDate", label: "Manufacturing Date", type: "date" },
        { name: "installationDate", label: "Installation Date", type: "date" },
        // { name: "endOfLifeDate", label: "End Of Life Date", type: "date" },
      ],
    },

    {
      sectionTitle: "Purchase Information",
      fields: [
        { name: "purchaseType", label: "Purchase Type", type: "select", options: ["PO", "Direct"] },
        
        { name: "poNumber", label: "PO Number", type: "text", maxLength: 80, showIf: { purchaseType: "PO" } },
        { name: "poDate", label: "PO Date", type: "date", showIf: { purchaseType: "PO" } },
        // { name: "poAmount", label: "PO Amount", type: "number", showIf: { purchaseType: "PO" } },
        
        { name: "purchaseDate", label: "Purchase Date", type: "date" },
        { name: "vendorId", label: "Vendor", type: "select", options: common.vendors },

        { name: "invoiceNumber", label: "Invoice Number", type: "text", maxLength: 80 },
        { name: "invoiceDate", label: "Invoice Date", type: "date" },

        { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 50000000 },
        { name: "taxAmount", label: "Tax Amount", type: "number" },
        { name: "totalAmount", label: "Total Amount", type: "number" },
        { name: "currency", label: "Currency", type: "select", options: ["INR", "USD", "EUR"] },

        { name: "deliveryDate", label: "Delivery Date", type: "date" },
        { name: "deliveryChallanNumber", label: "Delivery Challan Number", type: "text" },
        { name: "receivedBy", label: "Received By", type: "text" },
      ],
    },

    {
      sectionTitle: "Warranty Information",
      fields: [
        { name: "warrantyAvailable", label: "Warranty Available", type: "select", options: ["Yes", "No"] },

        { name: "warrantyMode", label: "Warranty Mode", type: "select", options: ["Duration", "EndDate"], showIf: { warrantyAvailable: "Yes" } },

        { name: "warrantyDuration", label: "Warranty Duration", type: "number", showIf: { warrantyMode: "Duration" } },
        { name: "durationUnit", label: "Duration Unit", type: "select", options: ["Year", "Month"], showIf: { warrantyMode: "Duration" } },

        { name: "warrantyStartDate", label: "Warranty Start Date", type: "date", showIf: { warrantyAvailable: "Yes" } },
        { name: "warrantyEndDate", label: "Warranty End Date", type: "date", showIf: { warrantyAvailable: "Yes" } },

        { name: "warrantyProvider", label: "Warranty Provider", type: "select", options: ["Manufacturer", "Vendor", "Extended"] },

        { name: "supportVendor", label: "Support Vendor", type: "text" },
        { name: "supportPhone", label: "Support Phone", type: "text" },
        { name: "supportEmail", label: "Support Email", type: "text" },

        { name: "amcAvailable", label: "AMC Available", type: "select", options: ["Yes", "No"] },

        { name: "amcVendor", label: "AMC Vendor", type: "text", showIf: { amcAvailable: "Yes" } },
        { name: "amcStartDate", label: "AMC Start Date", type: "date", showIf: { amcAvailable: "Yes" } },
        { name: "amcEndDate", label: "AMC End Date", type: "date", showIf: { amcAvailable: "Yes" } },
        { name: "amcCost", label: "AMC Cost", type: "number", showIf: { amcAvailable: "Yes" } },
      ],
    },

    // {
    //   sectionTitle: "Assignment Information",
    //   fields: [
    //     { name: "assignmentType", label: "Assignment Type", type: "select", options: ["User", "Department", "Location"] },

    //     { name: "assignedUserId", label: "Assigned User", type: "text", showIf: { assignmentType: "User" } },
    //     { name: "assignedDepartment", label: "Department", type: "text", showIf: { assignmentType: "Department" } },

    //     { name: "assignmentDate", label: "Assignment Date", type: "date" },
    //     { name: "expectedReturnDate", label: "Expected Return Date", type: "date" },

    //     { name: "assignmentStatus", label: "Assignment Status", type: "select", options: ["Assigned", "Returned", "Lost"] },

    //     { name: "handoverBy", label: "Handover By", type: "text" },
    //     { name: "receivedBy", label: "Received By", type: "text" },
    //     { name: "handoverNotes", label: "Handover Notes", type: "textarea" },
    //   ],
    // },

    {
      sectionTitle: "Location Information",
      fields: [
        { name: "organization", label: "Organization", type: "text" },
        { name: "branch", label: "Branch", type: "select", options: common.branches },

        { name: "building", label: "Building", type: "text" },
        { name: "floor", label: "Floor", type: "text" },
        { name: "room", label: "Room", type: "text" },

        { name: "locationType", label: "Location Type", type: "select", options: ["Lab", "Office", "Server Room", "Classroom"] },

        { name: "rackNumber", label: "Rack Number", type: "text" },
        { name: "rackUnit", label: "Rack Unit", type: "text" },
      ],
    },

    // {
    //   sectionTitle: "Repair & Maintenance",
    //   fields: [
    //     { name: "repairStatus", label: "Repair Status", type: "select", options: ["None", "Under Repair", "Repaired"] },

    //     { name: "issueTitle", label: "Issue Title", type: "text" },
    //     { name: "issueDescription", label: "Issue Description", type: "textarea" },
    //     { name: "reportedDate", label: "Reported Date", type: "date" },
    //     { name: "reportedBy", label: "Reported By", type: "text" },

    //     { name: "repairVendor", label: "Repair Vendor", type: "text" },
    //     { name: "vendorContact", label: "Vendor Contact", type: "text" },

    //     { name: "repairStartDate", label: "Repair Start Date", type: "date" },
    //     { name: "repairEndDate", label: "Repair End Date", type: "date" },

    //     { name: "repairCost", label: "Repair Cost", type: "number" },

    //     { name: "partsReplaced", label: "Parts Replaced", type: "textarea" },
    //     { name: "replacementCost", label: "Replacement Cost", type: "number" },

    //     { name: "lastMaintenanceDate", label: "Last Maintenance Date", type: "date" },
    //     { name: "nextMaintenanceDate", label: "Next Maintenance Date", type: "date" },
    //     { name: "maintenanceNotes", label: "Maintenance Notes", type: "textarea" },
    //   ],
    // },

  ],
};