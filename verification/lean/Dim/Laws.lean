import Dim.Spec.Policy
import Dim.Spec.Prepare

/-!
  Human-owned security and correctness laws for dim's pure core.
  Agents must not weaken these statements — only prove them in `Dim.Proofs`.
-/

namespace Dim.Laws

open Dim.Spec.Policy
open Dim.Spec.Prepare

/-- `escapeText` / `escapeChars` never outputs `'<'`. -/
def escape_never_lt : Prop :=
  ∀ (cs : List Char), '<' ∉ escapeChars cs

/-- `sanitizeUrl` never returns a protocol-relative URL (`//…`). -/
def sanitize_no_protocol_relative : Prop :=
  ∀ (name value : String), ¬ (sanitizeUrl name value).startsWith "//"

/-- Event-handler attribute bindings are always rejected. -/
def no_on_attr_bindings : Prop :=
  ∀ (name : String), isEventHandlerAttr name = true →
    (checkBindingPolicy .attr name).isSome = true

/-- `srcdoc` attribute bindings are always rejected. -/
def no_srcdoc_bindings : Prop :=
  (checkBindingPolicy .attr "srcdoc").isSome = true

/-- `.innerHTML` / `.outerHTML` property bindings are always rejected. -/
def no_dangerous_prop_bindings : Prop :=
  (checkBindingPolicy .prop "innerHTML").isSome = true ∧
  (checkBindingPolicy .prop "outerHTML").isSome = true

/-- Safe attributes (e.g. `class`) are accepted. -/
def class_attr_ok : Prop :=
  checkBindingPolicy .attr "class" = none

/-- Keyed remount happens exactly when the key changes. -/
def keyed_remount_iff : Prop :=
  (shouldRemount none (some "a") = true) ∧
  (shouldRemount (some "a") (some "a") = false) ∧
  (shouldRemount (some "a") (some "b") = true)

/-- Custom-element detection for self-closing expansion. -/
def custom_tag_has_dash : Prop :=
  isCustomTagName "my-el" = true ∧ isCustomTagName "div" = false

/-- `sanitizeUrl` coincides with the tagged `SafeUrl` renderer. -/
def sanitize_sound : Prop :=
  ∀ (name value : String),
    sanitizeUrl name value = (sanitizeUrlSafe name value).toString

/-- Bundle of all laws (the CI gate). -/
def all : Prop :=
  escape_never_lt ∧
  sanitize_no_protocol_relative ∧
  sanitize_sound ∧
  no_on_attr_bindings ∧
  no_srcdoc_bindings ∧
  no_dangerous_prop_bindings ∧
  class_attr_ok ∧
  keyed_remount_iff ∧
  custom_tag_has_dash

end Dim.Laws
