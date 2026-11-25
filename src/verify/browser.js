/**
 * Browser entry for dim.verify.global.js.
 * The IIFE footer (tsup.verify.config.ts) attaches DimTest.verify.
 */
import verify, {
  add,
  clear,
  run,
  runDual,
  checkCert,
  lowerSource,
  proveObligation,
  listSources,
} from "./index.js";

const api = {
  add,
  clear,
  run,
  runDual,
  checkCert,
  lowerSource,
  proveObligation,
  listSources,
  version: "0.1.0",
};

export default api;
export { verify, api };
