import { t, validate, contract, fold, validateValue } from "./index.js";
import { lower } from "./lower.js";
import { define } from "../element/define";

const fc = require("fast-check");

describe("t DSL", () => {
  test("produces plain JSON schema IR", () => {
    const s = t.record({ id: t.id(), n: t.int({ min: 0, max: 9 }) });
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    expect(s.fields[0][1]).toMatchObject({ k: "str", min: 1, trim: true, chars: "id" });
  });
});

describe("validate", () => {
  test("strings: trim, chars, max/min with coerce and reject", () => {
    const s = t.string({ trim: true, max: 3, onInvalid: "coerce" });
    expect(validate(s, "  abcd ")).toEqual({ ok: true, value: "abc" });
    const strict = t.string({ max: 3 });
    expect(validate(strict, "abcd").ok).toBe(false);
    expect(validate(t.id(), "a b").ok).toBe(false);
    expect(validate(t.id({ onInvalid: "coerce" }), "a b")).toEqual({ ok: true, value: "ab" });
    expect(validate(t.string({ min: 1 }), "").ok).toBe(false);
  });

  test("truncation never splits a surrogate pair", () => {
    const s = t.string({ max: 3, onInvalid: "coerce" });
    expect(validate(s, "ab😀").value).toBe("ab");
  });

  test("ints clamp under coerce and parse digit strings", () => {
    const s = t.int({ min: 0, max: 10, onInvalid: "coerce" });
    expect(validate(s, 42).value).toBe(10);
    expect(validate(s, "7").value).toBe(7);
    expect(validate(t.int({ min: 0, max: 10 }), 42).ok).toBe(false);
    expect(validate(t.int(), 1.5).ok).toBe(false);
  });

  test("url and text reuse the proven sanitizers", () => {
    expect(validate(t.url(), "javascript:x").value).toBe("about:invalid#dim");
    expect(validate(t.text(), "<b>").value).toBe("&lt;b&gt;");
  });

  test("records drop unknown keys, fill defaults, omit optional", () => {
    const s = t.record({
      a: t.string({ onInvalid: "coerce", default: "" }),
      b: t.optional(t.int()),
      on: t.fn([t.int()]),
    });
    expect(validate(s, { x: 1 })).toEqual({ ok: true, value: { a: "", on: { $fn: -1 } } });
    expect(validate(s, { a: 1, b: 2 }).value.b).toBe(2);
  });

  test("arrays: max coerce truncates, element errors propagate with path", () => {
    const s = t.array(t.int(), { max: 2, onInvalid: "coerce" });
    expect(validate(s, [1, 2, 3]).value).toEqual([1, 2]);
    expect(validate(t.array(t.int()), [1, "x"])).toMatchObject({ ok: false, path: "$[1]" });
    expect(validate(t.array(t.int(), { onInvalid: "coerce", default: [] }), null).value).toEqual([]);
  });

  test("enum, union, nullable", () => {
    expect(validate(t.enum(["a", "b"]), "b").ok).toBe(true);
    expect(validate(t.enum(["a", "b"]), "c").ok).toBe(false);
    const u = t.union([t.record({ type: t.lit("x") }), t.record({ type: t.lit("y"), v: t.int() })]);
    expect(validate(u, { type: "y", v: 1 }).value).toEqual({ type: "y", v: 1 });
    expect(validate(t.nullable(t.int()), null).value).toBe(null);
  });

  test("idempotent on conforming outputs (no escape/url)", () => {
    const s = t.record({
      title: t.string({ trim: true, max: 5, onInvalid: "coerce", chars: "line" }),
      n: t.int({ min: -3, max: 3, onInvalid: "coerce" }),
      tags: t.array(t.id({ onInvalid: "coerce", default: "x" }), { max: 3, onInvalid: "coerce" }),
    });
    fc.assert(
      fc.property(
        fc.record({ title: fc.string(), n: fc.integer(), tags: fc.array(fc.string()) }),
        (v) => {
          const r = validate(s, v);
          if (r.ok) expect(validate(s, r.value)).toEqual(r);
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe("lower / validateValue", () => {
  test("functions, undefined, opaque and non-finite placeholders", () => {
    const fn = () => 1;
    const l = lower({ f: fn, u: undefined, d: new Date(0), n: NaN, a: [undefined] });
    expect(l.value).toEqual({ f: { $fn: 0 }, d: { $o: 0 }, n: { $nf: "NaN" }, a: [{ $u: 1 }] });
  });

  test("callbacks are wrapped and payloads validated", () => {
    const seen = [];
    const s = t.record({ on: t.fn([t.id()]) });
    const r = validateValue(s, { on: (id) => seen.push(id) });
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    r.value.on("abc");
    r.value.on("bad id!");
    spy.mockRestore();
    expect(seen).toEqual(["abc"]);
  });
});

describe("contract / fold", () => {
  test("contract sanitizes arguments and throws on rejection", () => {
    const clamp = contract(
      { args: [t.int({ min: 0, max: 5, onInvalid: "coerce" }), t.int()], returns: t.int() },
      (a, b) => a + b,
    );
    expect(clamp(9, 1)).toBe(6);
    expect(() => clamp(1, "x")).toThrow(/contract violation/);
    expect(clamp.contract.args.length).toBe(2);
  });

  test("fold is reduce", () => {
    expect(fold([1, 2, 3], 0, (a, x) => a + x, (a) => a >= 0)).toBe(6);
  });
});

describe("define({ inputs })", () => {
  test("validated props reach the component; rejects render nothing", async () => {
    const seen = [];
    define({
      tag: "contract-probe-el",
      inputs: t.record({ label: t.string({ max: 3, onInvalid: "coerce", default: "" }), n: t.int() }),
      component: (props, { html }) => {
        seen.push({ label: props.label, n: props.n });
        return html`<span>${props.label}</span>`;
      },
    });
    const el = document.createElement("contract-probe-el");
    el.props = { label: "abcdef", n: 2 };
    document.body.appendChild(el);
    await el.updateComplete;
    expect(seen[seen.length - 1]).toEqual({ label: "abc", n: 2 });

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    el.props = { label: "x", n: "nope" };
    await el.updateComplete;
    spy.mockRestore();
    expect(el.shadowRoot.textContent.trim()).toBe("");
    el.remove();
  });
});
