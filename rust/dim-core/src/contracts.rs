//! Contract validator exposed to JS (`src/wasm/contracts.ts`).

use std::cell::RefCell;

use dim_contract_core::{json, result_to_value, validate};
use wasm_bindgen::prelude::*;

thread_local! {
    /// Last parsed schema, keyed by its JSON text: components validate the
    /// same schema on every render.
    static SCHEMA_CACHE: RefCell<Option<(String, json::Value)>> = const { RefCell::new(None) };
}

#[wasm_bindgen(js_name = validateJson)]
pub fn validate_json(schema: &str, value: &str) -> String {
    let parsed = SCHEMA_CACHE.with(|cache| {
        let mut cache = cache.borrow_mut();
        if let Some((text, s)) = cache.as_ref() {
            if text == schema {
                return Ok(s.clone());
            }
        }
        let s = json::parse(schema)?;
        *cache = Some((schema.to_string(), s.clone()));
        Ok::<_, String>(s)
    });
    let r = match (parsed, json::parse(value)) {
        (Ok(s), Ok(v)) => validate(&s, &v, "$"),
        (Err(e), _) => Err(("$".into(), format!("bad schema json: {e}"))),
        (_, Err(e)) => Err(("$".into(), format!("bad value json: {e}"))),
    };
    json::stringify(&result_to_value(r))
}
