/**
 * Asset Handlers Registry
 * Description: itemType -> handler mapping. Yahan new asset types ko plug karo.
 */
import cpu from "./fixed/cpu.handler.js";
import monitor from "./fixed/monitor.handler.js";
import laptop from "./fixed/laptop.handler.js";
import printer from "./fixed/printer.handler.js";
import peripheral from "./peripheral/peripheral.handler.js";

export const handlers = {
  cpu,
  laptop,
  monitor,
  printer,
  peripheral,
  __generic: null,
};
