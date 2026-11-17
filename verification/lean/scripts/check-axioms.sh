#!/usr/bin/env bash
# Fail if Dim/ sources contain `sorry`.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if grep -RIn --include='*.lean' -E '\bsorry\b' Dim/; then
  echo "SOME PROOFS FAIL: found sorry in Dim/"
  exit 1
fi

echo "ALL PROOFS CHECK (no sorry in Dim/ sources)"
