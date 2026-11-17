/-!
  Attribute / URL / prop safety policy — Lean reference for dim's pure core.
-/

namespace Dim.Spec.Policy

inductive PartKind where
  | child | attr | prop | event | bool | ref
  deriving DecidableEq, Repr

def PartKind.toNat : PartKind → Nat
  | .child => 0 | .attr => 1 | .prop => 2
  | .event => 3 | .bool => 4 | .ref => 5

def partKindOfNat : Nat → Option PartKind
  | 0 => some .child | 1 => some .attr | 2 => some .prop
  | 3 => some .event | 4 => some .bool | 5 => some .ref | _ => none

def toLowerChar (c : Char) : Char :=
  if 'A' ≤ c ∧ c ≤ 'Z' then Char.ofNat (c.toNat + 32) else c

def toLower (s : String) : String := s.map toLowerChar

def isAsciiLower (c : Char) : Bool := 'a' ≤ c ∧ c ≤ 'z'

def isEventHandlerAttr (name : String) : Bool :=
  let lower := toLower name
  decide (lower.length ≥ 3)
    && lower.startsWith "on"
    && (lower.drop 2).all isAsciiLower

def forbiddenAttrNames : List String := ["srcdoc"]
def forbiddenPropNames : List String := ["innerHTML", "outerHTML"]
def urlAttrNames : List String :=
  ["href", "src", "action", "formaction", "xlink:href", "poster", "ping"]
def allowedSchemes : List String := ["http:", "https:", "mailto:", "tel:"]

def isUrlAttr (name : String) : Bool :=
  urlAttrNames.contains (toLower name)

def checkBindingPolicy (kind : PartKind) (name : String) : Option String :=
  match kind with
  | .attr =>
    if isEventHandlerAttr name then
      some s!"forbidden on* attribute: {name}"
    else if forbiddenAttrNames.any (fun n => toLower n = toLower name) then
      some s!"forbidden attribute: {name}"
    else none
  | .prop =>
    if forbiddenPropNames.contains name then
      some s!"forbidden property: {name}"
    else none
  | _ => none

def isDataImage (raw : String) : Bool :=
  let lower := toLower raw
  lower.startsWith "data:image/"
    && match (lower.drop "data:image/".length).toList with
       | c :: _ => Char.isAlphanum c
       | [] => false

/-- First index of `:` in `s`, if any. -/
def findColon (s : String) : Option Nat :=
  let rec go (cs : List Char) (i : Nat) : Option Nat :=
    match cs with
    | [] => none
    | c :: rest => if c == ':' then some i else go rest (i + 1)
  go s.toList 0

inductive AllowedScheme where
  | http | https | mailto | tel
  deriving DecidableEq, Repr

def AllowedScheme.toString : AllowedScheme → String
  | .http => "http:" | .https => "https:"
  | .mailto => "mailto:" | .tel => "tel:"

def parseAllowedScheme (schemeColon : String) : Option AllowedScheme :=
  match schemeColon with
  | "http:" => some .http | "https:" => some .https
  | "mailto:" => some .mailto | "tel:" => some .tel
  | _ => none

/-- Canonical safe URL result (easy to prove allowlisted). -/
inductive SafeUrl where
  | empty
  | relative (s : String)
  | absolute (scheme : AllowedScheme) (raw : String)
  | dataImage (raw : String)
  | invalid
  deriving Repr

def SafeUrl.toString : SafeUrl → String
  | .empty => ""
  | .relative s => s
  | .absolute _ raw => raw
  | .dataImage raw => raw
  | .invalid => "about:invalid#dim"

/-- Core sanitizer producing a tagged safe URL. -/
def sanitizeUrlSafe (name : String) (value : String) : SafeUrl :=
  let raw := value.trim
  if raw.isEmpty then .empty
  else if raw.startsWith "//" then .invalid
  else
    match findColon raw with
    | some colon =>
      if colon > 0 then
        let scheme := (toLower raw).take (colon + 1)
        match parseAllowedScheme scheme with
        | some sch => .absolute sch raw
        | none =>
          if toLower name == "src" && isDataImage raw then .dataImage raw
          else .invalid
      else
        .relative raw
    | none => .relative raw

def sanitizeUrl (name : String) (value : String) : String :=
  (sanitizeUrlSafe name value).toString

/-- Character-list escape (proof-friendly, if-then-else). -/
def escapeChars (cs : List Char) : List Char :=
  match cs with
  | [] => []
  | c :: rs =>
    if c = '&' then ['&', 'a', 'm', 'p', ';'] ++ escapeChars rs
    else if c = '<' then ['&', 'l', 't', ';'] ++ escapeChars rs
    else if c = '>' then ['&', 'g', 't', ';'] ++ escapeChars rs
    else c :: escapeChars rs

def escapeText (text : String) : String :=
  String.ofList (escapeChars text.toList)

def isAllowedSanitizeResult (_name : String) (out : String) : Bool :=
  if out.isEmpty then true
  else if out == "about:invalid#dim" then true
  else if out.startsWith "//" then false
  else
    match findColon out with
    | none => true
    | some colon =>
      if colon = 0 then true
      else
        let scheme := (toLower out).take (colon + 1)
        allowedSchemes.contains scheme
          || (scheme == "data:" && isDataImage out)
          || out.startsWith "about:invalid"

end Dim.Spec.Policy
