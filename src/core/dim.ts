/**
 * Compatibility shim. The public API lives in `./index.ts`.
 * Kept so module federation, website docs, and existing imports of
 * `src/core/dim.ts` continue to resolve.
 */
export * from "./index";
