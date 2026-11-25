/**
 * Public API for Dim backed by the Rust/WASM runtime core.
 *
 * Export surface is identical to `src/core/index.ts`, so switching an import
 * map from `dist/index.mjs` to `dist/wasm/index.mjs` needs no code changes.
 * Store, crypto, file-system and view-transition modules are reused from
 * `src/core`; at build time their imports of the renderer, hooks and element
 * modules are redirected to the WASM-backed shims in this folder.
 */
import "./load";

// Renderer / template
export {
  html,
  css,
  unsafeCSS,
  keyed,
  unsafeHTML,
  renderChildren,
} from "./renderer";
export { DimElement } from "./element";

// Element
export { define } from "./element";

// Hooks
export {
  useState,
  useEffect,
  useMemo,
  useRef,
  useStyle,
  useScope,
  useLazyScope,
} from "./hooks";

// Store
export { useStore } from "../core/store/useStore";
export { default as CryptoManager } from "../core/store/crypto-manager.js";
export { default as StorageManager } from "../core/store/storage-manager.js";
export { default as AsyncronousStateManager } from "../core/store/async-manager.js";
export { debouncedDispatcher } from "../core/store/events.js";

// Transitions
export {
  useViewTransition,
  viewTransitionStyles,
} from "../core/transitions/index.js";

// File system
export { useFS } from "../core/fs/useFS.js";

// Contracts: same API, Rust validator installed by ./contracts
export {
  t,
  contract,
  fold,
  validateValue,
  getValidatorEngine,
} from "./contracts";
