# Aeneas refinement

This directory holds Lean models generated from `rust/dim-spec-core` by
[Charon](https://github.com/AeneasVerif/charon) +
[Aeneas](https://github.com/AeneasVerif/aeneas), plus equivalence proofs
against `Dim.Spec`.

## Status

| Function | Aeneas | Equivalence proof |
| -------- | ------ | ----------------- |
| `sanitize_url` | Hand model in `HandModel.lean` (Aeneas optional) | Proven equal to `Dim.Spec.Policy.sanitizeUrl` on the hand model |
| `escape_text` | Hand model | Proven |
| `check_binding_policy` | Hand model | Proven |
| `prepare` | Unproven — conformance-tested vs Lean oracle / JS / Rust | — |

Regenerate Aeneas output (optional, requires toolchain):

```bash
VERIFY_AENEAS=1 ./scripts/aeneas-regenerate.sh
```

CI runs the regenerate script only when `VERIFY_AENEAS=1` is set; otherwise it
checks that committed hand models still prove against the spec.
