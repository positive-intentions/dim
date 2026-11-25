//! Certificate checker — mirror of `src/verify/cert.js` / `Dim.Spec.Cert`.

use dim_contract_core::json::Value;

const CLOSING: &[&str] = &["trueIntro", "refutes"];
const ALLOWED: &[&str] = &[
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
];

pub fn well_formed(cert: &Value) -> bool {
    let Some(steps) = cert.get("steps").and_then(Value::as_arr) else {
        return false;
    };
    if steps.is_empty() {
        return false;
    }
    for step in steps {
        let Some(rule) = step.get("rule").and_then(Value::as_str) else {
            return false;
        };
        if !ALLOWED.contains(&rule) {
            return false;
        }
    }
    let last = &steps[steps.len() - 1];
    let Some(rule) = last.get("rule").and_then(Value::as_str) else {
        return false;
    };
    CLOSING.contains(&rule)
}

pub fn check_cert(cert: &Value) -> bool {
    well_formed(cert)
}

pub fn check_cert_json(cert: &str) -> String {
    match dim_contract_core::json::parse(cert) {
        Ok(c) => {
            let b = check_cert(&c);
            if b {
                "{\"ok\":true,\"result\":true}".into()
            } else {
                "{\"ok\":true,\"result\":false}".into()
            }
        }
        Err(e) => format!("{{\"ok\":false,\"error\":\"{e}\"}}"),
    }
}
