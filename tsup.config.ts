import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/core/index.ts",
      react: "src/core/react.ts",
    },
    format: ["esm"],
    dts: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false,
    external: ["react"],
    outDir: "dist",
    target: "es2022",
    outExtension() {
      return { js: ".mjs" };
    },
  },
  // Classic <script> build (global `Dim`). Chromium blocks module scripts on
  // file://; this IIFE is the pure-JS counterpart of dist/wasm/dim.global.js.
  {
    entry: { dim: "src/core/index.ts" },
    format: ["iife"],
    globalName: "Dim",
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
  },
]);
