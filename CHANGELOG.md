# @positive-intentions/dim

## 0.1.2

### Patch Changes

- Experimental security hardening for the template / commit path (JS and Rust/WASM): safer `renderChildren`, attribute/URL policy, template-strings check, Trusted Types when available
- `CryptoManager`: lazy derivation, non-extractable keys, versioned payloads (legacy still decrypts)
- Extract DOM-free pure core (`src/core/renderer/pure`, `rust/dim-spec-core`) with Lean 4 laws + oracle and differential tests
- See [MIGRATION.md](./MIGRATION.md), [SECURITY.md](./SECURITY.md), [security/analysis.md](./security/analysis.md)

## 0.1.1

### Patch Changes

- Initial published library surface with JS and WASM runtimes
