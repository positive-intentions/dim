/**
 * @jest-environment node
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadDimParse() {
  const src = fs.readFileSync(
    path.join(__dirname, "../../examples/app-test/parse.js"),
    "utf8",
  );
  const sandbox = { globalThis: {} };
  sandbox.window = sandbox.globalThis;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.globalThis.DimParse;
}

const DimParse = loadDimParse();

import { checkCert, makeCert } from "./cert.js";
import { checkSubset } from "./subset.js";
import { lowerSource } from "./ir.js";
import { proveAll } from "./prover.js";

describe("cert checker", () => {
  test("accepts trueIntro-only and rejects empty", () => {
    expect(checkCert(makeCert("g", [{ rule: "trueIntro" }]))).toBe(true);
    expect(checkCert(makeCert("g", []))).toBe(false);
    expect(checkCert(makeCert("g", [{ rule: "assume" }]))).toBe(false);
    expect(
      checkCert(
        makeCert("g", [{ rule: "schemaOk" }, { rule: "trueIntro" }]),
      ),
    ).toBe(true);
  });
});

describe("subset + prove note-filters style", () => {
  const source = `
const { contract, t } = Dim;
const Note = t.record({
  id: t.id(),
  trashed: t.bool(),
  pinned: t.bool(),
  folderId: t.id(),
});
const filterNotes = contract(
  {
    name: "filterNotes",
    args: [t.array(Note), t.string()],
    returns: t.array(Note),
    ensures: (r, notes, f) => f === "trash" || r.every((n) => !n.trashed),
  },
  (notes, folderFilter) => {
    if (folderFilter === "trash") {
      return notes.filter((n) => n.trashed);
    }
    if (folderFilter === "pinned") {
      return notes.filter((n) => n.pinned && !n.trashed);
    }
    if (folderFilter === "all") {
      return notes.filter((n) => !n.trashed);
    }
    return notes.filter((n) => !n.trashed && n.folderId === folderFilter);
  },
);
`;

  test("extracts and proves filterNotes", () => {
    const lowered = lowerSource(source, "note-filters.js", DimParse.parse.bind(DimParse));
    expect(lowered.error).toBeUndefined();
    const filter = lowered.obligations.find((o) => o.name === "filterNotes");
    expect(filter).toBeTruthy();
    expect(filter.subset.ok).toBe(true);
    const { obligations, summary } = proveAll(lowered.obligations);
    const proved = obligations.find((o) => o.name === "filterNotes");
    expect(proved.status).toBe("proved");
    expect(checkCert(proved.cert)).toBe(true);
    expect(summary.refuted).toBe(0);
  });

  test("rejects while loops", () => {
    const bad = checkSubset(
      DimParse.parse("while (true) { x = 1; }", {
        allowReturnOutsideFunction: true,
      }).body[0],
      { file: "x.js" },
    );
    expect(bad.ok).toBe(false);
  });
});
