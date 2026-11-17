# Dim security analysis

**Date:** 2026-11-17  
**Scope:** JS runtime (`src/core`), Rust/WASM runtime (`rust/dim-core`), store crypto, FS helpers, CI supply chain, dim-boilerplate integration notes  
**Status:** Findings below are fixed or mitigated in 0.1.2 unless marked *open* / *accepted*.

## Threat model

| Actor | Goal | Assets |
| ----- | ---- | ------ |
| Page author / app code | Compose UI safely | Template strings, bindings |
| Untrusted content (chat, notes, URLs) | XSS, navigation abuse | DOM, cookies, stored secrets |
| Network / supply chain | Substitute runtime or CI | npm package, Actions, remote ESM |
| Local attacker with memory dump | Extract crypto keys | `CryptoManager` keys, passwords |

Assumptions: shadow DOM does not stop XSS once HTML is parsed into the document; CSP may be absent; `unsafeHTML` / `unsafeCSS` are intentional escape hatches.

## Findings

### H1 — `renderChildren` treats strings as HTML (XSS)

**Severity:** High  
**Status:** Fixed in 0.1.2  

`renderChildren` in JS (`template.js`) and Rust (`dom.rs`) passed string children through `unsafeHTML`, with a heuristic (`-`, `<`, `>`) deciding whether to use a slot instead. Any attacker-controlled string child could execute markup/scripts.

**Fix:** Strings render as text. Raw HTML requires an explicit `unsafeHTML(...)` wrapper.

### H2 — No attribute / URL / dangerous-prop policy

**Severity:** High  
**Status:** Fixed in 0.1.2  

`ATTR_PART` called `setAttribute` with any name/value. Bindings such as `onclick="${x}"`, `href="${'javascript:...'}"`, and `srcdoc="${x}"` could run code. `PROP_PART` allowed `.innerHTML=${x}`.

**Fix:** `prepare` rejects `on*` attribute bindings and `srcdoc`. URL attributes are passed through `sanitizeUrl`. `.innerHTML` / `.outerHTML` prop bindings are rejected. Commit-time URL sanitization is a second line of defense.

### M1 — `html()` accepts crafted string arrays

**Severity:** Medium  
**Status:** Fixed in 0.1.2  

Calling `html` with a plain array (no `.raw`) or a bare string built a TemplateResult that could inject static markup and poison the template cache identity.

**Fix:** `html` requires a template-strings object with a `.raw` array; otherwise it throws.

### M2 — `CryptoManager` key handling

**Severity:** Medium  
**Status:** Fixed in 0.1.2  

- Constructor eagerly derived a key with a password-derived fallback salt  
- Derived keys were `extractable: true`  
- Cache keys included the plaintext password  
- Iteration count was not stored in the ciphertext payload  

**Fix:** Lazy derivation; non-extractable keys; per-instance cache keyed by salt only; versioned payload `{v, iter, salt, iv, data}`; legacy payloads remain decrypt-only.

### M3 — WASM panics abort the module

**Severity:** Medium  
**Status:** Mitigated in 0.1.2  

`panic = "abort"` plus `unwrap()` on malformed input could trap the entire WASM instance.

**Fix:** Pure core returns `Result` / never panics on input; adapters map errors to JS exceptions. Remaining unwraps in DOM host code are limited to post-validation paths and documented.

### M4 — `useFS` path segments

**Severity:** Medium  
**Status:** Mitigated  

Path strings are split on `/` and each segment is passed to `getDirectoryHandle` / `removeEntry`. The File System Access API does not resolve `..` as parent traversal the way POSIX paths do, so classic `../` escape does not apply. Empty segments are filtered. Remaining risk: app code that trusts remote path strings for recursive `removeEntry`.

**Mitigation:** Document that path arguments must be app-controlled; reject segments equal to `.` or `..` in 0.1.2.

### L1 — `processStaticStrings` JSON attribute rewrite

**Severity:** Low  
**Status:** Accepted with guidance  

`attr={{...}}` is rewritten via `JSON.parse`. Values come from static template text (author-controlled), not interpolations. Risk is limited to confusing author errors / unexpected attribute shapes.

### L2 — `unsafeCSS`

**Severity:** Low (by design)  
**Status:** Documented  

`css` only interpolates `CSSResult` or numbers. `unsafeCSS` inserts raw CSS and can enable data exfiltration via `url()` if fed untrusted input. Callers must treat it like `unsafeHTML`.

### L3 — `mergeProps` / `__proto__`

**Severity:** Low  
**Status:** Accepted  

`Object.assign` of host props could set unusual keys. Custom element props are typically plain data; prototype pollution via `__proto__` is mitigated in modern engines for `Object.assign` onto a fresh object, but apps should not spread untrusted objects into `.props`.

### L4 — Trusted Types / CSP

**Severity:** Low  
**Status:** Partial  

Static template `innerHTML` and `unsafeHTML` require a Trusted Types policy when TT is enforced. 0.1.2 installs a `dim` policy when `trustedTypes` is available. Boilerplate `data:` import shims need `script-src data:`; remote dimui imports should use import-map integrity when available.

### L5 — CI supply chain

**Severity:** Low  
**Status:** Fixed in 0.1.2  

Actions were tagged (`@v4`) without commit SHAs; `ci.yml` lacked `permissions: contents: read`; no `cargo audit` / `npm audit` gate.

**Fix:** `verify.yml` + hardened workflows with read-only default permissions, SHA pins where practical, and audit jobs.

## Verification coverage

| Component | Proven (Lean) | Conformance-tested | Untested / host |
| --------- | ------------- | ------------------ | --------------- |
| Binding classification | Laws | JS + Rust vs oracle | — |
| `prepare` (pure) | Laws | JS + Rust vs oracle | DOM instantiation |
| `sanitizeUrl` / attr policy | Laws + proofs | JS + Rust vs oracle | — |
| Commit / event wiring | — | Unit tests | Browser DOM |
| `CryptoManager` | — | Unit tests | WebCrypto |
| Aeneas refinement of Rust | Scaffolded; see coverage table in README | Differential | Full Aeneas when `VERIFY_AENEAS=1` |

## Residual risk

- Escape hatches (`unsafeHTML`, `unsafeCSS`) remain footguns by design  
- DOM commit logic is not formally verified  
- Aeneas translation of the full Rust pure core may leave some functions unproven; those stay under differential testing  
