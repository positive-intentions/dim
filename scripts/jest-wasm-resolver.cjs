/**
 * Jest resolver for `DIM_IMPL=wasm`: resolves normally, then swaps the JS
 * renderer / hooks / element modules (and the public entry) for the
 * WASM-backed shims, so the existing test suites run against the Rust core.
 */
const { redirect } = require("./wasm-redirects.cjs");

module.exports = (request, options) => {
  const resolved = options.defaultResolver(request, options);
  return redirect(resolved) || resolved;
};
