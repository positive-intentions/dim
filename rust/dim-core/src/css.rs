//! `css` tagged-template text assembly (the `CSSResult` wrapper itself is a
//! tiny JS class in the facade because it needs a lazy `styleSheet` getter).

use js_sys::Array;
use wasm_bindgen::prelude::*;

use crate::js::{self, js_string};

fn text_from_css_value(value: &JsValue) -> Result<String, JsValue> {
    if value.is_object() && js::get(value, "_$cssResult$") == JsValue::TRUE {
        return Ok(js::get(value, "cssText").as_string().unwrap_or_default());
    }
    if value.as_f64().is_some() {
        return Ok(js_string(value));
    }
    Err(js_sys::Error::new(&format!(
        "Value passed to 'css' function must be a 'css' function result: {}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.",
        js_string(value)
    ))
    .into())
}

#[wasm_bindgen(js_name = cssText)]
pub fn css_text(strings: Array, values: Array) -> Result<String, JsValue> {
    let mut out = strings.get(0).as_string().unwrap_or_default();
    if strings.length() == 1 {
        return Ok(out);
    }
    for (idx, v) in values.iter().enumerate() {
        out.push_str(&text_from_css_value(&v)?);
        out.push_str(&strings.get(idx as u32 + 1).as_string().unwrap_or_default());
    }
    Ok(out)
}
