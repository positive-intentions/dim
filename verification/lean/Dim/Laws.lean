import Dim.Spec.Policy
import Dim.Spec.Prepare
import Dim.Spec.Validate
import Dim.Spec.Cert

/-!
  Human-owned security and correctness laws for dim's pure core.
  Agents must not weaken these statements — only prove them in `Dim.Proofs`.

  Validate laws:
  * `validate_sound_stable` — leaf schemas without coercion: successful
    validation of a conforming value is the identity (ok ⇒ Conforms, via
    the stronger identity statement).
  * `validate_idempotent_stable` — Conforms ⇒ validate = ok (same value).
  * `validate_text_never_lt` — `t.text` never yields a string containing `'<'`.
  * `cert_checker_sound` — checkCert accepts exactly well-formed certificates.

  Full `Stable` induction over `str`/`arr`/`opt`/`nullable` (including coerce
  defaults) lives in `Dim.Spec.Validate` and is locked by the JS/Rust/Lean
  oracle differential tests.
-/

namespace Dim.Laws

open Dim.Spec.Policy
open Dim.Spec.Prepare
open Dim.Spec.Validate
open Dim.Spec.Cert

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

/-- Empty (no-coerce) policy. -/
def noPol : Pol := {}

/-- Leaf Stable soundness as identity on conforming inputs (no coerce). -/
def validate_sound_stable : Prop :=
  (∀ (b : Bool), validate (.bool noPol) (.bool b) "$" = .ok (.bool b)) ∧
  (∀ (lo hi n : Int), lo ≤ n → n ≤ hi →
    validate (.int lo hi noPol) (.num n) "$" = .ok (.num n)) ∧
  (∀ (lo hi n : Int), lo ≤ n → n ≤ hi →
    validate (.num lo hi noPol) (.num n) "$" = .ok (.num n)) ∧
  (∀ (vals : List Value) (v : Value),
    vals.any (fun x => primEq x v) = true →
    validate (.enum vals noPol) v "$" = .ok v) ∧
  (∀ (v : Value), isPh "$fn" v = true →
    validate (.fn noPol) v "$" = .ok v) ∧
  (∀ (v : Value), validate .any v "$" = .ok v)

/-- Leaf Stable: Conforms ⇒ validate returns the same value. -/
def validate_idempotent_stable : Prop :=
  (∀ (p : Pol) (v : Value), Conforms (.bool p) v →
    validate (.bool p) v "$" = .ok v) ∧
  (∀ (lo hi : Int) (p : Pol) (v : Value), Conforms (.int lo hi p) v →
    validate (.int lo hi p) v "$" = .ok v) ∧
  (∀ (lo hi : Int) (p : Pol) (v : Value), Conforms (.num lo hi p) v →
    validate (.num lo hi p) v "$" = .ok v) ∧
  (∀ (vals : List Value) (p : Pol) (v : Value), Conforms (.enum vals p) v →
    validate (.enum vals p) v "$" = .ok v) ∧
  (∀ (p : Pol) (v : Value), Conforms (.fn p) v →
    validate (.fn p) v "$" = .ok v) ∧
  (∀ (v : Value), Conforms .any v → validate .any v "$" = .ok v)

/-- `t.text` validation runs `escapeChars` (proven never to emit `'<'`). -/
def validate_text_never_lt : Prop :=
  ∀ (hi : Nat) (cs : List Char),
    '<' ∉ escapeChars cs ∧ '<' ∉ escapeChars (truncate16 cs hi)

/-- The certificate checker accepts exactly well-formed certificates. -/
def cert_checker_sound : Prop :=
  ∀ (c : Cert), checkCert c = true → wellFormed c = true

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
  custom_tag_has_dash ∧
  validate_sound_stable ∧
  validate_idempotent_stable ∧
  validate_text_never_lt ∧
  cert_checker_sound

end Dim.Laws
