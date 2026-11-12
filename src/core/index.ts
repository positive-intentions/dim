/**
 * Public API for Dim.
 *
 * Grouped by subsystem. `dim.ts` re-exports this surface so existing consumers
 * that import `src/core/dim.ts` keep working.
 */

// Renderer / template
export {
  html,
  css,
  unsafeCSS,
  keyed,
  renderChildren,
} from "./renderer/index.js";
export { DimElement } from "./element/dim-element.js";

// Element
export { define } from "./element/define";

// Hooks
export {
  useState,
  useEffect,
  useMemo,
  useRef,
  useStyle,
  useScope,
  useLazyScope,
} from "./hooks/index";

// Store
export { useStore } from "./store/useStore";
export { useDimStore } from "./store/useDimStore";
export { default as CryptoManager } from "./store/crypto-manager.js";
export { default as StorageManager } from "./store/storage-manager.js";
export { default as AsyncronousStateManager } from "./store/async-manager.js";
export { debouncedDispatcher } from "./store/events.js";

// Transitions
export {
  useViewTransition,
  viewTransitionStyles,
} from "./transitions/index.js";

// File system
export { useFS } from "./fs/useFS.js";
