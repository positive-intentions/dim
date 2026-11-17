/**
 * Synchronous WASM bootstrap for the single-file build. The module bytes are
 * inlined as base64, so no `fetch()` is needed and the build works wherever
 * the pure-JS build does (including `file://` pages).
 */
import { initSync } from "./generated/pkg/dim_core.js";
import { wasmBase64 } from "./generated/wasm-inline.js";

function decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

initSync({ module: decode(wasmBase64) });
