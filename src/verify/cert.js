/**
 * Tiny certificate checker — the only trusted component of the prover.
 * Mirrors Dim.Spec.Cert.checkCert (Lean) and rust/dim-verify-core.
 *
 * A certificate is well-formed iff it is non-empty and ends with a closing
 * rule (`trueIntro` or `refutes`).
 */

export const CLOSING_RULES = new Set(["trueIntro", "refutes"]);

export const ALLOWED_RULES = new Set([
  "assume",
  "trueIntro",
  "andIntro",
  "orIntroLeft",
  "orIntroRight",
  "casesBool",
  "filterEvery",
  "everyOfAnd",
  "rewriteEq",
  "modusPonens",
  "schemaOk",
  "refutes",
]);

/**
 * @param {{ goal: string, steps: Array<{rule:string}> }} cert
 * @returns {boolean}
 */
export function wellFormed(cert) {
  if (!cert || !Array.isArray(cert.steps) || cert.steps.length === 0) {
    return false;
  }
  for (const step of cert.steps) {
    if (!step || !ALLOWED_RULES.has(step.rule)) return false;
  }
  const last = cert.steps[cert.steps.length - 1];
  return CLOSING_RULES.has(last.rule);
}

/** Trusted checker (Lean: Dim.Spec.Cert.checkCert). */
export function checkCert(cert) {
  return wellFormed(cert);
}

export function makeCert(goal, steps) {
  return { goal: String(goal || ""), steps: steps.slice() };
}
