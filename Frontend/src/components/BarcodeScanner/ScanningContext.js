import { createContext } from "react";

export const ScanningContext = createContext({
  openScan: (p0: (text: any) => any) => {},
});
