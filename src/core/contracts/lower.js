/**
 * Lower live JS values to the JSON-safe form every validator consumes, and
 * raise validated results back. Placeholders (single-key objects):
 *   { $u: 1 }     undefined
 *   { $fn: i }    function i in `fns` (-1 = no-op)
 *   { $o: i }     non-plain object i in `opaques` (DOM nodes, Dates, cycles)
 *   { $nf: "NaN" } non-finite number
 */
import { UNDEF, isPlaceholder } from "./validate.js";

function isPlainObject(v) {
  if (v === null || typeof v !== "object") return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

export function lower(value) {
  const fns = [];
  const opaques = [];
  const seen = new Set();

  const opaque = (v) => {
    opaques.push(v);
    return { $o: opaques.length - 1 };
  };

  const go = (v) => {
    if (v === undefined) return UNDEF;
    if (v === null || typeof v === "boolean" || typeof v === "string") return v;
    if (typeof v === "number") return Number.isFinite(v) ? v : { $nf: String(v) };
    if (typeof v === "function") {
      fns.push(v);
      return { $fn: fns.length - 1 };
    }
    if (typeof v !== "object") return opaque(v);
    if (seen.has(v)) return opaque(v);
    if (Array.isArray(v)) {
      seen.add(v);
      const out = v.map((x) => go(x));
      seen.delete(v);
      return out;
    }
    if (!isPlainObject(v)) return opaque(v);
    seen.add(v);
    const out = {};
    for (const key of Object.keys(v)) {
      if (v[key] === undefined) continue;
      out[key] = go(v[key]);
    }
    seen.delete(v);
    return out;
  };

  return { value: go(value), fns, opaques };
}

const noop = () => {};

/**
 * Raise a validated lowered value. `wrap(fn, schema)` is applied to callbacks
 * whose schema is known so their payloads are validated when invoked.
 */
export function raise(schema, value, ctx, wrap) {
  const go = (s, v) => {
    if (v === null || typeof v !== "object") return v;
    if (isPlaceholder(v, "$u")) return undefined;
    if (isPlaceholder(v, "$fn")) {
      const fn = v.$fn >= 0 ? ctx.fns[v.$fn] : noop;
      return s && s.k === "fn" && wrap ? wrap(fn, s) : fn;
    }
    if (isPlaceholder(v, "$o")) return ctx.opaques[v.$o];
    if (isPlaceholder(v, "$nf")) return Number(v.$nf);
    const inner = s && (s.k === "opt" || s.k === "nullable") ? s.of : s;
    if (Array.isArray(v)) {
      const of = inner && inner.k === "arr" ? inner.of : null;
      return v.map((x) => go(of, x));
    }
    const fieldSchema = (name) => {
      if (!inner || inner.k !== "rec") return null;
      const f = inner.fields.find((p) => p[0] === name);
      return f ? f[1] : null;
    };
    const out = {};
    for (const key of Object.keys(v)) out[key] = go(fieldSchema(key), v[key]);
    return out;
  };
  return go(schema, value);
}
