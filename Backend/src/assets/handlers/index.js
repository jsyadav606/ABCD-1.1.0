/**
 * Asset Handlers Registry
 * Description: itemType -> handler mapping. New asset types ko plug karo.
 * Fixed assets: cpu, laptop, monitor, printer (each has own handler, shared asset_fixed collection)
 * Peripheral assets: camera, keyboard, mouse, headphone (each has own handler, shared asset_peripheral collection)
 */
import cpu from "./fixed/cpu.handler.js";
import monitor from "./fixed/monitor.handler.js";
import laptop from "./fixed/laptop.handler.js";
import printer from "./fixed/printer.handler.js";
import camera from "./peripheral/camera.handler.js";
import keyboard from "./peripheral/keyboard.handler.js";
import mouse from "./peripheral/mouse.handler.js";
import headphone from "./peripheral/headphone.handler.js";

export const handlers = {
  cpu,
  laptop,
  monitor,
  printer,
  camera,
  keyboard,
  mouse,
  headphone,
  __generic: null,
};
