import Dim.Laws
import Dim.Refinement.HandModel

/-!
  Proofs of `Dim.Laws`. No unfinished proofs.
-/

namespace Dim.Proofs

open Dim.Spec.Policy
open Dim.Spec.Prepare
open Dim.Spec.Validate
open Dim.Spec.Cert
open Dim.Laws

theorem escapeChars_never_lt (cs : List Char) : '<' ∉ escapeChars cs := by
  induction cs with
  | nil => simp [escapeChars]
  | cons c rs ih =>
    simp only [escapeChars]
    split
    · simp; exact ih
    · split
      · simp; exact ih
      · split
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
  split
  · native_decide
  · split
    · native_decide
    · rename_i hNotEmpty hNotProto
      split
      · next colon =>
        split
        · split
          · next sch => simpa [SafeUrl.toString] using hNotProto
          · split
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

theorem validate_text_never_lt : Laws.validate_text_never_lt := by
  intro hi cs
  exact ⟨escapeChars_never_lt cs, escapeChars_never_lt (truncate16 cs hi)⟩

theorem cert_checker_sound : Laws.cert_checker_sound :=
  checkCert_implies_wellFormed

theorem validate_sound_stable : Laws.validate_sound_stable := by
  refine ⟨?bool, ?int, ?num, ?enum, ?fn, ?any⟩
  · intro b; simp [validate, noPol]
  · intro lo hi n hlo hhi
    simp [validate, noPol, vnum, hlo, hhi]
  · intro lo hi n hlo hhi
    simp [validate, noPol, vnum, hlo, hhi]
  · intro vals v hall
    simp [validate, noPol, hall]
  · intro v hfn
    simp [validate, noPol, hfn]
  · intro v
    simp [validate]

theorem validate_idempotent_stable : Laws.validate_idempotent_stable := by
  refine ⟨?bool, ?int, ?num, ?enum, ?fn, ?any⟩
  · intro p v h
    simp only [Conforms] at h
    obtain ⟨b, rfl⟩ := h
    simp [validate]
  · intro lo hi p v h
    simp only [Conforms] at h
    obtain ⟨n, rfl, hn⟩ := h
    simp [validate, vnum, hn]
  · intro lo hi p v h
    simp only [Conforms] at h
    obtain ⟨n, rfl, hn⟩ := h
    simp [validate, vnum, hn]
  · intro vals p v h
    simp only [Conforms] at h
    simp [validate, h]
  · intro p v h
    simp only [Conforms] at h
    cases h with
    | inl hfn => simp [validate, hfn]
    | inr hnoop =>
      have : isPh "$fn" v = true := by
        simp [hnoop, noopFn, isPh]
      simp [validate, this]
  · intro v _
    simp [validate]

theorem all : Laws.all :=
  ⟨escape_never_lt, sanitize_no_protocol_relative, sanitize_sound,
    no_on_attr_bindings, no_srcdoc_bindings, no_dangerous_prop_bindings,
    class_attr_ok, keyed_remount_iff, custom_tag_has_dash,
    validate_sound_stable, validate_idempotent_stable, validate_text_never_lt,
    cert_checker_sound⟩

theorem refinement_ok :
    (∀ s, Dim.Refinement.HandModel.rustEscapeText s = escapeText s) ∧
    (∀ n v, Dim.Refinement.HandModel.rustSanitizeUrl n v = sanitizeUrl n v) :=
  ⟨Dim.Refinement.HandModel.escape_refines,
    Dim.Refinement.HandModel.sanitize_refines⟩

end Dim.Proofs
