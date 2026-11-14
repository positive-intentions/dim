---
"@positive-intentions/dim": patch
---

Debounce encrypted `useStore` persistence (single encrypt per flush) and expose `isSaving` on each store tuple so UIs can show save status and avoid refresh-before-write data loss.
