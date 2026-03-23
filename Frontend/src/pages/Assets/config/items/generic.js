// @ts-ignore
import { common } from "../common.js";

export const genericConfig = {
  sections: [

    //! Basic Information
    {
      sectionTitle: "Basic Information",
      fields: [
        { name: "itemId", label: "Asset ID", placeholder: "Enter Asset ID", type: "text", readOnly: false, required: true,},
        { name: "itemTag", label: "Item Tag", placeholder: "Enter Item Tag", type: "text", required: true, maxLength: 80 },
        { name: "barcode", label: "Barcode / QR Code", placeholder: "Enter Barcode / QR Code", type: "text", maxLength: 120 },

        { name: "itemName", label: "Item Name", placeholder: "Enter Item Name", type: "text", required: true, maxLength: 120 },
        { name: "itemDescription", label: "Description", placeholder: "Enter Description", type: "textarea", maxLength: 500 },

        { name: "itemCategory", label: "Category", placeholder: "Select Category", type: "select", options: common.assetCategories },
        { name: "itemType", label: "Item Type", placeholder: "Select Item Type", type: "select", options: common.assetTypes },
        { name: "itemSubType", label: "Sub Type", placeholder: "Enter Sub Type", type: "text", maxLength: 80 },

        { name: "manufacturer", label: "Manufacturer", placeholder: "Enter Manufacturer", type: "text", maxLength: 100 },
        { name: "brand", label: "Brand", placeholder: "Enter Brand", type: "text", maxLength: 100 },
        { name: "model", label: "Model", placeholder: "Enter Model", type: "text", maxLength: 100 },
        { name: "modelNumber", label: "Model Number", placeholder: "Enter Model Number", type: "text", maxLength: 100 },
        { name: "partNumber", label: "Part Number", placeholder: "Enter Part Number", type: "text", maxLength: 100 },
        { name: "serialNumber", label: "Serial Number", placeholder: "Enter Serial Number", type: "text", maxLength: 120 },

        { name: "itemCondition", label: "Condition", placeholder: "Select Condition", type: "select", options: common.assetCondition },
        { name: "ownershipType", label: "Ownership Type", placeholder: "Select Ownership Type", type: "select", options: [{name:"Owned", value:"Owned"}, {name:"Leased", value:"Leased"}, {name:"Rented", value:"Rented"}] },

        { name: "manufacturingDate", label: "Manufacturing Date", placeholder: "Select Manufacturing Date", type: "date" },
       
      ],
    },

    //! Purchase Information
    {
      sectionTitle: "Purchase Information",
      fields: [
        { name: "purchaseType", label: "Purchase Type", placeholder: "Select Purchase Type", type: "select", options: ["PO", "Direct"] },
        
        { name: "poNumber", label: "PO Number", placeholder: "Enter PO Number", type: "text", maxLength: 80, showIf: { purchaseType: "PO" } },
        { name: "poDate", label: "PO Date", placeholder: "Select PO Date", type: "date", showIf: { purchaseType: "PO" } },
        
        {name:"receiptNumber", label: "Receipt Number", placeholder: "Enter Receipt Number", type: "text", maxLength: 80, showIf: { purchaseType: "Direct" } },
        {name: "receiptDate", label: "Receipt Date", placeholder: "Select Receipt Date", type: "date", showIf: { purchaseType: "Direct" } },

        { name: "vendorId", label: "Vendor", placeholder: "Select Vendor", type: "select", options: common.vendors },
        
        
        { name: "itemReceivedOn", label: "Item Received On", placeholder: "Select Item Received On", type: "radio", options: [{ name: "Invoice", value: "invoice" }, { name: "Challan", value: "Challan" }] },
        { name: "invoiceNumber", label: "Invoice Number", placeholder: "Enter Invoice Number", type: "text", maxLength: 80, showIf: { itemReceivedOn: "invoice" } },
        { name: "invoiceDate", label: "Invoice Date", placeholder: "Select Invoice Date", type: "date", showIf: { itemReceivedOn: "invoice" } },
        { name: "deliveryChallanNumber", label: "Delivery Challan Number", placeholder: "Enter Delivery Challan Number", type: "text", showIf: { itemReceivedOn: "Challan" } },
        { name: "deliveryChallanDate", label: "Challan Date", placeholder: "Select Challan Date", type: "date", showIf: { itemReceivedOn: "Challan" } },
        
        { name: "purchaseDate", label: "Purchase Date", placeholder: "Select Purchase Date", type: "date", },
        { name: "purchaseCost", label: "Purchase Cost", placeholder: "Enter Purchase Cost", type: "number", min: 0, max: 50000000 },
        { name: "taxAmount", label: "Tax Amount", placeholder: "Enter Tax Amount", type: "number" },
        { name: "totalAmount", label: "Total Amount", placeholder: "Enter Total Amount", type: "number" },
        { name: "currency", label: "Currency", placeholder: "Select Currency", type: "select", options: ["INR", "USD", "EUR"] },

        { name: "deliveryDate", label: "Delivery Date", placeholder: "Select Delivery Date", type: "date" },
        { name: "receivedBy", label: "Received By", placeholder: "Enter Received By", type: "text" },
      ],
    },

    //! Warranty Information
    {
      sectionTitle: "Warranty Information",
      fields: [
        { name: "warrantyAvailable", label: "Warranty Available", placeholder: "Select Warranty Available", type: "select", options: ["Yes", "No"], defaultValue: "No" },

        { name: "warrantyMode", label: "Warranty Mode", placeholder: "Select Warranty Mode", type: "select", options: ["Duration", "EndDate"], showIf: { warrantyAvailable: "Yes" } },

        { name: "inYear", label: "Year", placeholder: "Enter Year", type: "number", showIf: { warrantyAvailable: "Yes", warrantyMode: "Duration" } },
        { name: "inMonth", label: "Month", placeholder: "Enter Month", type: "number", showIf: { warrantyAvailable: "Yes", warrantyMode: "Duration" }, defaultValue: 0 },
        
        { name: "warrantyStartDate", label: "Warranty Start Date", placeholder: "Select Warranty Start Date", type: "date", showIf: { warrantyAvailable: "Yes", warrantyMode: "EndDate" } },
        { name: "warrantyEndDate", label: "Warranty End Date", placeholder: "Select Warranty End Date", type: "date", showIf: { warrantyAvailable: "Yes", warrantyMode: "EndDate" } },

        { name: "warrantyProvider", label: "Warranty Provider", placeholder: "Select Warranty Provider", type: "select", options: ["Manufacturer", "Vendor", "Extended"], showIf: { warrantyAvailable: "Yes" } },

        { name: "supportVendor", label: "Support Vendor", placeholder: "Enter Support Vendor", type: "text", showIf: { warrantyAvailable: "Yes", warrantyProvider: "Extended" } },
        { name: "supportPhone", label: "Support Phone", placeholder: "Enter Support Phone", type: "text", showIf: { warrantyAvailable: "Yes", warrantyProvider: "Extended" } },
        { name: "supportEmail", label: "Support Email", placeholder: "Enter Support Email", type: "text", showIf: { warrantyAvailable: "Yes", warrantyProvider: "Extended" } },

        { name: "warrantyTillDate", label: "Warranty Till Date", placeholder: "Auto calculated", type: "date", readOnly: true, showIf: { warrantyAvailable: "Yes" } },
        { name: "warrantyStatus", label: "Warranty Status", placeholder: "Auto calculated", type: "text", readOnly: true, showIf: { warrantyAvailable: "Yes" } },

        { name: "amcAvailable", label: "AMC Available", placeholder: "Select AMC Available", defaultValue: "No", type: "select", options: ["Yes", "No"], showIf: { warrantyAvailable: "No" } },

        { name: "amcVendor", label: "AMC Vendor", placeholder: "Enter AMC Vendor", type: "text", showIf: { warrantyAvailable: "No", amcAvailable: "Yes" } },
        { name: "amcStartDate", label: "AMC Start Date", placeholder: "Select AMC Start Date", type: "date", showIf: { warrantyAvailable: "No", amcAvailable: "Yes" } },
        { name: "amcEndDate", label: "AMC End Date", placeholder: "Select AMC End Date", type: "date", showIf: { warrantyAvailable: "No", amcAvailable: "Yes" } },
      ],
    },

    //! Item State
    {
      sectionTitle: "Item State",
      fields: [
        { name: "itemStatus", label: "Item Status", placeholder: "Select Item Status", type: "select", options: [{name:"Active", value:"active"}, {name:"Inactive", value:"inactive"}], defaultValue: "active" },
        { name: "itemIsCurrently", label: "Item is Currently", placeholder: "Select Item is Currently", type: "select", options: [{name:"In Store", value:"inStore"}, {name:"In Use", value:"inUse" }], defaultValue: "inStore" },

        { name: "itemUser", label: "Item User", placeholder: "Select Item User", type: "select", options: common.user, showIf: { itemIsCurrently: "inUse" }},
         { name: "AssignDate", label: "Assignment Date", placeholder: "Select Assignment Date", type: "date", showIf: { itemIsCurrently: "inUse" }},
        // { name: "endOfLifeDate", label: "End Of Life Date", type: "date" },
      ],
  
    },

    //! Assignment Information
    {
      sectionTitle: "Assignment Information",
      fields: [
        { name: "assignmentType", label: "Assignment Type", placeholder: "Select Assignment Type", type: "select", options: ["User", "Department", "Location"] },

        { name: "assignedUserId", label: "Assigned User", placeholder: "Enter Assigned User", type: "text", showIf: { assignmentType: "User" } },
        { name: "assignedDepartment", label: "Department", placeholder: "Enter Department", type: "text", showIf: { assignmentType: "Department" } },

        { name: "assignmentDate", label: "Assignment Date", placeholder: "Select Assignment Date", type: "date" },
        { name: "expectedReturnDate", label: "Expected Return Date", placeholder: "Select Expected Return Date", type: "date" },

        { name: "assignmentStatus", label: "Assignment Status", placeholder: "Select Assignment Status", type: "select", options: ["Assigned", "Returned", "Lost"] },

        { name: "handoverBy", label: "Handover By", placeholder: "Enter Handover By", type: "text" },
        { name: "receivedBy", label: "Received By", placeholder: "Enter Received By", type: "text" },
        { name: "handoverNotes", label: "Handover Notes", placeholder: "Enter Handover Notes", type: "textarea" },
      ],
    },

    //! Location & Other Information
    {
      sectionTitle: "Location & Other Information",
      fields: [

        //* location information
        { name: "organization", label: "Organization", placeholder: "Enter Organization", type: "text" },
        { name: "branch", label: "Branch", placeholder: "Select Branch", type: "select", options: common.branches },

        { name: "building", label: "Building", placeholder: "Enter Building", type: "text" },
        { name: "floor", label: "Floor", placeholder: "Enter Floor", type: "text" },
        { name: "room", label: "Room", placeholder: "Enter Room", type: "text" },

        { name: "locationType", label: "Location Type", placeholder: "Select Location Type", type: "select", options: ["Lab", "Office", "Server Room", "Classroom"] },

        { name: "rackNumber", label: "Rack Number", placeholder: "Enter Rack Number", type: "text" },
        { name: "rackUnit", label: "Rack Unit", placeholder: "Enter Rack Unit", type: "text" },

        //* other information
        
      ],
    },

    //! Network Details
    {
        sectionTitle: "Network Details",
        fields: [
          
          { name: "nicType", label: "NIC", placeholder: "Select NIC", type: "select", options: common.nicTypes },
          { name: "dhcpEnabled", label: "DHCP Enabled", placeholder: "Select DHCP Enabled", type: "select", options: common.booleanOptions },
          { name: "dhcpServer", label: "DHCP Server", placeholder: "Enter DHCP Server", type: "text", maxLength: 120, showIf: { dhcpEnabled: "Yes" } },
          { name: "ipv4Address", label: "IPv4 Address", placeholder: "Enter IPv4 Address", type: "text", maxLength: 40 },
          { name: "subnet", label: "Subnet / Mask", placeholder: "Enter Subnet / Mask", type: "text", maxLength: 40 },
          { name: "defaultGateway", label: "Default Gateway", placeholder: "Enter Default Gateway", type: "text", maxLength: 40 },
          { name: "dnsHostname", label: "DNS Hostname", placeholder: "Enter DNS Hostname", type: "text", maxLength: 120 },
          { name: "macAddress", label: "MAC Address", placeholder: "Enter MAC Address", type: "text", maxLength: 40 },
          { name: "ipv6Address", label: "IPv6 Address", placeholder: "Enter IPv6 Address", type: "text", maxLength: 80 },
          { name: "switchPort", label: "Switch Port", placeholder: "Enter Switch Port", type: "text", maxLength: 80, showIf: { nicType: "Ethernet" } },
          { name: "linkSpeedMbps", label: "Link Speed (Mbps)", placeholder: "Enter Link Speed (Mbps)", type: "number", min: 0, max: 100000, showIf: { nicType: "Ethernet" } },


          { name: "wifiSSID", label: "Wi-Fi SSID", placeholder: "Enter Wi-Fi SSID", type: "text", maxLength: 120, showIf: { nicType: "Wi-Fi" } },
          {
            name: "wifiSecurity",
            label: "Wi-Fi Security",
            placeholder: "Select Wi-Fi Security",
            type: "select",
            options: ["Open", "WPA2", "WPA3", "WPA2/WPA3"],
            showIf: { nicType: "Wi-Fi" },
          },
          {
            name: "wifiBand",
            label: "Wi-Fi Band",
            placeholder: "Select Wi-Fi Band",
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
