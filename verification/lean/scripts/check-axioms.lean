/-!
  Print axioms of `Dim.Proofs.all` and exit non-zero if `sorryAx` appears.
-/
import Dim.Proofs

open Lean Meta

def main : IO Unit := do
  initSearchPath (← findSysroot)
  let mods : Array Import := #[{ module := `Dim.Proofs }]
  let env ← importModules mods {} (trustLevel := 0)
  let name := `Dim.Proofs.all
  match env.find? name with
  | none => throw <| IO.userError s!"unknown declaration {name}"
  | some info =>
    let axioms := CollectAxioms.collect name env
    IO.println s!"axioms of {name}:"
    for a in axioms.toList do
      IO.println s!"  {a}"
    if axioms.contains `sorryAx then
      throw <| IO.userError "SOME PROOFS FAIL: Dim.Proofs.all depends on sorryAx"
    else
      IO.println "ALL PROOFS CHECK (no sorryAx)"
