/**
 * Public API for Dim.
 *
 * Grouped by subsystem. `dim.ts` re-exports this surface so existing consumers
 * that import `src/core/dim.ts` keep working.
 */
export { html, css, unsafeCSS, keyed, unsafeHTML, renderChildren, } from "./renderer/index.js";
export { DimElement } from "./element/dim-element.js";
export { define } from "./element/define";
export { useState, useEffect, useMemo, useRef, useStyle, useScope, useLazyScope, } from "./hooks/index";
export { useStore } from "./store/useStore";
export { default as CryptoManager } from "./store/crypto-manager.js";
export { default as StorageManager } from "./store/storage-manager.js";
export { default as AsyncronousStateManager } from "./store/async-manager.js";
export { debouncedDispatcher } from "./store/events.js";
export { useViewTransition, viewTransitionStyles, } from "./transitions/index.js";
export { useFS } from "./fs/useFS.js";
//# sourceMappingURL=index.d.ts.map