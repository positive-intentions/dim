/**
 * Install the Rust validator (dim-contract-core via dim-core) as the contract
 * engine for the WASM build, then re-export the shared contracts API.
 */
import "./load";
import * as wasm from "./generated/pkg/dim_core.js";
import { setValidatorEngine } from "../core/contracts/engine.js";

const schemaText = new WeakMap<object, string>();

function wasmValidate(schema: object, lowered: unknown) {
  let text = schemaText.get(schema);
  if (text === undefined) {
    text = JSON.stringify(schema);
    schemaText.set(schema, text);
  }
  return JSON.parse(wasm.validateJson(text, JSON.stringify(lowered)));
}

setValidatorEngine(wasmValidate, "wasm");

export {
  t,
  contract,
  fold,
  validateValue,
  getValidatorEngine,
} from "../core/contracts/index.js";
