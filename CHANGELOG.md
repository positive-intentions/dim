# @positive-intentions/dim

## 0.1.1

### Patch Changes

- [`aaf88d1`](https://github.com/positive-intentions/dim/commit/aaf88d1e6d9a74c7007ccd351c91748205330795) - Debounce encrypted `useStore` persistence (single encrypt per flush) and expose `isSaving` on each store tuple so UIs can show save status and avoid refresh-before-write data loss.

- [`aaf88d1`](https://github.com/positive-intentions/dim/commit/aaf88d1e6d9a74c7007ccd351c91748205330795) - Prevent stale encrypted `useStore` async echoes from overwriting newer local writes (fixes delayed typing / caret jumps on controlled inputs).

## 0.1.0

### Minor Changes

- c6a629b: First npm release of the Dim core API (`define`, hooks, `html`/`css`, `useStore`, `useFS`, and related utilities).

### Patch Changes

- Move `useDimStore` to `@positive-intentions/dim/react` so the main entry stays React-free for native ESM / no-bundler browser use.
