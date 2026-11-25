/**
 * Pure, deterministic validator over *lowered* values (see lower.js).
 * Mirrors rust/dim-contract-core/src/validate.rs and the Lean reference
 * `Dim.Spec.Validate.validate`; the three are kept identical by the oracle
 * conformance tests in validate.test.js and dim-contract-core/tests.
 *
 *   validate(schema, value) -> { ok: true, value } | { ok: false, path, reason }
 *
 * String lengths are UTF-16 code units (JS `.length`); trimming removes ASCII
 * whitespace only, so all three implementations agree byte-for-byte.
 */
import { sanitizeUrl, escapeText } from "../renderer/pure/policy.js";

export const UNDEF = Object.freeze({ $u: 1 });
export const NOOP_FN = Object.freeze({ $fn: -1 });

export function isPlaceholder(v, key) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  return keys.length === 1 && keys[0] === key;
}

const PLACEHOLDER_KEYS = ["$u", "$fn", "$o", "$nf"];

function isRecordValue(v) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  return !PLACEHOLDER_KEYS.some((k) => isPlaceholder(v, k));
}

const ASCII_WS = new Set([" ", "\t", "\n", "\u000b", "\f", "\r"]);

export function trimAscii(s) {
  let a = 0;
  let b = s.length;
  while (a < b && ASCII_WS.has(s[a])) a += 1;
  while (b > a && ASCII_WS.has(s[b - 1])) b -= 1;
  return s.slice(a, b);
}

export function normalizeNewlines(s) {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/** Longest prefix of whole code points whose UTF-16 length is <= max. */
export function truncate16(s, max) {
  let out = "";
  let len = 0;
  for (const ch of s) {
    if (len + ch.length > max) break;
    out += ch;
    len += ch.length;
  }
  return out;
}

function charAllowed(cls, ch) {
  const c = ch.codePointAt(0);
  switch (cls) {
    case "id":
      return (
        (c >= 48 && c <= 57) ||
        (c >= 65 && c <= 90) ||
        (c >= 97 && c <= 122) ||
        c === 95 ||
        c === 46 ||
        c === 58 ||
        c === 45
      );
    case "digits":
      return c >= 48 && c <= 57;
    case "line":
      return c === 9 || (c >= 32 && c !== 127);
    default:
      return true;
  }
}

function filterChars(cls, s) {
  let out = "";
  for (const ch of s) if (charAllowed(cls, ch)) out += ch;
  return out;
}

const ok = (value) => ({ ok: true, value });

function fail(s, path, reason) {
  if (s.coerce && Object.prototype.hasOwnProperty.call(s, "default")) {
    return ok(s.default);
  }
  return { ok: false, path, reason };
}

function propagate(s, r) {
  if (r.ok) return r;
  if (s.coerce && Object.prototype.hasOwnProperty.call(s, "default")) {
    return ok(s.default);
  }
  return r;
}

const INT_STRING = /^-?[0-9]{1,15}$/;

function validateNumber(s, path, n) {
  if (n >= s.min && n <= s.max) return ok(n);
  if (s.coerce) return ok(n < s.min ? s.min : s.max);
  return fail(s, path, "out of range");
}

export function validate(s, v, path = "$") {
  switch (s.k) {
    case "any":
      return ok(v);

    case "bool":
      if (typeof v === "boolean") return ok(v);
      if (s.coerce && typeof v === "string") {
        if (v === "true" || v === "") return ok(true);
        if (v === "false") return ok(false);
      }
      return fail(s, path, "expected boolean");

    case "int":
      if (typeof v === "number" && Number.isInteger(v)) {
        return validateNumber(s, path, v);
      }
      if (s.coerce && typeof v === "string" && INT_STRING.test(v)) {
        return validateNumber(s, path, Number(v));
      }
      return fail(s, path, "expected integer");

    case "num":
      if (typeof v === "number") return validateNumber(s, path, v);
      return fail(s, path, "expected finite number");

    case "str": {
      if (typeof v !== "string") return fail(s, path, "expected string");
      let out = s.nl ? normalizeNewlines(v) : v;
      if (s.trim) out = trimAscii(out);
      if (s.chars !== "any") {
        const filtered = filterChars(s.chars, out);
        if (filtered !== out) {
          if (!s.coerce) return fail(s, path, `disallowed characters (${s.chars})`);
          out = s.trim ? trimAscii(filtered) : filtered;
        }
      }
      if (out.length > s.max) {
        if (!s.coerce) return fail(s, path, `longer than ${s.max}`);
        out = truncate16(out, s.max);
        if (s.trim) out = trimAscii(out);
      }
      if (out.length < s.min) return fail(s, path, `shorter than ${s.min}`);
      return ok(out);
    }

    case "text": {
      if (typeof v !== "string") return fail(s, path, "expected string");
      let out = v;
      if (out.length > s.max) {
        if (!s.coerce) return fail(s, path, `longer than ${s.max}`);
        out = truncate16(out, s.max);
      }
      return ok(escapeText(out));
    }

    case "url":
      if (typeof v !== "string") return fail(s, path, "expected url string");
      return ok(sanitizeUrl(s.attr, v));

    case "enum":
      for (const x of s.values) if (x === v) return ok(v);
      return fail(s, path, "not one of the allowed values");

    case "rec": {
      if (!isRecordValue(v)) return fail(s, path, "expected object");
      const out = {};
      for (const [name, fs] of s.fields) {
        const has = Object.prototype.hasOwnProperty.call(v, name);
        const r = validate(fs, has ? v[name] : UNDEF, `${path}.${name}`);
        if (!r.ok) return propagate(s, r);
        if (!isPlaceholder(r.value, "$u")) out[name] = r.value;
      }
      return ok(out);
    }

    case "arr": {
      if (!Array.isArray(v)) return fail(s, path, "expected array");
      let items = v;
      if (items.length > s.max) {
        if (!s.coerce) return fail(s, path, `more than ${s.max} items`);
        items = items.slice(0, s.max);
      }
      const out = [];
      for (let i = 0; i < items.length; i++) {
        const r = validate(s.of, items[i], `${path}[${i}]`);
        if (!r.ok) return propagate(s, r);
        out.push(r.value);
      }
      if (out.length < s.min) return fail(s, path, `fewer than ${s.min} items`);
      return ok(out);
    }

    case "opt":
      if (isPlaceholder(v, "$u")) return ok(v);
      return validate(s.of, v, path);

    case "nullable":
      if (v === null) return ok(null);
      return propagate(s, validate(s.of, v, path));

    case "union":
      for (const alt of s.of) {
        const r = validate(alt, v, path);
        if (r.ok) return r;
      }
      return fail(s, path, "no union alternative matched");

    case "fn":
      if (isPlaceholder(v, "$fn")) return ok(v);
      if (s.coerce) return ok(NOOP_FN);
      return fail(s, path, "expected function");

    default:
      return { ok: false, path, reason: `unknown schema kind ${s.k}` };
  }
}
