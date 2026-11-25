/**
 * Differential: JS checkCert vs Lean oracle `checkCert` (when built).
 * @jest-environment node
 */
import { checkCert, makeCert } from "./cert.js";

const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "../..");
const leanOracle = [
  path.join(root, "verification/lean/.lake/build/bin/dim-oracle"),
].find((p) => fs.existsSync(p));

function oracleCheck(cert) {
  const r = spawnSync(
    leanOracle,
    [],
    {
      input: JSON.stringify({ op: "checkCert", cert }) + "\nQUIT\n",
      encoding: "utf8",
      timeout: 30000,
    },
  );
  const line = (r.stdout || "").trim().split("\n").pop();
  return JSON.parse(line);
}

const cases = [
  makeCert("g", [{ rule: "trueIntro" }]),
  makeCert("g", []),
  makeCert("g", [{ rule: "assume", name: "x" }]),
  makeCert("g", [{ rule: "schemaOk" }, { rule: "trueIntro" }]),
  makeCert("g", [{ rule: "refutes", cex: "1" }]),
  makeCert("g", [{ rule: "nope" }]),
];

describe("checkCert conformance", () => {
  test("JS well-formedness", () => {
    expect(checkCert(cases[0])).toBe(true);
    expect(checkCert(cases[1])).toBe(false);
    expect(checkCert(cases[2])).toBe(false);
    expect(checkCert(cases[3])).toBe(true);
    expect(checkCert(cases[4])).toBe(true);
    expect(checkCert(cases[5])).toBe(false);
  });

  (leanOracle ? test : test.skip)("JS === Lean oracle", () => {
    for (const cert of cases) {
      const js = checkCert(cert);
      const lean = oracleCheck(cert);
      expect(lean.ok).toBe(true);
      expect(lean.result).toBe(js);
    }
  });
});
