// @ts-ignore
import { common } from "../common.js";

export const genericConfig = {
  sections: [

    {
      sectionTitle: "Basic Information",
      fields: [
        { name: "itemId", label: "Item ID", type: "text", readOnly: false },
        { name: "itemTag", label: "Item Tag", type: "text", required: true, maxLength: 80 },
        { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 120 },

        { name: "itemName", label: "Item Name", type: "text", required: true, maxLength: 120 },
        { name: "itemDescription", label: "Description", type: "textarea", maxLength: 500 },

        { name: "itemCategory", label: "Category", type: "select", options: common.assetCategories },
        { name: "itemType", label: "Item Type", type: "select", options: common.assetTypes },
        { name: "itemSubType", label: "Sub Type", type: "text", maxLength: 80 },

        { name: "manufacturer", label: "Manufacturer", type: "text", maxLength: 100 },
        { name: "brand", label: "Brand", type: "text", maxLength: 100 },
        { name: "model", label: "Model", type: "text", maxLength: 100 },
        { name: "modelNumber", label: "Model Number", type: "text", maxLength: 100 },
        { name: "partNumber", label: "Part Number", type: "text", maxLength: 100 },
        { name: "serialNumber", label: "Serial Number", type: "text", maxLength: 120 },

        { name: "itemCondition", label: "Condition", type: "select", options: common.assetCondition },
        { name: "ownershipType", label: "Ownership Type", type: "select", options: [{name:"Owned", value:"Owned"}, {name:"Leased", value:"Leased"}, {name:"Rented", value:"Rented"}] },

        { name: "manufacturingDate", label: "Manufacturing Date", type: "date" },
       
      ],
    },

    //! Purchase Information
    {
      sectionTitle: "Purchase Information",
      fields: [
        { name: "purchaseType", label: "Purchase Type", type: "select", options: ["PO", "Direct"] },
        
        { name: "poNumber", label: "PO Number", type: "text", maxLength: 80, showIf: { purchaseType: "PO" } },
        { name: "poDate", label: "PO Date", type: "date", showIf: { purchaseType: "PO" } },
        
        {name:"receiptNumber", label: "Receipt Number", type: "text", maxLength: 80, showIf: { purchaseType: "Direct" } },
        {name: "receiptDate", label: "Receipt Date", type: "date", showIf: { purchaseType: "Direct" } },

        { name: "purchaseDate", label: "Purchase Date", type: "date" },
        { name: "vendorId", label: "Vendor", type: "select", options: common.vendors },

        { name: "itemReceivedOn", label: "Item Received On", type: "radio", options: [{ name: "Invoice", value: "invoice" }, { name: "Challan", value: "Challan" }] },

        { name: "invoiceNumber", label: "Invoice Number", type: "text", maxLength: 80, showIf: { itemReceivedOn: "invoice" } },
        { name: "invoiceDate", label: "Invoice Date", type: "date", showIf: { itemReceivedOn: "invoice" } },
        { name: "deliveryChallanNumber", label: "Delivery Challan Number", type: "text", showIf: { itemReceivedOn: "Challan" } },
        { name: "deliveryChallanDate", label: "Challan Date", type: "date", showIf: { itemReceivedOn: "Challan" } },

        { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 50000000 },
        { name: "taxAmount", label: "Tax Amount", type: "number" },
        { name: "totalAmount", label: "Total Amount", type: "number" },
        { name: "currency", label: "Currency", type: "select", options: ["INR", "USD", "EUR"] },

        { name: "deliveryDate", label: "Delivery Date", type: "date" },
        { name: "receivedBy", label: "Received By", type: "text" },
      ],
    },

    //! Warranty Information
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
    {
      sectionTitle: "Item State",
      fields: [
        { name: "itemStatus", label: "Item Status", type: "select", options: [{name:"Active", value:"active", default:true}, {name:"Inactive", value:"inactive"}, {name:"Retired", value:"retired"}, ] },
        { name: "itemIsCurrently", label: "Item is Currently", type: "select", options: [{name:"In Store", value:"inStore", default:true}, {name:"In Repair", value:"inRepair"}, {name:"Disposed", value:"disposed"}, {name:"In Use", value:"inUse"}, {name:"Lost", value:"lost"}, ] },

        { name: "itemUser", label: "Item User", type: "select", options: common.user, showIf: { itemIsCurrently: "inUse" }},
         { name: "AssignDate", label: "Assignment Date", type: "date", showIf: { itemIsCurrently: "inUse" }},
        // { name: "endOfLifeDate", label: "End Of Life Date", type: "date" },
      ],
  
    },

    {
      sectionTitle: "Assignment Information",
      fields: [
        { name: "assignmentType", label: "Assignment Type", type: "select", options: ["User", "Department", "Location"] },

        { name: "assignedUserId", label: "Assigned User", type: "text", showIf: { assignmentType: "User" } },
        { name: "assignedDepartment", label: "Department", type: "text", showIf: { assignmentType: "Department" } },

        { name: "assignmentDate", label: "Assignment Date", type: "date" },
        { name: "expectedReturnDate", label: "Expected Return Date", type: "date" },

        { name: "assignmentStatus", label: "Assignment Status", type: "select", options: ["Assigned", "Returned", "Lost"] },

        { name: "handoverBy", label: "Handover By", type: "text" },
        { name: "receivedBy", label: "Received By", type: "text" },
        { name: "handoverNotes", label: "Handover Notes", type: "textarea" },
      ],
    },

    //! Location Information
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

    //! Network Details
    {
        sectionTitle: "Network Details",
        fields: [
          { name: "hostname", label: "Hostname", type: "text", maxLength: 120 },
          { name: "nicType", label: "NIC", type: "select", options: common.nicTypes },
          { name: "ipv4Address", label: "IPv4 Address", type: "text", maxLength: 40 },
          { name: "ipv6Address", label: "IPv6 Address", type: "text", maxLength: 80 },
          { name: "macAddress", label: "MAC Address", type: "text", maxLength: 40 },
          { name: "subnet", label: "Subnet / Mask", type: "text", maxLength: 40 },
          { name: "defaultGateway", label: "Default Gateway", type: "text", maxLength: 40 },
          { name: "dhcpEnabled", label: "DHCP Enabled", type: "select", options: common.booleanOptions },
          { name: "dhcpServer", label: "DHCP Server", type: "text", maxLength: 120, showIf: { dhcpEnabled: "Yes" } },
          { name: "dnsHostname", label: "DNS Hostname", type: "text", maxLength: 120 },

          { name: "ethernetPort", label: "Ethernet Port", type: "text", maxLength: 80, showIf: { nicType: "Ethernet" } },
          { name: "switchPort", label: "Switch Port", type: "text", maxLength: 80, showIf: { nicType: "Ethernet" } },
          { name: "linkSpeedMbps", label: "Link Speed (Mbps)", type: "number", min: 0, max: 100000, showIf: { nicType: "Ethernet" } },

          { name: "wifiSSID", label: "Wi-Fi SSID", type: "text", maxLength: 120, showIf: { nicType: "Wi-Fi" } },
          {
            name: "wifiSecurity",
            label: "Wi-Fi Security",
            type: "select",
            options: ["Open", "WPA2", "WPA3", "WPA2/WPA3"],
            showIf: { nicType: "Wi-Fi" },
          },
          {
            name: "wifiBand",
            label: "Wi-Fi Band",
            type: "select",
            options: ["2.4 GHz", "5 GHz", "Dual"],
            showIf: { nicType: "Wi-Fi" },
          },
        ],
      },

    //! Repair & Maintenance
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
