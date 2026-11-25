#!/usr/bin/env node
/**
 * Populate Frontend/lib for GitHub Pages / relative ?dimLib=.
 *
 * Vite (build:frontend:vite) empties dist/, so after a full `npm run build`
 * dist/dim.global.js is gone while copies remain under Frontend/ from the
 * earlier webpack `cp -r dist/* ./Frontend`. Prefer dist/ when present
 * (build:lib + build:pages-lib alone); otherwise restore from Frontend/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function exists(p) {
  return fs.existsSync(p);
}

function resolveSource(preferred, fallback) {
  if (exists(preferred)) return preferred;
  if (exists(fallback)) return fallback;
  throw new Error(
    `copy-pages-lib: missing ${path.relative(root, preferred)} and ${path.relative(root, fallback)}`,
  );
}

function cp(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`copy-pages-lib: ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
}

const dimDist = path.join(root, "dist/dim.global.js");
const wasmDist = path.join(root, "dist/wasm/dim.global.js");
const dimSrc = resolveSource(dimDist, path.join(root, "Frontend/dim.global.js"));
const wasmSrc = resolveSource(
  wasmDist,
  path.join(root, "Frontend/wasm/dim.global.js"),
);
const verifySrc = path.join(root, "dist/dim.verify.global.js");
if (!exists(verifySrc)) {
  throw new Error("copy-pages-lib: missing dist/dim.verify.global.js (run build:verify first)");
}

// Restore wiped dist artifacts (vite empties dist/) so package exports stay valid.
if (dimSrc !== dimDist) cp(dimSrc, dimDist);
if (wasmSrc !== wasmDist) cp(wasmSrc, wasmDist);

const lib = path.join(root, "Frontend/lib");
fs.mkdirSync(lib, { recursive: true });

cp(dimDist, path.join(lib, "dim.global.js"));
cp(wasmDist, path.join(lib, "dim.wasm.global.js"));
cp(path.join(root, "examples/app-test/dim-test.global.js"), path.join(lib, "dim.test.global.js"));
cp(path.join(root, "examples/app-test/parse.js"), path.join(lib, "dim.parse.global.js"));

const cover = path.join(lib, "dim.cover.global.js");
fs.writeFileSync(
  cover,
  fs.readFileSync(path.join(root, "examples/app-test/parse.js"), "utf8") +
    fs.readFileSync(path.join(root, "examples/app-test/cover-instrument.js"), "utf8"),
);
console.log(`copy-pages-lib: examples/app-test/parse.js+cover-instrument.js -> Frontend/lib/dim.cover.global.js`);

cp(verifySrc, path.join(lib, "dim.verify.global.js"));
fs.writeFileSync(path.join(root, "Frontend/.nojekyll"), "");
console.log("copy-pages-lib: Frontend/.nojekyll");
