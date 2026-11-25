/**
 * Contract type DSL. Every constructor returns a plain-data Schema IR node
 * (JSON-serialisable) so the same schema drives the pure-JS validator, the
 * Rust/WASM validator, the Lean reference (`Dim.Spec.Validate`) and the
 * prover in `src/verify`.
 *
 * Node shapes (key `k` is the kind):
 *   any | bool | int{min,max} | num{min,max}
 *   str{min,max,trim,nl,chars} | text{max} | url{attr}
 *   enum{values} | rec{fields:[[name, schema]]} | arr{of,min,max}
 *   opt{of} | nullable{of} | union{of:[...]} | fn{args,ret}
 * Optional on every node: coerce (bool), default (lowered value).
 */

export const MAX_SAFE = 9007199254740991;
export const DEFAULT_STR_MAX = 100000;
export const DEFAULT_ARR_MAX = 100000;

function policy(node, opts) {
  if (opts && opts.onInvalid === "coerce") node.coerce = true;
  if (opts && Object.prototype.hasOwnProperty.call(opts, "default")) {
    node.default = opts.default;
  }
  return node;
}

function num(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

const CHAR_CLASSES = ["any", "id", "digits", "line"];

export const t = {
  any: () => ({ k: "any" }),

  bool: (opts) => policy({ k: "bool" }, opts),

  int: (opts = {}) =>
    policy(
      {
        k: "int",
        min: Math.trunc(num(opts.min, -MAX_SAFE)),
        max: Math.trunc(num(opts.max, MAX_SAFE)),
      },
      opts,
    ),

  num: (opts = {}) =>
    policy(
      { k: "num", min: num(opts.min, -MAX_SAFE), max: num(opts.max, MAX_SAFE) },
      opts,
    ),

  string: (opts = {}) => {
    const chars = CHAR_CLASSES.includes(opts.chars) ? opts.chars : "any";
    return policy(
      {
        k: "str",
        min: Math.max(0, Math.trunc(num(opts.min, 0))),
        max: Math.max(0, Math.trunc(num(opts.max, DEFAULT_STR_MAX))),
        trim: Boolean(opts.trim),
        nl: Boolean(opts.normalizeNewlines),
        chars,
      },
      opts,
    );
  },

  /** Identifier: trimmed, non-empty, [A-Za-z0-9_.:-], at most `max` units. */
  id: (opts = {}) =>
    t.string({
      min: 1,
      max: num(opts.max, 128),
      trim: true,
      chars: "id",
      ...opts,
    }),

  /** Escaped text (proven: never contains '<'). */
  text: (opts = {}) =>
    policy(
      { k: "text", max: Math.max(0, Math.trunc(num(opts.max, DEFAULT_STR_MAX))) },
      opts,
    ),

  /** URL for attribute `attr`, run through the proven sanitizeUrl. */
  url: (opts = {}) => policy({ k: "url", attr: String(opts.attr || "href") }, opts),

  enum: (values, opts) => policy({ k: "enum", values: values.slice() }, opts),

  lit: (value, opts) => policy({ k: "enum", values: [value] }, opts),

  record: (fields, opts) =>
    policy(
      { k: "rec", fields: Object.keys(fields).map((name) => [name, fields[name]]) },
      opts,
    ),

  array: (of, opts = {}) =>
    policy(
      {
        k: "arr",
        of,
        min: Math.max(0, Math.trunc(num(opts.min, 0))),
        max: Math.max(0, Math.trunc(num(opts.max, DEFAULT_ARR_MAX))),
      },
      opts,
    ),

  optional: (of) => ({ k: "opt", of }),

  nullable: (of, opts) => policy({ k: "nullable", of }, opts),

  union: (alternatives, opts) =>
    policy({ k: "union", of: alternatives.slice() }, opts),

  /**
   * Callback. Payloads are validated against `args` when called. A missing or
   * non-function value becomes a no-op unless onInvalid: "reject".
   */
  fn: (args = [], ret, opts = {}) => {
    const node = policy(
      { k: "fn", args: args.slice(), ret: ret || { k: "any" } },
      opts,
    );
    if (opts.onInvalid !== "reject") node.coerce = true;
    return node;
  },

  void: () => ({ k: "any" }),
};
