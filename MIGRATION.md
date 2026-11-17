# Migration guide

This document covers breaking API changes in recent Dim releases. If you are upgrading from an older version, review each section below.

## 0.1.2 — template / children security (experimental)

Dim is not production-stable yet; 0.1.2 hardens several XSS-adjacent defaults. Apps that relied on the old behaviour must update.

### `renderChildren(string)` is text, not HTML

**Before:** A string child was passed through `unsafeHTML` (with a brittle custom-element heuristic).

**After:** Strings render as text. Trusted markup must be wrapped explicitly:

```js
import { html, unsafeHTML, renderChildren } from "@positive-intentions/dim";

renderChildren("<b>x</b>");           // text: literally <b>x</b>
html`${unsafeHTML("<b>x</b>")}`;      // HTML (trusted only)
```

### Forbidden attribute / prop bindings

Templates that interpolate into `on*` attributes, `srcdoc`, or `.innerHTML` / `.outerHTML` now throw at prepare time:

```js
// Forbidden
html`<a onclick=${handler}>x</a>`;
html`<div .innerHTML=${htmlString}></div>`;

// Use instead
html`<a @click=${handler}>x</a>`;
html`<div>${unsafeHTML(trusted)}</div>`;
```

### URL attributes are sanitized

`href`, `src`, `action`, `formaction`, `xlink:href`, `poster`, and `ping` values are filtered. Allowed: `http:`, `https:`, `mailto:`, `tel:`, relative URLs, and `data:image/*` for `src`. Everything else becomes `about:invalid#dim`.

### `html` requires a real template literal

Calling `html()` with a plain string or a crafted array (no `.raw`) throws. Always use `` html`...` ``.

### `CryptoManager` hardening

- Keys are derived lazily (no eager constructor derivation).
- Derived keys are non-extractable.
- New payloads include `{ v, iter, salt, iv, encryptedData }`; legacy payloads remain decrypt-only.

See [security/analysis.md](./security/analysis.md) and [SECURITY.md](./SECURITY.md).

---

## `useStore` tuple includes `isSaving` (additive)

Each store entry is now:

```js
const [value, setValue, isLoading, setIsLoading, isSaving] = store.notes;
```

`isSaving` is `true` while a debounced persist to IndexedDB is pending or in flight, then `false` after a successful write. Existing callers that only destructure the first three elements keep working.

---

## `useDimStore` moved to `@positive-intentions/dim/react`

**Before:**

```js
import { useDimStore } from "@positive-intentions/dim";
```

**After:**

```js
import { useDimStore } from "@positive-intentions/dim/react";
```

The main entry no longer re-exports `useDimStore`, so a browser import of `@positive-intentions/dim` does not pull in React. Install `react` as a peer when you use the `/react` subpath.

---

## `useStore` encryption is opt-in

**Before:** A default password was baked into the framework. Encryption could be enabled implicitly:

```js
useStore({ count: useState(0) }, 'my-password');
```

**After:** Encryption is off by default. Pass an explicit key when you need encrypted persistence:

```js
// Plaintext persistence (default)
useStore({ count: useState(0) });

// Encrypted persistence
useStore({ count: useState(0) }, { encryptionKey: 'my-password' });

// Shorthand still supported
useStore({ count: useState(0) }, 'my-password');
```

There is no hardcoded fallback password. Existing data encrypted with the old default password must be re-encrypted or migrated manually if you relied on it.

---

## Object attributes in templates are JSON-only

**Before:** Object-like template attributes were evaluated with `new Function`:

```js
html`<my-comp todo={{ id: 1, label: 'x' }}></my-comp>`
```

**After:** Only valid JSON object literals are parsed. Functions, `undefined`, and non-JSON expressions are not supported in attribute syntax:

```js
// Still works (JSON)
html`<my-comp todo='{"id":1,"label":"x"}'></my-comp>`

// For functions or non-JSON values, use .props
html`<my-comp .props=${{ todo: item, onSelect: handleSelect }}></my-comp>`
```

---

## `useFS` requires an explicit encryption password

**Before:** `encrypt: true` could fall back to a default password.

**After:** You must pass `encryptionPassword` when encryption is enabled:

```js
useFS({ encrypt: true, encryptionPassword: 'my-secret' });
```

Calling `useFS({ encrypt: true })` without a password throws at runtime.

---

## Crypto payload format (backward compatible on read)

**Before:** Encrypted values were stored as:

```json
{ "encryptedData": "...", "iv": "..." }
```

**After (0.1.x):** New encryptions embed a per-record random salt:

```json
{ "encryptedData": "...", "iv": "...", "salt": "..." }
```

**After (0.1.2):** Versioned payload with iteration count:

```json
{ "v": 2, "iter": 1000000, "salt": "...", "iv": "...", "encryptedData": "..." }
```

`decryptData` still reads legacy formats (no `salt` / no `v`) using a deterministic fallback salt derived from the password when needed. No migration is required for existing stored data, but new writes use the v2 format.
