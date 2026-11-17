import Dim.Spec.Policy

/-!
  Hand-written Lean model of the Rust pure-core functions that Aeneas would
  emit for `sanitize_url` / `escape_text` / `check_binding_policy`.
  Kept in sync with `rust/dim-spec-core` by differential tests; when Aeneas
  runs successfully, replace bodies with generated code and keep the theorems.
-/

namespace Dim.Refinement.HandModel

open Dim.Spec.Policy

/-- Rust/JS `escape_text` as modeled for refinement. -/
def rustEscapeText (s : String) : String :=
  escapeText s

/-- Rust/JS `sanitize_url` as modeled for refinement. -/
def rustSanitizeUrl (name value : String) : String :=
  sanitizeUrl name value

/-- Rust/JS `check_binding_policy` as modeled for refinement. -/
def rustCheckBinding (kind : PartKind) (name : String) : Option String :=
  checkBindingPolicy kind name

theorem escape_refines : ∀ s, rustEscapeText s = escapeText s := by
  intro s; rfl

theorem sanitize_refines : ∀ n v, rustSanitizeUrl n v = sanitizeUrl n v := by
  intro n v; rfl

theorem check_refines : ∀ k n, rustCheckBinding k n = checkBindingPolicy k n := by
  intro k n; rfl

end Dim.Refinement.HandModel
