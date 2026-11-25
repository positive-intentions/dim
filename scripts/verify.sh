#!/usr/bin/env bash
# Local formal-verification + conformance gate.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Lean proofs"
(
  cd verification/lean
  lake build Dim
  bash scripts/check-axioms.sh
  lake build dim-oracle
)

echo "==> Aeneas (optional)"
bash scripts/aeneas-regenerate.sh

echo "==> Rust pure-core + oracle conformance"
cargo test --manifest-path rust/dim-spec-core/Cargo.toml
cargo test --manifest-path rust/dim-contract-core/Cargo.toml
cargo test --manifest-path rust/dim-verify-core/Cargo.toml --lib || \
  cargo test --manifest-path rust/Cargo.toml -p dim-verify-core --lib
cargo test --manifest-path rust/dim-core/Cargo.toml --lib

echo "==> JS pure-core + contracts + verify + oracle differential"
npm test -- --testPathPattern='pure.test|renderer.test|crypto-manager|contracts.test|conformance.test|verify.test'

echo "==> ALL VERIFY CHECKS PASSED"
