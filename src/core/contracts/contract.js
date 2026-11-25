/**
 * Runtime side of contracts: `contract(spec, fn)` validates (and sanitizes)
 * arguments before every call; `validateValue` is the shared entry used by
 * `define({ inputs })` and callback wrappers. Return types and `ensures` are
 * not re-checked at runtime: they are discharged statically by src/verify.
 */
import { lower, raise } from "./lower.js";
import { runValidator } from "./engine.js";

const wrapped = new WeakMap();

export function wrapCallback(fn, schema) {
  if (!schema.args || schema.args.length === 0) return fn;
  let bySchema = wrapped.get(fn);
  if (!bySchema) {
    bySchema = new WeakMap();
    wrapped.set(fn, bySchema);
  }
  const cached = bySchema.get(schema);
  if (cached) return cached;
  const wrapper = function (...args) {
    const clean = validateArgs(schema.args, args, "callback");
    if (!clean.ok) {
      console.error(`[dim] callback payload rejected: ${clean.message}`);
      return undefined;
    }
    return fn.apply(this, clean.values);
  };
  bySchema.set(schema, wrapper);
  return wrapper;
}

export function validateValue(schema, value) {
  const lowered = lower(value);
  const r = runValidator(schema, lowered.value);
  if (!r.ok) return r;
  return { ok: true, value: raise(schema, r.value, lowered, wrapCallback) };
}

function validateArgs(schemas, args, label) {
  const values = [];
  for (let i = 0; i < schemas.length; i++) {
    const r = validateValue(schemas[i], args[i]);
    if (!r.ok) {
      return {
        ok: false,
        message: `${label} argument ${i} at ${r.path}: ${r.reason}`,
      };
    }
    values.push(r.value);
  }
  for (let i = schemas.length; i < args.length; i++) values.push(args[i]);
  return { ok: true, values };
}

/**
 * Declare a contracted pure function.
 *   spec: { args: [schema], returns: schema, requires?, ensures?, kind? }
 * `requires` / `ensures` are predicates in the verifiable subset; they are
 * read by the prover from source and never executed here.
 */
export function contract(spec, fn) {
  if (!spec || !Array.isArray(spec.args) || typeof fn !== "function") {
    throw new TypeError("contract(spec, fn): spec.args array and fn required");
  }
  const name = spec.name || fn.name || "contract";
  const contracted = function (...args) {
    const clean = validateArgs(spec.args, args, name);
    if (!clean.ok) throw new TypeError(`[dim] contract violation: ${clean.message}`);
    return fn.apply(this, clean.values);
  };
  contracted.contract = spec;
  contracted.impl = fn;
  return contracted;
}

/** Verifiable reduce: the prover checks `inv` inductively over `step`. */
export function fold(items, init, step, inv) {
  void inv;
  return items.reduce(step, init);
}

const PASSTHROUGH = ["children", "childElements"];

/**
 * Validate component props against `inputs` (a t.record schema). Reads each
 * declared field through `props` (so the case-insensitive proxy still works)
 * and keeps children / childElements untouched.
 */
export function validateProps(inputs, props) {
  const raw = {};
  for (const [name] of inputs.fields) {
    const v = props[name];
    if (v !== undefined) raw[name] = v;
  }
  const r = validateValue(inputs, raw);
  if (!r.ok) return r;
  const out = r.value;
  for (const key of PASSTHROUGH) {
    if (!Object.prototype.hasOwnProperty.call(out, key)) out[key] = props[key];
  }
  return { ok: true, value: out };
}
