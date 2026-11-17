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
cargo test --manifest-path rust/dim-core/Cargo.toml --lib

echo "==> JS pure-core + oracle differential"
npm test -- --testPathPattern='pure.test|renderer.test|crypto-manager'

echo "==> ALL VERIFY CHECKS PASSED"
