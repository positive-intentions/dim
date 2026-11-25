import Dim.Spec.Policy

/-!
  Contract validator — Lean reference for `src/core/contracts/validate.js`
  and `rust/dim-contract-core/src/validate.rs`.

  Values are the *lowered* JSON form (placeholders `{"$u":1}`, `{"$fn":i}`, …).
  Numbers are modelled as `Int` (the oracle differential only feeds integers);
  strings as `List Char` with UTF-16 length `len16`.
-/

namespace Dim.Spec.Validate

open Dim.Spec.Policy

inductive Value where
  | null
  | bool (b : Bool)
  | num (n : Int)
  | str (cs : List Char)
  | arr (vs : List Value)
  | obj (kvs : List (String × Value))
  deriving Repr, Inhabited

/-- Single-key placeholder object `{key: _}`. -/
def isPh (key : String) : Value → Bool
  | .obj [(k, _)] => k == key
  | _ => false

def phKeys : List String := ["$u", "$fn", "$o", "$nf"]

def undef : Value := .obj [("$u", .num 1)]
def noopFn : Value := .obj [("$fn", .num (-1))]

def isRecordValue (v : Value) : Bool :=
  match v with
  | .obj _ => !(phKeys.any fun k => isPh k v)
  | _ => false

/-- `===` on primitives (objects / arrays never equal). -/
def primEq : Value → Value → Bool
  | .null, .null => true
  | .bool a, .bool b => a == b
  | .num a, .num b => a == b
  | .str a, .str b => a == b
  | _, _ => false

def lookup (name : String) : List (String × Value) → Option Value
  | [] => none
  | (k, v) :: rest => if k == name then some v else lookup name rest

/-! ### String helpers -/

def isAsciiWs (c : Char) : Bool :=
  c == ' ' || c == '\t' || c == '\n' || c.toNat == 11 || c.toNat == 12 || c == '\r'

def trimAscii (cs : List Char) : List Char :=
  ((cs.dropWhile isAsciiWs).reverse.dropWhile isAsciiWs).reverse

def normNl : List Char → List Char
  | '\r' :: '\n' :: rest => '\n' :: normNl rest
  | '\r' :: rest => '\n' :: normNl rest
  | c :: rest => c :: normNl rest
  | [] => []

def u16 (c : Char) : Nat := if c.toNat ≥ 0x10000 then 2 else 1

def len16 : List Char → Nat
  | [] => 0
  | c :: r => u16 c + len16 r

def truncate16 : List Char → Nat → List Char
  | [], _ => []
  | c :: r, m => if u16 c ≤ m then c :: truncate16 r (m - u16 c) else []

inductive CharClass where
  | any | id | digits | line
  deriving DecidableEq, Repr

def charAllowed : CharClass → Char → Bool
  | .any, _ => true
  | .id, ch =>
    let c := ch.toNat
    (48 ≤ c && c ≤ 57) || (65 ≤ c && c ≤ 90) || (97 ≤ c && c ≤ 122) ||
      c == 95 || c == 46 || c == 58 || c == 45
  | .digits, ch => 48 ≤ ch.toNat && ch.toNat ≤ 57
  | .line, ch => ch.toNat == 9 || (32 ≤ ch.toNat && ch.toNat != 127)

def digitVal (c : Char) : Option Nat :=
  if '0' ≤ c ∧ c ≤ '9' then some (c.toNat - 48) else none

def parseNat (cs : List Char) : Option Nat :=
  cs.foldl (fun acc c => match acc, digitVal c with
    | some n, some d => some (n * 10 + d)
    | _, _ => none) (some 0)

/-- `/^-?[0-9]{1,15}$/` then `Number(v)`. -/
def parseIntStr (cs : List Char) : Option Int :=
  let (neg, ds) := match cs with
    | '-' :: rest => (true, rest)
    | _ => (false, cs)
  if ds.isEmpty || ds.length > 15 then none
  else match parseNat ds with
    | some n => some (if neg then -(n : Int) else n)
    | none => none

/-! ### Schema -/

structure Pol where
  coerce : Bool := false
  dflt : Option Value := none
  deriving Repr, Inhabited

mutual
inductive Schema where
  | any
  | bool (p : Pol)
  | int (lo hi : Int) (p : Pol)
  | num (lo hi : Int) (p : Pol)
  | str (lo hi : Nat) (trim nl : Bool) (cls : CharClass) (p : Pol)
  | text (hi : Nat) (p : Pol)
  | url (attr : String) (p : Pol)
  | enum (vals : List Value) (p : Pol)
  | record (fields : Fields) (p : Pol)
  | arr (of : Schema) (lo hi : Nat) (p : Pol)
  | opt (of : Schema)
  | nullable (of : Schema) (p : Pol)
  | union (alts : Alts) (p : Pol)
  | fn (p : Pol)

inductive Fields where
  | nil
  | cons (name : String) (s : Schema) (rest : Fields)

inductive Alts where
  | nil
  | cons (s : Schema) (rest : Alts)
end

inductive Res where
  | ok (v : Value)
  | err (path reason : String)
  deriving Repr, Inhabited

def failP (p : Pol) (path reason : String) : Res :=
  if p.coerce then
    match p.dflt with
    | some d => .ok d
    | none => .err path reason
  else .err path reason

def propagateP (p : Pol) : Res → Res
  | .ok v => .ok v
  | .err path reason => failP p path reason

def vnum (lo hi : Int) (p : Pol) (path : String) (n : Int) : Res :=
  if lo ≤ n ∧ n ≤ hi then .ok (.num n)
  else if p.coerce then .ok (.num (if n < lo then lo else hi))
  else failP p path "out of range"

/-- Steps: newlines, trim, char filter (+ re-trim), truncate (+ re-trim), min. -/
def vstr (lo hi : Nat) (trim nl : Bool) (cls : CharClass) (p : Pol)
    (path : String) (cs : List Char) : Res :=
  let s1 := if nl then normNl cs else cs
  let s2 := if trim then trimAscii s1 else s1
  let filtered := s2.filter (charAllowed cls)
  if cls ≠ .any ∧ filtered ≠ s2 ∧ p.coerce = false then
    failP p path s!"disallowed characters ({clsName cls})"
  else
    let s3 := if cls ≠ .any ∧ filtered ≠ s2 then (if trim then trimAscii filtered else filtered) else s2
    if len16 s3 > hi ∧ p.coerce = false then failP p path s!"longer than {hi}"
    else
      let s4 := if len16 s3 > hi then
          (if trim then trimAscii (truncate16 s3 hi) else truncate16 s3 hi)
        else s3
      if len16 s4 < lo then failP p path s!"shorter than {lo}"
      else .ok (.str s4)
where
  clsName : CharClass → String
    | .any => "any" | .id => "id" | .digits => "digits" | .line => "line"

/-- Validate list items in order; first failure wins. -/
def mapItems (f : Value → String → Res) (path : String) :
    Nat → List Value → Except (String × String) (List Value)
  | _, [] => .ok []
  | i, x :: rest =>
    match f x s!"{path}[{i}]" with
    | .err a b => .error (a, b)
    | .ok y =>
      match mapItems f path (i + 1) rest with
      | .error e => .error e
      | .ok ys => .ok (y :: ys)

mutual
def validate : Schema → Value → String → Res
  | .any, v, _ => .ok v
  | .bool p, v, path =>
    match v with
    | .bool b => .ok (.bool b)
    | .str cs =>
      if p.coerce ∧ (cs = "true".toList ∨ cs = []) then .ok (.bool true)
      else if p.coerce ∧ cs = "false".toList then .ok (.bool false)
      else failP p path "expected boolean"
    | _ => failP p path "expected boolean"
  | .int lo hi p, v, path =>
    match v with
    | .num n => vnum lo hi p path n
    | .str cs =>
      match (if p.coerce then parseIntStr cs else none) with
      | some n => vnum lo hi p path n
      | none => failP p path "expected integer"
    | _ => failP p path "expected integer"
  | .num lo hi p, v, path =>
    match v with
    | .num n => vnum lo hi p path n
    | _ => failP p path "expected finite number"
  | .str lo hi trim nl cls p, v, path =>
    match v with
    | .str cs => vstr lo hi trim nl cls p path cs
    | _ => failP p path "expected string"
  | .text hi p, v, path =>
    match v with
    | .str cs =>
      if len16 cs > hi then
        if p.coerce then .ok (.str (escapeChars (truncate16 cs hi)))
        else failP p path s!"longer than {hi}"
      else .ok (.str (escapeChars cs))
    | _ => failP p path "expected string"
  | .url attr p, v, path =>
    match v with
    | .str cs => .ok (.str (sanitizeUrl attr (String.ofList cs)).toList)
    | _ => failP p path "expected url string"
  | .enum vals p, v, path =>
    if vals.any (fun x => primEq x v) then .ok v
    else failP p path "not one of the allowed values"
  | .record fields p, v, path =>
    match v with
    | .obj kvs =>
      if isRecordValue (.obj kvs) then
        match validateFields fields kvs path with
        | .ok out => .ok (.obj out)
        | .error (a, b) => propagateP p (.err a b)
      else failP p path "expected object"
    | _ => failP p path "expected object"
  | .arr of lo hi p, v, path =>
    match v with
    | .arr xs =>
      if xs.length > hi ∧ p.coerce = false then failP p path s!"more than {hi} items"
      else
        let ys := if xs.length > hi then xs.take hi else xs
        match mapItems (fun x pth => validate of x pth) path 0 ys with
        | .error (a, b) => propagateP p (.err a b)
        | .ok out =>
          if out.length < lo then failP p path s!"fewer than {lo} items"
          else .ok (.arr out)
    | _ => failP p path "expected array"
  | .opt of, v, path =>
    if isPh "$u" v then .ok v else validate of v path
  | .nullable of p, v, path =>
    match v with
    | .null => .ok .null
    | _ => propagateP p (validate of v path)
  | .union alts p, v, path =>
    match validateAlts alts v path with
    | some w => .ok w
    | none => failP p path "no union alternative matched"
  | .fn p, v, path =>
    if isPh "$fn" v then .ok v
    else if p.coerce then .ok noopFn
    else failP p path "expected function"

def validateFields : Fields → List (String × Value) → String →
    Except (String × String) (List (String × Value))
  | .nil, _, _ => .ok []
  | .cons name s rest, kvs, path =>
    let given := (lookup name kvs).getD undef
    match validate s given s!"{path}.{name}" with
    | .err a b => .error (a, b)
    | .ok x =>
      match validateFields rest kvs path with
      | .error e => .error e
      | .ok out => .ok (if isPh "$u" x then out else (name, x) :: out)

def validateAlts : Alts → Value → String → Option Value
  | .nil, _, _ => none
  | .cons s rest, v, path =>
    match validate s v path with
    | .ok w => some w
    | .err _ _ => validateAlts rest v path
end

/-! ### Conformance and well-formedness -/

mutual
def Conforms : Schema → Value → Prop
  | .any, _ => True
  | .bool _, v => ∃ b, v = .bool b
  | .int lo hi _, v => ∃ n, v = .num n ∧ lo ≤ n ∧ n ≤ hi
  | .num lo hi _, v => ∃ n, v = .num n ∧ lo ≤ n ∧ n ≤ hi
  | .str lo hi trim nl cls _, v =>
    ∃ cs, v = .str cs ∧ lo ≤ len16 cs ∧ len16 cs ≤ hi ∧
      (trim = true → trimAscii cs = cs) ∧ (nl = true → '\r' ∉ cs) ∧
      cs.all (charAllowed cls) = true
  | .text _ _, v => ∃ cs, v = .str cs ∧ '<' ∉ cs
  | .url attr _, v => ∃ raw, v = .str (sanitizeUrl attr raw).toList
  | .enum vals _, v => vals.any (fun x => primEq x v) = true
  | .record fields _, v =>
    ∃ kvs, v = .obj kvs ∧ isRecordValue v = true ∧ FieldsConform fields kvs
  | .arr of lo hi _, v =>
    ∃ xs, v = .arr xs ∧ lo ≤ xs.length ∧ xs.length ≤ hi ∧ ∀ x ∈ xs, Conforms of x
  | .opt of, v => isPh "$u" v = true ∨ Conforms of v
  | .nullable of _, v => v = .null ∨ Conforms of v
  | .union alts _, v => AltsConform alts v
  | .fn _, v => isPh "$fn" v = true ∨ v = noopFn

/-- Output field lists are canonical: schema order, absent fields omitted. -/
def FieldsConform : Fields → List (String × Value) → Prop
  | .nil, kvs => kvs = []
  | .cons name s rest, kvs =>
    ((∃ u, isPh "$u" u = true ∧ Conforms s u) ∧ FieldsConform rest kvs) ∨
    (∃ x kvs', kvs = (name, x) :: kvs' ∧ isPh "$u" x = false ∧ Conforms s x ∧
      FieldsConform rest kvs')

def AltsConform : Alts → Value → Prop
  | .nil, _ => False
  | .cons s rest, v => Conforms s v ∨ AltsConform rest v
end

/-- Defaults (used only under coerce) must themselves conform. -/
def PolOk (s : Schema) (p : Pol) : Prop :=
  p.coerce = true → ∀ d, p.dflt = some d → Conforms s d

def fieldNames : Fields → List String
  | .nil => []
  | .cons name _ rest => name :: fieldNames rest

mutual
def WF : Schema → Prop
  | .any => True
  | s@(.bool p) => PolOk s p
  | s@(.int _ _ p) => PolOk s p
  | s@(.num _ _ p) => PolOk s p
  | s@(.str _ _ _ _ _ p) => PolOk s p
  | s@(.text _ p) => PolOk s p
  | s@(.url _ p) => PolOk s p
  | s@(.enum _ p) => PolOk s p
  | s@(.record fields p) =>
    PolOk s p ∧ (∀ n ∈ fieldNames fields, n ∉ phKeys) ∧ FieldsWF fields
  | s@(.arr of _ _ p) => PolOk s p ∧ WF of
  | .opt of => WF of
  | s@(.nullable of p) => PolOk s p ∧ WF of
  | s@(.union alts p) => PolOk s p ∧ AltsWF alts
  | .fn _ => True

def FieldsWF : Fields → Prop
  | .nil => True
  | .cons _ s rest => WF s ∧ FieldsWF rest

def AltsWF : Alts → Prop
  | .nil => True
  | .cons s rest => WF s ∧ AltsWF rest
end

/-- Schemas whose validator is a projection (no escaping / URL rewriting /
    first-match unions / record re-keying). -/
def Stable : Schema → Prop
  | .any | .bool _ | .int _ _ _ | .num _ _ _ | .str _ _ _ _ _ _ | .enum _ _ | .fn _ => True
  | .arr of _ _ _ => Stable of
  | .opt of => Stable of
  | .nullable of _ => Stable of
  | _ => False

end Dim.Spec.Validate
