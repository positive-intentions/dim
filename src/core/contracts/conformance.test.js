/**
 * Differential conformance: pure-JS validator vs Rust dim-contract-core
 * (via dim-contract-cli) vs the Lean reference (dim-oracle `validate` op).
 * Outputs must be byte-identical JSON. Each side is skipped when its binary
 * has not been built (cargo build -p dim-contract-core / lake build dim-oracle).
 */
import { validate } from "./validate.js";

const fc = require("fast-check");
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "../../..");
const findBin = (candidates) => candidates.find((p) => p && fs.existsSync(p));

const rustCli = findBin([
  process.env.DIM_CONTRACT_CLI,
  path.join(root, "rust/target/debug/dim-contract-cli"),
  path.join(root, "rust/target/release/dim-contract-cli"),
]);
const leanOracle = findBin([
  path.join(root, "verification/lean/.lake/build/bin/dim-oracle"),
]);

/** Lean.Json keeps object keys sorted; compare passthrough values canonically. */
function canonical(text) {
  const sortDeep = (v) =>
    Array.isArray(v)
      ? v.map(sortDeep)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortDeep(v[k])]))
        : v;
  try {
    return JSON.stringify(sortDeep(JSON.parse(text)));
  } catch {
    return text;
  }
}

function runLines(bin, lines) {
  const r = spawnSync(bin, [], {
    input: lines.join("\n") + "\nQUIT\n",
    encoding: "utf8",
    timeout: 60000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return (r.stdout || "").trim().split("\n");
}

const str = (o = {}) => ({
  k: "str",
  min: o.min ?? 0,
  max: o.max ?? 8,
  trim: !!o.trim,
  nl: !!o.nl,
  chars: o.chars || "any",
  ...(o.coerce ? { coerce: true } : {}),
  ...(o.default !== undefined ? { default: o.default } : {}),
});

const leafSchema = fc.oneof(
  fc.constant({ k: "any" }),
  fc.record({ coerce: fc.boolean() }).map((o) => ({ k: "bool", ...(o.coerce ? { coerce: true } : {}) })),
  fc
    .record({ min: fc.integer({ min: -20, max: 0 }), max: fc.integer({ min: 0, max: 20 }), coerce: fc.boolean() })
    .map((o) => ({ k: "int", min: o.min, max: o.max, ...(o.coerce ? { coerce: true } : {}) })),
  fc
    .record({
      min: fc.integer({ min: 0, max: 2 }),
      max: fc.integer({ min: 0, max: 6 }),
      trim: fc.boolean(),
      nl: fc.boolean(),
      chars: fc.constantFrom("any", "id", "digits", "line"),
      coerce: fc.boolean(),
      dflt: fc.option(fc.constantFrom("", "d"), { nil: undefined }),
    })
    .map((o) => str({ ...o, default: o.dflt })),
  fc.record({ max: fc.integer({ min: 0, max: 6 }), coerce: fc.boolean() }).map((o) => ({
    k: "text",
    max: o.max,
    ...(o.coerce ? { coerce: true } : {}),
  })),
  fc.constantFrom("href", "src").map((attr) => ({ k: "url", attr })),
  fc.constant({ k: "enum", values: ["a", "b", 1, true, null] }),
  fc.boolean().map((c) => ({ k: "fn", args: [], ret: { k: "any" }, ...(c ? { coerce: true } : {}) })),
);

const schemaArb = fc.letrec((tie) => ({
  s: fc.oneof(
    { depthSize: "small", withCrossShrink: true },
    leafSchema,
    fc
      .array(fc.tuple(fc.constantFrom("a", "b", "c"), tie("s")), { maxLength: 3 })
      .map((fields) => ({
        k: "rec",
        fields: fields.filter((f, i) => fields.findIndex((g) => g[0] === f[0]) === i),
      })),
    fc
      .record({ of: tie("s"), max: fc.integer({ min: 0, max: 3 }), coerce: fc.boolean() })
      .map((o) => ({ k: "arr", of: o.of, min: 0, max: o.max, ...(o.coerce ? { coerce: true } : {}) })),
    tie("s").map((of) => ({ k: "opt", of })),
    tie("s").map((of) => ({ k: "nullable", of })),
    fc.array(tie("s"), { minLength: 1, maxLength: 2 }).map((of) => ({ k: "union", of })),
  ),
})).s;

const charArb = fc.constantFrom("a", "Z", "0", " ", "\t", "\r", "\n", "-", ":", "<", "&", "é", "😀", "\u0001", "j", "/");
const strArb = fc.array(charArb, { maxLength: 9 }).map((cs) => cs.join(""));
const urlish = fc.constantFrom("javascript:x", "https://a.b", "//evil", "/rel", "data:image/png,x", "data:text/html,x", "");

const valueArb = fc.letrec((tie) => ({
  v: fc.oneof(
    { depthSize: "small" },
    fc.constant(null),
    fc.boolean(),
    fc.integer({ min: -30, max: 30 }),
    fc.constantFrom(0.5, -2.25, 1e21, 1e-7),
    strArb,
    urlish,
    fc.constantFrom("true", "false", "", "12", "-3"),
    fc.constantFrom({ $u: 1 }, { $fn: 0 }, { $o: 0 }, { $nf: "NaN" }),
    fc.array(tie("v"), { maxLength: 4 }),
    fc.dictionary(fc.constantFrom("a", "b", "c", "x"), tie("v"), { maxKeys: 3 }),
  ),
})).v;

/** Mostly-conforming value for a schema, with occasional noise. */
function nearValue(s, rnd) {
  const pick = (xs) => xs[Math.floor(rnd() * xs.length)];
  if (rnd() < 0.1) return pick([null, 3, "x", { $u: 1 }, [], {}]);
  switch (s.k) {
    case "bool": return pick([true, false, "true", ""]);
    case "int": return pick([s.min, s.max, 0, s.max + 1, "5"]);
    case "str": case "text": return pick(["ab", " a b ", "a\r\nb", "<x>", "toolongvalue", "😀a", ""]);
    case "url": return pick(["https://x", "javascript:y", "/p"]);
    case "enum": return pick(s.values);
    case "rec": {
      const o = {};
      for (const [k, fs] of s.fields) if (rnd() < 0.9) o[k] = nearValue(fs, rnd);
      return o;
    }
    case "arr": return Array.from({ length: Math.floor(rnd() * (s.max + 2)) }, () => nearValue(s.of, rnd));
    case "opt": return rnd() < 0.3 ? { $u: 1 } : nearValue(s.of, rnd);
    case "nullable": return rnd() < 0.3 ? null : nearValue(s.of, rnd);
    case "union": return nearValue(pick(s.of), rnd);
    case "fn": return { $fn: 0 };
    default: return pick([1, "a", null]);
  }
}

let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const cases = [
  ...fc.sample(fc.tuple(schemaArb, valueArb), { numRuns: 1000, seed: 42 }),
  ...fc.sample(schemaArb, { numRuns: 2000, seed: 43 }).map((s) => [s, nearValue(s, rnd)]),
];

describe("validator conformance", () => {
  (rustCli ? test : test.skip)("JS validate === Rust dim-contract-core", () => {
    const lines = cases.map(([schema, value]) => JSON.stringify({ schema, value }));
    const rust = runLines(rustCli, lines);
    cases.forEach(([schema, value], i) => {
      const js = JSON.stringify(validate(schema, value));
      if (js !== rust[i]) {
        throw new Error(`mismatch\nschema=${JSON.stringify(schema)}\nvalue=${JSON.stringify(value)}\njs=${js}\nrust=${rust[i]}`);
      }
    });
  });

  (leanOracle ? test : test.skip)("JS validate === Lean Dim.Spec.Validate (oracle)", () => {
    const intOnly = cases.filter(([s, v]) => !JSON.stringify([s, v]).match(/\d\.\d|e[-+]?\d/));
    const lines = intOnly.map(([schema, value]) => JSON.stringify({ op: "validate", schema, value }));
    const lean = runLines(leanOracle, lines);
    intOnly.forEach(([schema, value], i) => {
      const js = canonical(JSON.stringify(validate(schema, value)));
      if (js !== canonical(lean[i])) {
        throw new Error(`mismatch\nschema=${JSON.stringify(schema)}\nvalue=${JSON.stringify(value)}\njs=${js}\nlean=${lean[i]}`);
      }
    });
  });
});
