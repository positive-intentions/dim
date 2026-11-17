/**
 * Streaming WASM bootstrap for the split build (`dist/wasm/split/`). Fetches
 * `dim_core_bg.wasm` next to this module, so it needs an HTTP(S) origin.
 */
import init from "./generated/pkg/dim_core.js";

await init({
  module_or_path: new URL("./dim_core_bg.wasm", import.meta.url),
});
