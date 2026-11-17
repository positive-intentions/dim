import Dim.Spec.Policy

/-!
  Structural facts about template preparation (laws over any correct prepare).
  Full byte-identical prepare lives in Rust/JS; Lean records the contracts.
-/

namespace Dim.Spec.Prepare

open Dim.Spec.Policy

structure PartInfo where
  kind : PartKind
  name : String
  valuePrefix : String := ""
  valueSuffix : String := ""
  rawText : Bool := false
  deriving Repr

structure Prepared where
  html : String
  parts : List PartInfo
  deriving Repr

/-- A prepare result is well-formed for `n` template segments (`n ≥ 1`). -/
def wellFormed (n : Nat) (p : Prepared) : Prop :=
  p.parts.length = n - 1 ∧
  (∀ part ∈ p.parts, checkBindingPolicy part.kind part.name = none) ∧
  (∀ part ∈ p.parts,
    part.kind = .attr →
      isEventHandlerAttr part.name = false ∧ toLower part.name ≠ "srcdoc")

/-- Keyed remount decision: remount iff key changed. -/
def shouldRemount (prevKey nextKey : Option String) : Bool :=
  match prevKey, nextKey with
  | none, _ => true
  | some a, some b => decide (a ≠ b)
  | some _, none => true

/-- Custom tag names contain `-` (expand_self_closing only touches these). -/
def isCustomTagName (name : String) : Bool :=
  name.toList.contains '-'

end Dim.Spec.Prepare
