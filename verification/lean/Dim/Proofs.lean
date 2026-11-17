import Dim.Laws
import Dim.Refinement.HandModel

/-!
  Proofs of `Dim.Laws`. No `sorry`.
-/

namespace Dim.Proofs

open Dim.Spec.Policy
open Dim.Spec.Prepare
open Dim.Laws

theorem escapeChars_never_lt (cs : List Char) : '<' ∉ escapeChars cs := by
  induction cs with
  | nil => simp [escapeChars]
  | cons c rs ih =>
    simp only [escapeChars]
    split  -- c = '&' ?
    · simp; exact ih
    · split  -- c = '<' ?
      · simp; exact ih
      · split  -- c = '>' ?
        · simp; exact ih
        · rename_i h1 h2 h3
          intro h
          cases h with
          | head => exact h2 rfl
          | tail _ hm => exact ih hm

theorem escape_never_lt : Laws.escape_never_lt :=
  escapeChars_never_lt

theorem sanitize_sound : Laws.sanitize_sound := fun _ _ => rfl

theorem sanitize_no_protocol_relative : Laws.sanitize_no_protocol_relative := by
  intro name value
  change ¬ (sanitizeUrlSafe name value).toString.startsWith "//"
  dsimp only [sanitizeUrlSafe]
  split  -- isEmpty
  · native_decide
  · split  -- startsWith //
    · native_decide
    · rename_i hNotEmpty hNotProto
      split  -- findColon
      · next colon =>
        split  -- colon > 0
        · split  -- parseAllowedScheme
          · next sch => simpa [SafeUrl.toString] using hNotProto
          · split  -- data image
            · simpa [SafeUrl.toString] using hNotProto
            · native_decide
        · simpa [SafeUrl.toString] using hNotProto
      · simpa [SafeUrl.toString] using hNotProto

theorem no_srcdoc_bindings : Laws.no_srcdoc_bindings := by
  show (checkBindingPolicy .attr "srcdoc").isSome = true
  native_decide

theorem no_dangerous_prop_bindings : Laws.no_dangerous_prop_bindings := by
  show (checkBindingPolicy .prop "innerHTML").isSome = true ∧
       (checkBindingPolicy .prop "outerHTML").isSome = true
  native_decide

theorem class_attr_ok : Laws.class_attr_ok := by
  show checkBindingPolicy .attr "class" = none
  native_decide

theorem keyed_remount_iff : Laws.keyed_remount_iff := by
  show (shouldRemount none (some "a") = true) ∧
       (shouldRemount (some "a") (some "a") = false) ∧
       (shouldRemount (some "a") (some "b") = true)
  decide

theorem custom_tag_has_dash : Laws.custom_tag_has_dash := by
  show isCustomTagName "my-el" = true ∧ isCustomTagName "div" = false
  native_decide

theorem no_on_attr_bindings : Laws.no_on_attr_bindings := by
  intro name h
  simp [checkBindingPolicy, h]

theorem all : Laws.all :=
  ⟨escape_never_lt, sanitize_no_protocol_relative, sanitize_sound,
    no_on_attr_bindings, no_srcdoc_bindings, no_dangerous_prop_bindings,
    class_attr_ok, keyed_remount_iff, custom_tag_has_dash⟩

theorem refinement_ok :
    (∀ s, Dim.Refinement.HandModel.rustEscapeText s = escapeText s) ∧
    (∀ n v, Dim.Refinement.HandModel.rustSanitizeUrl n v = sanitizeUrl n v) :=
  ⟨Dim.Refinement.HandModel.escape_refines,
    Dim.Refinement.HandModel.sanitize_refines⟩

end Dim.Proofs
