//! DOM-free contract validator for Dim.
//!
//! Mirrors `src/core/contracts/validate.js`; the Lean reference is
//! `verification/lean/Dim/Spec/Validate.lean`. Both directions are checked by
//! differential tests (`tests/oracle_conformance.rs`, `validate.test.js`).

pub mod json;
pub mod validate;

pub use json::{parse, stringify, Value};
pub use validate::{result_to_value, validate};

/// JSON in, JSON out: the WASM / CLI boundary.
pub fn validate_json(schema: &str, value: &str) -> String {
    let r = match (json::parse(schema), json::parse(value)) {
        (Ok(s), Ok(v)) => validate::validate(&s, &v, "$"),
        (Err(e), _) => Err(("$".into(), format!("bad schema json: {e}"))),
        (_, Err(e)) => Err(("$".into(), format!("bad value json: {e}"))),
    };
    json::stringify(&result_to_value(r))
}
