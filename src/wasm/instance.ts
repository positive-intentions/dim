/**
 * WASM-backed replacement for `src/core/element/instance.ts`. The rendering
 * host is tracked in Rust so JS hooks (`useViewTransition`) and Rust hooks
 * share one hook index.
 */
import "./load";
import * as wasm from "./generated/pkg/dim_core.js";

export function setCurrentInstance(instance) {
  wasm.setCurrentInstance(instance);
}

export function getCurrentInstance() {
  return wasm.currentInstance();
}
