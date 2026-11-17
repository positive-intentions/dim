import {
  sanitizeUrl,
  escapeText,
  checkBindingPolicy,
  prepare,
  ATTR_PART,
  PROP_PART,
} from "./index.js";

const fc = require("fast-check");
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const oraclePath = path.resolve(
  __dirname,
  "../../../../verification/lean/.lake/build/bin/dim-oracle",
);

function askOracle(req) {
  if (!fs.existsSync(oraclePath)) return null;
  const result = spawnSync(oraclePath, [], {
    input: `${req}\nQUIT\n`,
    encoding: "utf8",
    timeout: 10000,
  });
  if (result.status !== 0 && result.status !== null) return null;
  const line = (result.stdout || "").trim().split("\n")[0];
  if (!line) return null;
  try {
    const parsed = JSON.parse(line);
    return parsed.ok ? String(parsed.result) : null;
  } catch {
    // Fallback parser for non-strict JSON from older oracle builds
    const m = line.match(/"result":"(.*)"\s*}\s*$/);
    return m ? m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\") : null;
  }
}

describe("pure core policy", () => {
  test("sanitizeUrl blocks javascript and protocol-relative", () => {
    expect(sanitizeUrl("href", "javascript:alert(1)")).toBe(
      "about:invalid#dim",
    );
    expect(sanitizeUrl("href", "//evil")).toBe("about:invalid#dim");
    expect(sanitizeUrl("href", "https://ok")).toBe("https://ok");
    expect(sanitizeUrl("href", "/rel")).toBe("/rel");
  });

  test("escapeText never contains <", () => {
    expect(escapeText("<script>").includes("<")).toBe(false);
  });

  test("checkBindingPolicy rejects on* / srcdoc / innerHTML", () => {
    expect(checkBindingPolicy(ATTR_PART, "onclick").ok).toBe(false);
    expect(checkBindingPolicy(ATTR_PART, "srcdoc").ok).toBe(false);
    expect(checkBindingPolicy(PROP_PART, "innerHTML").ok).toBe(false);
    expect(checkBindingPolicy(ATTR_PART, "class").ok).toBe(true);
  });

  test("prepare rejects dangerous bindings", () => {
    expect(() => prepare(['<a onclick="', '">x</a>'])).toThrow(/forbidden/);
  });
});

describe("pure core proptest-style (fast-check)", () => {
  test("sanitizeUrl never returns protocol-relative", () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (name, value) => {
        expect(sanitizeUrl(name, value).startsWith("//")).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  test("escapeText never contains <", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(escapeText(s).includes("<")).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});

describe("Lean oracle differential (when built)", () => {
  const available = fs.existsSync(oraclePath);

  (available ? test : test.skip)("sanitizeUrl matches oracle", () => {
    const cases = [
      ["href", "javascript:x"],
      ["href", "https://example.com"],
      ["href", "/rel"],
      ["src", "data:image/png;base64,xx"],
      ["src", "data:text/html,x"],
      ["href", "//evil"],
    ];
    for (const [name, value] of cases) {
      const js = sanitizeUrl(name, value);
      const lean = askOracle(
        JSON.stringify({ op: "sanitizeUrl", name, value }),
      );
      expect(lean).toBe(js);
    }
  });

  (available ? test : test.skip)("escapeText matches oracle", () => {
    for (const value of ["", "a", "<a>", "a&b"]) {
      const js = escapeText(value);
      const lean = askOracle(JSON.stringify({ op: "escapeText", value }));
      expect(lean).toBe(js);
    }
  });
});
