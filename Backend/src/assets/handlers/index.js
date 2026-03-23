/**
 * Asset Handlers Registry
 * Description: itemType -> handler mapping. Yahan new asset types ko plug karo.
 */
import cpu from "./cpu.handler.js";
import monitor from "./monitor.handler.js";
import laptop from "./laptop.handler.js";

export const handlers = {
  cpu,
  laptop,
  monitor,
  __generic: cpu,
};
