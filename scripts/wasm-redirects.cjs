/**
 * Module redirects for the WASM runtime build.
 *
 * Store / transitions / fs modules from `src/core` are reused as-is by the
 * WASM entry. Their imports of the JS renderer, hooks and element modules are
 * redirected here to the WASM-backed shims in `src/wasm`, so there is exactly
 * one runtime (one template cache, one current-instance) per bundle.
 * Shared by `tsup.wasm.config.ts` (esbuild plugin) and the Jest resolver.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const core = (p) => path.join(root, "src/core", p);
const shim = (p) => path.join(root, "src/wasm", p);

const REDIRECTS = {
  [core("index.ts")]: shim("index.ts"),
  [core("dim.ts")]: shim("index.ts"),
  [core("renderer/index.js")]: shim("renderer.ts"),
  [core("renderer/css.js")]: shim("renderer.ts"),
  [core("renderer/focus.js")]: shim("renderer.ts"),
  [core("renderer/template.js")]: shim("renderer.ts"),
  [core("renderer/commit.js")]: shim("renderer.ts"),
  [core("element/instance.ts")]: shim("instance.ts"),
  [core("element/define.ts")]: shim("element.ts"),
  [core("element/dim-element.js")]: shim("element.ts"),
  [core("element/props.ts")]: shim("element.ts"),
  [core("hooks/index.ts")]: shim("hooks.ts"),
  [core("hooks/useState.ts")]: shim("hooks.ts"),
  [core("hooks/useEffect.ts")]: shim("hooks.ts"),
  [core("hooks/useMemo.ts")]: shim("hooks.ts"),
  [core("hooks/useRef.ts")]: shim("hooks.ts"),
  [core("hooks/useStyle.ts")]: shim("hooks.ts"),
  [core("hooks/useScope.ts")]: shim("hooks.ts"),
};

const EXTENSIONS = ["", ".ts", ".js", "/index.ts", "/index.js"];

/** Resolve a relative specifier to an absolute file path (or null). */
function resolveRelative(specifier, fromDir) {
  if (!specifier.startsWith(".")) return null;
  const base = path.resolve(fromDir, specifier);
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function redirect(resolvedPath) {
  return REDIRECTS[resolvedPath] || null;
}

module.exports = { REDIRECTS, redirect, resolveRelative, root };
