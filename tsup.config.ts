import { defineConfig } from "tsup";

export default defineConfig({
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
});
