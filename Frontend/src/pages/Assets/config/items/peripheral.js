import { common } from "../common.js";
import { fromGeneric } from "../sectionManager.js";

export const peripheralConfigs = {
  webcam: {
    sections: [
      fromGeneric("Basic Information", {
        pickFields: ["assetName", "manufacturer", "model"],
        overrideFields: [
          { name: "assetName", label: "Webcam Name", required: true, maxLength: 80 },
          { name: "manufacturer", required: true, maxLength: 80 },
          { name: "model", maxLength: 80 },
        ],
        addFields: [
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "webcamType",
            label: "Webcam Type",
            type: "select",
            options: [
              { value: "External USB", label: "External USB Webcam" },
              { value: "Built-in", label: "Built-in Webcam" },
              { value: "PTZ", label: "PTZ Camera (Pan-Tilt-Zoom)" },
              { value: "Conference Camera", label: "Conference Camera" },
            ],
          },
        ],
      }),
      {
        sectionTitle: "Camera Specifications",
        fields: [
          {
            name: "resolution",
            label: "Maximum Resolution",
            type: "select",
            options: [
              { value: "720p", label: "HD (720p)" },
              { value: "1080p", label: "Full HD (1080p)" },
              { value: "1440p", label: "2K (1440p)" },
              { value: "4K", label: "Ultra HD (4K)" },
            ],
          },
          { name: "frameRate", label: "Frame Rate (FPS)", type: "number", min: 0, max: 240 },
          {
            name: "sensorType",
            label: "Sensor Type",
            type: "select",
            options: [
              { value: "CMOS", label: "CMOS" },
              { value: "CCD", label: "CCD" },
            ],
          },
          { name: "fieldOfView", label: "Field of View (Degrees)", type: "number", min: 0, max: 180 },
          { name: "autoFocus", label: "Auto Focus", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Audio Features",
        fields: [
          { name: "builtInMicrophone", label: "Built-in Microphone", type: "select", options: common.booleanOptions },
          { name: "microphoneType", label: "Microphone Type", type: "text", maxLength: 80 },
          { name: "noiseReduction", label: "Noise Reduction", type: "select", options: common.booleanOptions },
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
              { value: "USB-C", label: "USB-C" },
              { value: "Wireless", label: "Wireless" },
            ],
          },
          { name: "cableLength", label: "Cable Length (meters)", type: "number", min: 0, max: 10 },
          { name: "plugAndPlay", label: "Plug and Play Support", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Mounting & Physical",
        fields: [
          {
            name: "mountType",
            label: "Mount Type",
            type: "select",
            options: [
              { value: "Monitor Clip", label: "Monitor Clip" },
              { value: "Tripod", label: "Tripod Mount" },
              { value: "Wall", label: "Wall Mount" },
            ],
          },
          { name: "tripodSupport", label: "Tripod Support", type: "select", options: common.booleanOptions },
          { name: "color", label: "Color", type: "text", maxLength: 40 },
          { name: "weight", label: "Weight (grams)", type: "number", min: 0, max: 2000 },
        ],
      },
      {
        sectionTitle: "Compatibility",
        fields: [
          { name: "supportedOS", label: "Supported OS", type: "text", maxLength: 200 },
          { name: "softwareSupport", label: "Supported Software", type: "text", maxLength: 200 },
        ],
      },
      {
        sectionTitle: "Asset Details",
        fields: [
          { name: "assetSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "assetTag", label: "Asset Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Asset Status",
        fields: [
          { name: "status", label: "Asset Status", type: "select", options: common.status },
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
  headphone: {
    sections: [
      {
        sectionTitle: "Basic Information",
        fields: [
          { name: "name", label: "Headphone Name", type: "text", required: true, maxLength: 80 },
          { name: "model", label: "Model", type: "text", maxLength: 80 },
          { name: "manufacturer", label: "Manufacturer", type: "text", required: true, maxLength: 80 },
          { name: "deviceTag", label: "Device Tag", type: "text", maxLength: 50 },
          {
            name: "headphoneType",
            label: "Headphone Type",
            type: "select",
            options: [
              { value: "Over-Ear", label: "Over-Ear" },
              { value: "On-Ear", label: "On-Ear" },
              { value: "In-Ear", label: "In-Ear (Earbuds)" },
              { value: "Headset", label: "Headset (With Mic)" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Audio Specifications",
        fields: [
          { name: "driverSize", label: "Driver Size (mm)", type: "number", min: 5, max: 100 },
          { name: "frequencyResponse", label: "Frequency Response (Hz)", type: "text", maxLength: 80 },
          { name: "impedance", label: "Impedance (Ohms)", type: "number", min: 1, max: 1000 },
          { name: "sensitivity", label: "Sensitivity (dB)", type: "number", min: 50, max: 150 },
          {
            name: "noiseCancellation",
            label: "Noise Cancellation",
            type: "select",
            options: [
              { value: "None", label: "None" },
              { value: "Passive", label: "Passive" },
              { value: "Active", label: "Active (ANC)" },
            ],
          },
        ],
      },
      {
        sectionTitle: "Microphone",
        fields: [
          { name: "hasMicrophone", label: "Built-in Microphone", type: "select", options: common.booleanOptions },
          {
            name: "micType",
            label: "Microphone Type",
            type: "select",
            options: [
              { value: "Boom Mic", label: "Boom Mic" },
              { value: "Inline Mic", label: "Inline Mic" },
              { value: "Built-in Mic", label: "Built-in Mic" },
            ],
          },
          { name: "noiseReductionMic", label: "Mic Noise Reduction", type: "select", options: common.booleanOptions },
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
              { value: "Wired", label: "Wired" },
              { value: "Wireless", label: "Wireless" },
              { value: "Bluetooth", label: "Bluetooth" },
            ],
          },
          { name: "cableLength", label: "Cable Length (meters)", type: "number", min: 0, max: 10 },
          { name: "bluetoothVersion", label: "Bluetooth Version", type: "text", maxLength: 40 },
        ],
      },
      {
        sectionTitle: "Power",
        fields: [
          { name: "batteryLife", label: "Battery Life (hours)", type: "number", min: 0, max: 500 },
          { name: "chargingTime", label: "Charging Time (hours)", type: "number", min: 0, max: 50 },
          { name: "chargingType", label: "Charging Type", type: "text", maxLength: 80 },
        ],
      },
      {
        sectionTitle: "Physical & Comfort",
        fields: [
          { name: "color", label: "Color", type: "text", maxLength: 40 },
          { name: "weight", label: "Weight (grams)", type: "number", min: 0, max: 2000 },
          { name: "foldable", label: "Foldable", type: "select", options: common.booleanOptions },
        ],
      },
      {
        sectionTitle: "Asset Details",
        fields: [
          { name: "assetSerial", label: "Serial Number", type: "text", maxLength: 80 },
          { name: "assetTag", label: "Asset Tag", type: "text", required: true, maxLength: 60 },
          { name: "barcode", label: "Barcode / QR Code", type: "text", maxLength: 80 },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          { name: "purchaseCost", label: "Purchase Cost", type: "number", min: 0, max: 10000000 },
          { name: "purchaseDate", label: "Purchase Date", type: "date" },
          { name: "warrantyExpiryDate", label: "Warranty Expiry Date", type: "date" },
          { name: "location", label: "Location", type: "text", maxLength: 120 },
        ],
      },
      {
        sectionTitle: "Asset Status",
        fields: [
          { name: "status", label: "Asset Status", type: "select", options: common.status },
          { name: "state", label: "State", type: "select", options: common.status },
          { name: "stateComments", label: "State Comments", type: "textarea", maxLength: 400 },
        ],
      },
    ],
  },
  keyboard: {
    sections: [
      {
        sectionTitle: "Keyboard Details",
        fields: [
          { name: "modelNumber", label: "Model Number", type: "text", required: true },
          { name: "serialNumber", label: "Serial Number", type: "text" },
          { name: "vendor", label: "Vendor", type: "select", options: common.vendors },
          {
            name: "keyboardType",
            label: "Type",
            type: "select",
            options: [
              { value: "Mechanical", label: "Mechanical" },
              { value: "Membrane", label: "Membrane" },
            ],
          },
        ],
      },
    ],
  },
};

