//! Structural bindings onto plain JS objects.
//!
//! Per-element and per-part state lives in JS objects rather than in Rust
//! memory: wasm-bindgen keeps every Rust-held `JsValue` as a strong root, so
//! holding DOM nodes on the Rust side would leak every removed element.

use js_sys::{Array, Object};
use wasm_bindgen::prelude::*;
use web_sys::Node;

#[wasm_bindgen]
extern "C" {
    /// Global `String(value)` conversion.
    #[wasm_bindgen(js_name = String)]
    pub fn js_string(value: &JsValue) -> String;

    /// `String(value)` kept on the JS side (no UTF-8 round trip).
    #[wasm_bindgen(js_name = String)]
    pub fn js_string_val(value: &JsValue) -> JsValue;

    /// Tagged result objects produced by `html`, `keyed` and `unsafeHTML`.
    #[wasm_bindgen(extends = Object)]
    #[derive(Clone)]
    pub type Tagged;

    #[wasm_bindgen(method, getter = "_$dimType$")]
    pub fn dim_type_raw(this: &Tagged) -> JsValue;
    #[wasm_bindgen(method, setter = "_$dimType$")]
    pub fn set_dim_type_raw(this: &Tagged, v: u32);
    #[wasm_bindgen(method, getter = strings)]
    pub fn t_strings(this: &Tagged) -> JsValue;
    #[wasm_bindgen(method, setter = strings)]
    pub fn set_t_strings(this: &Tagged, v: &JsValue);
    #[wasm_bindgen(method, getter = values)]
    pub fn t_values(this: &Tagged) -> JsValue;
    #[wasm_bindgen(method, setter = values)]
    pub fn set_t_values(this: &Tagged, v: &JsValue);
    #[wasm_bindgen(method, getter = key)]
    pub fn t_key(this: &Tagged) -> JsValue;
    #[wasm_bindgen(method, setter = key)]
    pub fn set_t_key(this: &Tagged, v: &JsValue);
    #[wasm_bindgen(method, getter = result)]
    pub fn t_result(this: &Tagged) -> JsValue;
    #[wasm_bindgen(method, setter = result)]
    pub fn set_t_result(this: &Tagged, v: &JsValue);
    #[wasm_bindgen(method, getter = value)]
    pub fn t_value(this: &Tagged) -> JsValue;
    #[wasm_bindgen(method, setter = value)]
    pub fn set_t_value(this: &Tagged, v: &JsValue);

    /// Any DOM object, with methods taking JS strings directly so attribute /
    /// event names and values never round-trip through Rust `String`s on the
    /// hot commit path. Obtain one with [`dom`].
    #[wasm_bindgen(extends = Object)]
    pub type Dom;

    #[wasm_bindgen(method, catch, js_name = setAttribute)]
    pub fn set_attribute_js(this: &Dom, name: &JsValue, value: &JsValue) -> Result<(), JsValue>;
    #[wasm_bindgen(method, catch, js_name = removeAttribute)]
    pub fn remove_attribute_js(this: &Dom, name: &JsValue) -> Result<(), JsValue>;
    #[wasm_bindgen(method, catch, js_name = addEventListener)]
    pub fn add_listener_js(this: &Dom, name: &JsValue, f: &js_sys::Function)
        -> Result<(), JsValue>;
    #[wasm_bindgen(method, catch, js_name = removeEventListener)]
    pub fn remove_listener_js(
        this: &Dom,
        name: &JsValue,
        f: &js_sys::Function,
    ) -> Result<(), JsValue>;
    #[wasm_bindgen(method, js_name = createTextNode)]
    pub fn create_text_node_js(this: &Dom, data: &JsValue) -> Node;
    #[wasm_bindgen(method, getter = data)]
    pub fn text_data(this: &Dom) -> JsValue;
    #[wasm_bindgen(method, setter = data)]
    pub fn set_text_data(this: &Dom, v: &JsValue);

    /// A live part record (or array slot). Field names are kept short because
    /// they are read on every commit.
    #[wasm_bindgen(extends = Object)]
    #[derive(Clone)]
    pub type PartRec;

    #[wasm_bindgen(method, getter = k)]
    pub fn kind(this: &PartRec) -> u8;
    #[wasm_bindgen(method, setter = k)]
    pub fn set_kind(this: &PartRec, v: u8);
    #[wasm_bindgen(method, getter = n)]
    pub fn name(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = n)]
    pub fn set_name(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = s)]
    pub fn start(this: &PartRec) -> Node;
    #[wasm_bindgen(method, setter = s)]
    pub fn set_start(this: &PartRec, v: &Node);
    #[wasm_bindgen(method, getter = e)]
    pub fn end(this: &PartRec) -> Node;
    #[wasm_bindgen(method, setter = e)]
    pub fn set_end(this: &PartRec, v: &Node);
    #[wasm_bindgen(method, getter = el)]
    pub fn element(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = el)]
    pub fn set_element(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = c)]
    pub fn committed(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = c)]
    pub fn set_committed(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = l)]
    pub fn listener(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = l)]
    pub fn set_listener(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = cs)]
    pub fn child_state(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = cs)]
    pub fn set_child_state(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = a)]
    pub fn array_state(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = a)]
    pub fn set_array_state(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = vp)]
    pub fn value_prefix(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = vp)]
    pub fn set_value_prefix(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = vs)]
    pub fn value_suffix(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = vs)]
    pub fn set_value_suffix(this: &PartRec, v: &JsValue);
    #[wasm_bindgen(method, getter = g)]
    pub fn attr_group(this: &PartRec) -> JsValue;
    #[wasm_bindgen(method, setter = g)]
    pub fn set_attr_group(this: &PartRec, v: &Array);
    #[wasm_bindgen(method, getter = r)]
    pub fn raw_text(this: &PartRec) -> bool;
    #[wasm_bindgen(method, setter = r)]
    pub fn set_raw_text(this: &PartRec, v: bool);
    /// TreeWalker index of the marker node in the prepared template (-1 if none).
    #[wasm_bindgen(method, getter = ni)]
    pub fn node_index(this: &PartRec) -> f64;
    #[wasm_bindgen(method, setter = ni)]
    pub fn set_node_index(this: &PartRec, v: f64);

    /// Commit state of a container or a template child part.
    #[wasm_bindgen(extends = Object)]
    #[derive(Clone)]
    pub type TemplateState;

    #[wasm_bindgen(method, getter)]
    pub fn strings(this: &TemplateState) -> JsValue;
    #[wasm_bindgen(method, setter)]
    pub fn set_strings(this: &TemplateState, v: &JsValue);
    #[wasm_bindgen(method, getter)]
    pub fn parts(this: &TemplateState) -> JsValue;
    #[wasm_bindgen(method, setter)]
    pub fn set_parts(this: &TemplateState, v: &JsValue);
    #[wasm_bindgen(method, getter)]
    pub fn key(this: &TemplateState) -> JsValue;
    #[wasm_bindgen(method, setter)]
    pub fn set_key(this: &TemplateState, v: &JsValue);

    /// The custom element host (JS `DimElement` subclass). Field names match
    /// the JS implementation so `el.hooks`, `useViewTransition` and
    /// `AutoTransitionHost` keep working unchanged.
    #[wasm_bindgen(extends = web_sys::HtmlElement)]
    #[derive(Clone)]
    pub type Host;

    #[wasm_bindgen(method, getter = hookIndex)]
    pub fn hook_index(this: &Host) -> f64;
    #[wasm_bindgen(method, setter = hookIndex)]
    pub fn set_hook_index(this: &Host, v: f64);
    #[wasm_bindgen(method, getter)]
    pub fn hooks(this: &Host) -> JsValue;
    #[wasm_bindgen(method, setter)]
    pub fn set_hooks(this: &Host, v: &Object);
    #[wasm_bindgen(method, getter = __controllers)]
    pub fn controllers(this: &Host) -> JsValue;
    #[wasm_bindgen(method, setter = __controllers)]
    pub fn set_controllers(this: &Host, v: &Array);
    #[wasm_bindgen(method, getter = __updatePromise)]
    pub fn update_promise(this: &Host) -> JsValue;
    #[wasm_bindgen(method, setter = __updatePromise)]
    pub fn set_update_promise(this: &Host, v: &JsValue);
    #[wasm_bindgen(method, getter = __hasRequestedUpdate)]
    pub fn has_requested_update(this: &Host) -> bool;
    #[wasm_bindgen(method, setter = __hasRequestedUpdate)]
    pub fn set_has_requested_update(this: &Host, v: bool);
    #[wasm_bindgen(method, getter = __isConnected)]
    pub fn dim_connected(this: &Host) -> bool;
    #[wasm_bindgen(method, setter = __isConnected)]
    pub fn set_dim_connected(this: &Host, v: bool);
    #[wasm_bindgen(method, setter = __hasRendered)]
    pub fn set_has_rendered(this: &Host, v: bool);
    #[wasm_bindgen(method, getter = renderRoot)]
    pub fn render_root(this: &Host) -> JsValue;
    #[wasm_bindgen(method, setter = renderRoot)]
    pub fn set_render_root(this: &Host, v: &JsValue);
    #[wasm_bindgen(method, getter = __styleQueue)]
    pub fn style_queue(this: &Host) -> JsValue;
    #[wasm_bindgen(method, setter = __styleQueue)]
    pub fn set_style_queue(this: &Host, v: &JsValue);
    #[wasm_bindgen(method, getter = __adoptedSheets)]
    pub fn adopted_sheets(this: &Host) -> JsValue;
    #[wasm_bindgen(method, setter = __adoptedSheets)]
    pub fn set_adopted_sheets(this: &Host, v: &Object);
    #[wasm_bindgen(method, setter = _props)]
    pub fn set_props_raw(this: &Host, v: &JsValue);

    #[wasm_bindgen(method, catch, js_name = render)]
    pub fn call_render(this: &Host) -> Result<JsValue, JsValue>;
    #[wasm_bindgen(method, catch, js_name = updated)]
    pub fn call_updated(this: &Host) -> Result<JsValue, JsValue>;
    #[wasm_bindgen(method, catch, js_name = createRenderRoot)]
    pub fn call_create_render_root(this: &Host) -> Result<JsValue, JsValue>;
}

/// Property keys are interned so repeated lookups reuse one JS string
/// instead of decoding UTF-8 on every call.
pub fn key(name: &str) -> JsValue {
    JsValue::from_str(wasm_bindgen::intern(name))
}

pub fn get(target: &JsValue, name: &str) -> JsValue {
    js_sys::Reflect::get(target, &key(name)).unwrap_or(JsValue::UNDEFINED)
}

pub fn set(target: &JsValue, name: &str, value: &JsValue) {
    let _ = js_sys::Reflect::set(target, &key(name), value);
}

pub fn dom(v: &impl AsRef<JsValue>) -> &Dom {
    v.as_ref().unchecked_ref()
}

pub fn is_empty_str(v: &JsValue) -> bool {
    v.is_undefined() || v.unchecked_ref::<js_sys::JsString>().length() == 0
}

pub fn as_tagged(v: &JsValue) -> &Tagged {
    v.unchecked_ref()
}

/// Cast (not copy) a JS array. `js_sys::Array::from` is `Array.from`, which
/// would return a new array and lose in-place mutations.
pub fn as_array(v: &JsValue) -> Array {
    v.clone().unchecked_into()
}

pub fn truthy(v: &JsValue) -> bool {
    v.is_truthy()
}

/// `target[method](...args)` if `target[method]` is a function.
pub fn call_optional(target: &JsValue, method: &str) -> Result<(), JsValue> {
    let f = get(target, method);
    if let Some(f) = f.dyn_ref::<js_sys::Function>() {
        f.call0(target)?;
    }
    Ok(())
}

pub fn new_part() -> PartRec {
    Object::new().unchecked_into()
}

pub fn new_state() -> TemplateState {
    Object::new().unchecked_into()
}
