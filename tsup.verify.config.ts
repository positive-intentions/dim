import { defineConfig } from "tsup";

/** Classic-script bundle: global `DimVerify` (+ attaches to `DimTest.verify`). */
export default defineConfig({
  entry: { "dim.verify": "src/verify/browser.js" },
  format: ["iife"],
  globalName: "DimVerify",
  dts: false,
  sourcemap: true,
  clean: false,
  treeshake: true,
  splitting: false,
  outDir: "dist",
  target: "es2022",
  outExtension() {
    return { js: ".global.js" };
  },
  // Injected inside the IIFE (before return) so `api` is in scope; also
  // overwrites the outer `var DimVerify = exports` with the usable API object.
  footer: {
    js: "globalThis.DimVerify=api;if(globalThis.DimTest)globalThis.DimTest.verify=api;",
  },
});
