/**
 * Validator engine switch. The pure-JS build uses `validate`; the WASM build
 * installs the Rust validator (`dim-contract-core`) via `setValidatorEngine`.
 * Both take (schema, loweredValue) and return the same result shape.
 */
import { validate } from "./validate.js";

let engine = validate;
let engineName = "js";

export function setValidatorEngine(fn, name) {
  engine = fn;
  engineName = name || "custom";
}

export function getValidatorEngine() {
  return { engine, name: engineName };
}

export function runValidator(schema, lowered) {
  return engine(schema, lowered);
}
