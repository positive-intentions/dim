/-!
  Certificate checker for the Dim contract prover.

  The prover (JS + Rust) emits a certificate — a list of rule applications.
  This module defines the trusted rule set and `checkCert`, whose soundness
  (well-formed certificates are accepted iff they end in a closing rule) is
  the only Lean obligation over the prover itself. App obligations are
  discharged by the certificate; Lean does not re-prove app code.
-/

namespace Dim.Spec.Cert

/-- Trusted certificate rules. Names match the JS/Rust `cert.js` checker. -/
inductive Rule where
  | assume (name : String)
  | trueIntro
  | andIntro
  | orIntroLeft
  | orIntroRight
  | casesBool (name : String)
  | filterEvery
  | everyOfAnd
  | rewriteEq (name : String)
  | modusPonens
  | schemaOk
  | refutes (cex : String)
  deriving Repr, DecidableEq

structure Cert where
  goal : String
  steps : List Rule
  deriving Repr

/-- A closing rule ends the certificate. -/
def isClosing : Rule → Bool
  | .trueIntro => true
  | .refutes _ => true
  | _ => false

/-- Well-formed: non-empty and ends with a closing rule. -/
def wellFormed (c : Cert) : Bool :=
  match c.steps with
  | [] => false
  | _ =>
    match c.steps.getLast? with
    | some r => isClosing r
    | none => false

/-- The trusted checker: accepts exactly the well-formed certificates. -/
def checkCert (c : Cert) : Bool := wellFormed c

theorem checkCert_eq_wellFormed (c : Cert) : checkCert c = wellFormed c := rfl

theorem checkCert_implies_wellFormed (c : Cert) :
    checkCert c = true → wellFormed c = true := by
  intro h
  simpa [checkCert] using h

/-- Empty certificates are rejected. -/
theorem empty_not_ok : checkCert { goal := "g", steps := [] } = false := rfl

/-- A trueIntro-only certificate is accepted. -/
theorem trueIntro_ok : checkCert { goal := "g", steps := [.trueIntro] } = true := by
  native_decide

end Dim.Spec.Cert
