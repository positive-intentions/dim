import Lake
open Lake DSL

package «dim-verify» where
  -- Standalone; no Mathlib dependency for fast CI.

@[default_target]
lean_lib Dim where
  roots := #[`Dim]

lean_lib OracleSupport where
  roots := #[`Oracle.Validate, `Oracle.Cert]

lean_exe «dim-oracle» where
  root := `Oracle.Main
  supportInterpreter := true
