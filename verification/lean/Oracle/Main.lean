import Dim.Spec.Policy

/-!
  JSON-lines oracle: reads requests from stdin, writes responses to stdout.
-/

open Dim.Spec.Policy

/-- Extract `"key":"<value>"` from a flat JSON object. -/
def extractStringField (json key : String) : Option String := Id.run do
  let needle := "\"" ++ key ++ "\":\""
  let parts := json.splitOn needle
  if parts.length < 2 then return none
  let after := parts[1]!
  let mut acc : Array Char := #[]
  let mut i := 0
  let cs := after.toList.toArray
  while i < cs.size do
    let c := cs[i]!
    if c == '"' then
      return some (String.ofList acc.toList)
    if c == '\\' then
      i := i + 1
      if i < cs.size then
        acc := acc.push (cs[i]!)
      i := i + 1
      continue
    acc := acc.push c
    i := i + 1
  return none

def extractNatField (json key : String) : Option Nat :=
  let needle := "\"" ++ key ++ "\":"
  let parts := json.splitOn needle
  if parts.length < 2 then none
  else
    let after := parts[1]!.trim
    let digits := after.takeWhile Char.isDigit
    if digits.isEmpty then none else digits.toNat?

def jsonEscape (s : String) : String :=
  String.ofList <| s.toList.flatMap fun c =>
    match c with
    | '"' => ['\\', '"']
    | '\\' => ['\\', '\\']
    | '\n' => ['\\', 'n']
    | '\r' => ['\\', 'r']
    | '\t' => ['\\', 't']
    | c => [c]

def okResult (s : String) : String :=
  "{\"ok\":true,\"result\":\"" ++ jsonEscape s ++ "\"}"

def okBool (b : Bool) : String :=
  "{\"ok\":true,\"result\":" ++ (if b then "true" else "false") ++ "}"

def errResult (s : String) : String :=
  "{\"ok\":false,\"error\":\"" ++ jsonEscape s ++ "\"}"

def hasSubstr (haystack needle : String) : Bool :=
  (haystack.splitOn needle).length > 1

def handleLine (line : String) : String :=
  let line := line.trim
  if line.isEmpty then okResult ""
  else if hasSubstr line "\"ping\"" then okResult "pong"
  else if hasSubstr line "\"sanitizeUrl\"" then
    match extractStringField line "name", extractStringField line "value" with
    | some name, some value => okResult (sanitizeUrl name value)
    | _, _ => errResult "sanitizeUrl requires name and value"
  else if hasSubstr line "\"escapeText\"" then
    match extractStringField line "value" with
    | some value => okResult (escapeText value)
    | none => errResult "escapeText requires value"
  else if hasSubstr line "\"checkBinding\"" then
    match extractNatField line "kind", extractStringField line "name" with
    | some k, some name =>
      match partKindOfNat k with
      | some kind =>
        match checkBindingPolicy kind name with
        | none => okBool true
        | some _ => okBool false
      | none => errResult "invalid kind"
    | _, _ => errResult "checkBinding requires kind and name"
  else
    errResult ("unknown op in: " ++ line.take 80)

partial def loop : IO Unit := do
  let stdin ← IO.getStdin
  let line ← stdin.getLine
  if line.isEmpty then
    pure ()
  else if line.trim == "QUIT" then
    pure ()
  else
    IO.println (handleLine line)
    loop

def main : IO Unit := do
  IO.eprintln "dim-oracle ready"
  loop
