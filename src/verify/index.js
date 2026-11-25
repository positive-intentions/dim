/**
 * Dim formal-verification engine (pure JS).
 *
 *   DimTest.verify.add(source, file)   — register source for verification
 *   DimTest.verify.run()               — prove all obligations (JS engine)
 *   DimTest.verify.runDual(rustProve)  — JS + optional Rust, agreement column
 *   DimTest.verify.summary()           — counts for __DIM_TEST__.verification
 */

import { lowerSource } from "./ir.js";
import { proveAll, proveObligation } from "./prover.js";
import { checkCert } from "./cert.js";
import { checkSubset } from "./subset.js";

const sources = []; // { file, source }

export function add(source, file) {
  const f = String(file || "(inline)");
  const idx = sources.findIndex((s) => s.file === f);
  if (idx >= 0) sources[idx] = { file: f, source: String(source) };
  else sources.push({ file: f, source: String(source) });
}

export function clear() {
  sources.length = 0;
}

export function listSources() {
  return sources.slice();
}

function lowerAll(parseFn) {
  const obligations = [];
  const missing = [];
  const errors = [];
  for (const s of sources) {
    const r = lowerSource(s.source, s.file, parseFn);
    if (r.error) errors.push({ file: s.file, error: r.error });
    obligations.push(...(r.obligations || []));
    missing.push(...(r.missing || []));
  }
  return { obligations, missing, errors };
}

/**
 * Run the JS prover over all registered sources.
 * @returns {{ obligations, missing, errors, summary, engine: "js" }}
 */
export function run(parseFn) {
  const lowered = lowerAll(parseFn);
  const proved = proveAll(lowered.obligations);
  const missingCount = lowered.missing.length;
  const summary = {
    proved: proved.summary.proved,
    refuted: proved.summary.refuted,
    unsupported: proved.summary.unsupported,
    missing: missingCount,
    disagreements: 0,
    pending: proved.summary.pending,
  };
  return {
    obligations: proved.obligations,
    missing: lowered.missing,
    errors: lowered.errors,
    summary,
    engine: "js",
  };
}

/**
 * Run JS + optional Rust prover; attach agreement per obligation.
 * `rustProve(obligation) -> { status, cert? }` or null if unavailable.
 */
export function runDual(parseFn, rustProve) {
  const js = run(parseFn);
  if (typeof rustProve !== "function") {
    return {
      ...js,
      obligations: js.obligations.map((o) => ({
        ...o,
        jsStatus: o.status,
        rustStatus: "skipped",
        agree: true,
      })),
    };
  }
  let disagreements = 0;
  const obligations = js.obligations.map((o) => {
    let rustStatus = "skipped";
    let rustCert = null;
    try {
      const r = rustProve(o);
      if (r && r.status) {
        rustStatus = r.status;
        rustCert = r.cert || null;
        if (rustCert && !checkCert(rustCert)) rustStatus = "refuted";
      }
    } catch (err) {
      rustStatus = "unsupported";
    }
    const agree = rustStatus === "skipped" || rustStatus === o.status;
    if (!agree) disagreements += 1;
    return {
      ...o,
      jsStatus: o.status,
      rustStatus,
      rustCert,
      agree,
    };
  });
  return {
    ...js,
    obligations,
    summary: { ...js.summary, disagreements },
  };
}

export {
  lowerSource,
  proveAll,
  proveObligation,
  checkCert,
  checkSubset,
};

export const verify = {
  add,
  clear,
  listSources,
  run,
  runDual,
  checkCert,
  lowerSource,
  proveObligation,
};

export default verify;
