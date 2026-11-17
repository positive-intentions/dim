#!/usr/bin/env bash
# Regenerate Aeneas Lean output from rust/dim-spec-core.
# Requires Charon + Aeneas on PATH (or a pinned docker image).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/verification/lean/Dim/Refinement/Generated.lean"

if [[ "${VERIFY_AENEAS:-}" != "1" ]]; then
  echo "VERIFY_AENEAS!=1 — skipping Aeneas regenerate (hand model remains)."
  exit 0
fi

if ! command -v charon >/dev/null 2>&1 || ! command -v aeneas >/dev/null 2>&1; then
  echo "Charon/Aeneas not installed; leaving hand model in place."
  echo "Install from https://github.com/AeneasVerif/aeneas and re-run with VERIFY_AENEAS=1."
  exit 0
fi

cd "$ROOT/rust/dim-spec-core"
charon cargo -- extract
aeneas -backend lean -dest "$OUT" charon-ml/*.llbc
echo "Wrote $OUT"
