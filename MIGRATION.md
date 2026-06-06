# Migration guide

This document covers breaking API changes in recent Dim releases. If you are upgrading from an older version, review each section below.

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

**After:** New encryptions embed a per-record random salt:

```json
{ "encryptedData": "...", "iv": "...", "salt": "..." }
```

`decryptData` still reads the old format (no `salt` field) using a deterministic fallback salt derived from the password. No migration is required for existing stored data, but new writes use the salted format.
