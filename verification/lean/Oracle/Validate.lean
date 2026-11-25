import Lean.Data.Json
import Dim.Spec.Validate

/-!
  Oracle `validate` op: `Lean.Json` → `Dim.Spec.Validate` types → result JSON
  serialized exactly like `JSON.stringify` of the JS validator's result.
  Object keys of *passthrough* values come back sorted (`Lean.Json` keeps an
  ordered map); the differential test compares canonical key order.
-/

namespace Oracle.Validate

open Lean (Json JsonNumber)
open Dim.Spec.Validate

def numToInt (n : JsonNumber) : Except String Int :=
  if n.exponent == 0 then .ok n.mantissa
  else
    let p : Int := (10 : Int) ^ n.exponent
    if n.mantissa % p == 0 then .ok (n.mantissa / p)
    else .error "non-integer number"

partial def toValue : Json → Except String Value
  | .null => .ok .null
  | .bool b => .ok (.bool b)
  | .num n => return .num (← numToInt n)
  | .str s => .ok (.str s.toList)
  | .arr xs => return .arr (← xs.toList.mapM toValue)
  | .obj kvs => do
    let out ← kvs.toList.mapM fun (k, v) => do return (k, ← toValue v)
    return .obj out

def getField (j : Json) (k : String) : Option Json :=
  match j.getObjVal? k with
  | .ok v => some v
  | .error _ => none

def getBool (j : Json) (k : String) : Bool :=
  match getField j k with
  | some (.bool b) => b
  | _ => false

def getInt (j : Json) (k : String) (d : Int) : Except String Int :=
  match getField j k with
  | some (.num n) => numToInt n
  | _ => .ok d

def getNat (j : Json) (k : String) (d : Nat) : Except String Nat := do
  let i ← getInt j k d
  return i.toNat

def getPol (j : Json) : Except String Pol := do
  let dflt ← match getField j "default" with
    | some d => some <$> toValue d
    | none => pure none
  return { coerce := getBool j "coerce", dflt }

def bigNat : Nat := 9007199254740991

partial def toSchema (j : Json) : Except String Schema := do
  let k := match getField j "k" with
    | some (.str s) => s
    | _ => ""
  let p ← getPol j
  match k with
  | "any" => return .any
  | "bool" => return .bool p
  | "int" => return .int (← getInt j "min" (-(bigNat : Int))) (← getInt j "max" bigNat) p
  | "num" => return .num (← getInt j "min" (-(bigNat : Int))) (← getInt j "max" bigNat) p
  | "str" =>
    let cls := match getField j "chars" with
      | some (.str "id") => CharClass.id
      | some (.str "digits") => .digits
      | some (.str "line") => .line
      | _ => .any
    return .str (← getNat j "min" 0) (← getNat j "max" bigNat)
      (getBool j "trim") (getBool j "nl") cls p
  | "text" => return .text (← getNat j "max" bigNat) p
  | "url" =>
    let attr := match getField j "attr" with
      | some (.str s) => s
      | _ => "href"
    return .url attr p
  | "enum" =>
    let vals ← match getField j "values" with
      | some (.arr xs) => xs.toList.mapM toValue
      | _ => pure []
    return .enum vals p
  | "rec" =>
    let fs ← match getField j "fields" with
      | some (.arr xs) => pure xs.toList
      | _ => pure []
    let rec build : List Json → Except String Fields
      | [] => .ok .nil
      | f :: rest => do
        match f with
        | .arr #[.str name, s] => return .cons name (← toSchema s) (← build rest)
        | _ => build rest
    return .record (← build fs) p
  | "arr" =>
    let of ← toSchema ((getField j "of").getD .null)
    return .arr of (← getNat j "min" 0) (← getNat j "max" bigNat) p
  | "opt" => return .opt (← toSchema ((getField j "of").getD .null))
  | "nullable" => return .nullable (← toSchema ((getField j "of").getD .null)) p
  | "union" =>
    let alts ← match getField j "of" with
      | some (.arr xs) => pure xs.toList
      | _ => pure []
    let rec buildAlts : List Json → Except String Alts
      | [] => .ok .nil
      | s :: rest => return .cons (← toSchema s) (← buildAlts rest)
    return .union (← buildAlts alts) p
  | "fn" => return .fn p
  | other => .error s!"unknown schema kind {other}"

def hexDigit (n : Nat) : Char :=
  if n < 10 then Char.ofNat (48 + n) else Char.ofNat (87 + n)

def escapeChar (c : Char) : List Char :=
  match c with
  | '"' => ['\\', '"']
  | '\\' => ['\\', '\\']
  | '\n' => ['\\', 'n']
  | '\r' => ['\\', 'r']
  | '\t' => ['\\', 't']
  | c =>
    if c.toNat == 8 then ['\\', 'b']
    else if c.toNat == 12 then ['\\', 'f']
    else if c.toNat < 0x20 then
      ['\\', 'u', '0', '0', hexDigit (c.toNat / 16), hexDigit (c.toNat % 16)]
    else [c]

def quote (s : String) : String :=
  "\"" ++ String.ofList (s.toList.flatMap escapeChar) ++ "\""

partial def render : Value → String
  | .null => "null"
  | .bool b => if b then "true" else "false"
  | .num n => toString n
  | .str cs => quote (String.ofList cs)
  | .arr xs => "[" ++ ",".intercalate (xs.map render) ++ "]"
  | .obj kvs => "{" ++ ",".intercalate (kvs.map fun (k, v) => quote k ++ ":" ++ render v) ++ "}"

def renderRes : Res → String
  | .ok v => "{\"ok\":true,\"value\":" ++ render v ++ "}"
  | .err path reason =>
    "{\"ok\":false,\"path\":" ++ quote path ++ ",\"reason\":" ++ quote reason ++ "}"

def handle (line : String) : String :=
  match Json.parse line with
  | .error e => "{\"ok\":false,\"path\":\"$\",\"reason\":" ++ quote ("bad request: " ++ e) ++ "}"
  | .ok req =>
    let r : Except String Res := do
      let s ← toSchema ((getField req "schema").getD .null)
      let v ← toValue ((getField req "value").getD .null)
      return validate s v "$"
    match r with
    | .ok res => renderRes res
    | .error e => "{\"ok\":false,\"path\":\"$\",\"reason\":" ++ quote ("oracle: " ++ e) ++ "}"

end Oracle.Validate
