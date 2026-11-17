import { defineConfig, type Options } from "tsup";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { redirect, resolveRelative } = require("./scripts/wasm-redirects.cjs");

/** Redirect core renderer/hooks/element imports to the WASM shims. */
const wasmRedirects = (loader: "inline" | "split") => ({
  name: "dim-wasm-redirects",
  setup(build) {
    build.onResolve({ filter: /^\./ }, (args) => {
      const resolved = resolveRelative(args.path, args.resolveDir);
      if (!resolved) return undefined;
      if (loader === "split" && resolved.endsWith(path.join("src", "wasm", "load.ts"))) {
        return { path: resolved.replace(/load\.ts$/, "load-split.ts") };
      }
      const target = redirect(resolved);
      return target ? { path: target } : undefined;
    });
  },
});

const shared: Options = {
  entry: { index: "src/wasm/index.ts" },
  format: ["esm"],
  dts: false,
  sourcemap: true,
  treeshake: true,
  splitting: false,
  target: "es2022",
  outExtension() {
    return { js: ".mjs" };
  },
};

export default defineConfig([
  {
    ...shared,
    outDir: "dist/wasm",
    clean: false,
    esbuildPlugins: [wasmRedirects("inline")],
  },
  {
    ...shared,
    outDir: "dist/wasm/split",
    clean: false,
    esbuildPlugins: [wasmRedirects("split")],
  },
  // Classic <script> build (global `Dim`). Module scripts are blocked on
  // file:// pages in Chromium; a classic script with inlined wasm is not.
  {
    ...shared,
    entry: { dim: "src/wasm/index.ts" },
    format: ["iife"],
    globalName: "Dim",
    outDir: "dist/wasm",
    clean: false,
    outExtension() {
      return { js: ".global.js" };
    },
    esbuildPlugins: [wasmRedirects("inline")],
  },
]);
