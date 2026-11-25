import Lean.Data.Json
import Dim.Spec.Cert

/-!
  Oracle `checkCert` op: JSON certificate → Dim.Spec.Cert.checkCert → bool.
-/

namespace Oracle.Cert

open Lean (Json)
open Dim.Spec.Cert

def parseRule (j : Json) : Option Rule :=
  match j.getObjVal? "rule" with
  | .ok (.str "assume") =>
    let name := match j.getObjVal? "name" with | .ok (.str s) => s | _ => ""
    some (.assume name)
  | .ok (.str "trueIntro") => some .trueIntro
  | .ok (.str "andIntro") => some .andIntro
  | .ok (.str "orIntroLeft") => some .orIntroLeft
  | .ok (.str "orIntroRight") => some .orIntroRight
  | .ok (.str "casesBool") =>
    let name := match j.getObjVal? "name" with | .ok (.str s) => s | _ => ""
    some (.casesBool name)
  | .ok (.str "filterEvery") => some .filterEvery
  | .ok (.str "everyOfAnd") => some .everyOfAnd
  | .ok (.str "rewriteEq") =>
    let name := match j.getObjVal? "name" with | .ok (.str s) => s | _ => ""
    some (.rewriteEq name)
  | .ok (.str "modusPonens") => some .modusPonens
  | .ok (.str "schemaOk") => some .schemaOk
  | .ok (.str "refutes") =>
    let cex := match j.getObjVal? "cex" with | .ok (.str s) => s | _ => ""
    some (.refutes cex)
  | _ => none

def parseCert (j : Json) : Option Cert :=
  let goal := match j.getObjVal? "goal" with | .ok (.str s) => s | _ => ""
  match j.getObjVal? "steps" with
  | .ok (.arr xs) =>
    let steps := xs.toList.filterMap parseRule
    if steps.length != xs.size then none
    else some { goal := goal, steps := steps }
  | _ => none

def handle (line : String) : String :=
  match Json.parse line with
  | .error e => "{\"ok\":false,\"error\":\"" ++ e ++ "\"}"
  | .ok req =>
    let certJ := match req.getObjVal? "cert" with
      | .ok c => c
      | .error _ => req
    -- Unparseable / unknown rules ⇒ result false (same as JS checkCert).
    match parseCert certJ with
    | none => "{\"ok\":true,\"result\":false}"
    | some c =>
      let b := checkCert c
      "{\"ok\":true,\"result\":" ++ (if b then "true" else "false") ++ "}"

end Oracle.Cert
