//! Element lifecycle, update scheduling, hooks, styles and props. Mirrors
//! `src/core/element/*` and `src/core/hooks/*`.

use std::cell::RefCell;

use js_sys::{Array, Function, Object};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{Element, Node};

use crate::dom::{self, document};
use crate::js::{self, call_optional, Host};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Promise, js_name = resolve)]
    fn promise_resolve(value: &JsValue) -> JsValue;
}

thread_local! {
    static CURRENT: RefCell<Option<Host>> = const { RefCell::new(None) };
    static DEFINE: RefCell<Option<Function>> = const { RefCell::new(None) };
    static FLUSH: Closure<dyn FnMut(JsValue) -> Result<JsValue, JsValue>> =
        Closure::new(|host: JsValue| do_update(host.unchecked_ref()).map(|_| JsValue::TRUE));
}

/// Register the facade's `define` so `useScope` can lazily define children.
#[wasm_bindgen(js_name = initRuntime)]
pub fn init_runtime(define: Function) {
    DEFINE.with(|d| *d.borrow_mut() = Some(define));
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

#[wasm_bindgen(js_name = hostInit)]
pub fn host_init(host: Host) {
    host.set_controllers(&Array::new());
    host.set_update_promise(&JsValue::NULL);
    host.set_has_requested_update(false);
    host.set_dim_connected(false);
    host.set_has_rendered(false);
    host.set_props_raw(&JsValue::UNDEFINED);
    host.set_render_root(&JsValue::NULL);
    host.set_hook_index(0.0);
    host.set_hooks(&Object::new());
}

fn controllers(host: &Host) -> Array {
    let c = host.controllers();
    if Array::is_array(&c) {
        c.unchecked_into()
    } else {
        let arr = Array::new();
        host.set_controllers(&arr);
        arr
    }
}

fn ensure_render_root(host: &Host) -> Result<(), JsValue> {
    if !host.render_root().is_truthy() {
        let root = host.call_create_render_root()?;
        host.set_render_root(&root);
    }
    Ok(())
}

#[wasm_bindgen(js_name = hostConnected)]
pub fn host_connected(host: Host) -> Result<(), JsValue> {
    host.set_dim_connected(true);
    ensure_render_root(&host)?;
    request_update(host.clone());
    for c in controllers(&host).iter() {
        call_optional(&c, "hostConnected")?;
    }
    Ok(())
}

#[wasm_bindgen(js_name = hostDisconnected)]
pub fn host_disconnected(host: Host) -> Result<(), JsValue> {
    host.set_dim_connected(false);
    let hooks = host.hooks();
    for c in controllers(&host).iter() {
        let effect_hook = js::get(&c, "__dimEffect");
        if let Some(name) = effect_hook.as_string() {
            let hook = js::get(&hooks, &name);
            let cleanup = js::get(&hook, "cleanup");
            if let Some(f) = cleanup.dyn_ref::<Function>() {
                js::set(&hook, "cleanup", &JsValue::UNDEFINED);
                f.call0(&JsValue::UNDEFINED)?;
            }
            continue;
        }
        call_optional(&c, "hostDisconnected")?;
    }
    Ok(())
}

#[wasm_bindgen(js_name = addController)]
pub fn add_controller(host: Host, controller: JsValue) -> Result<(), JsValue> {
    controllers(&host).push(&controller);
    if host.dim_connected() {
        call_optional(&controller, "hostConnected")?;
    }
    Ok(())
}

#[wasm_bindgen(js_name = removeController)]
pub fn remove_controller(host: Host, controller: JsValue) {
    let list = controllers(&host);
    let i = list.index_of(&controller, 0);
    if i >= 0 {
        let kept: Array = list
            .iter()
            .enumerate()
            .filter(|(idx, _)| *idx != i as usize)
            .map(|(_, v)| v)
            .collect();
        host.set_controllers(&kept);
    }
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

#[wasm_bindgen(js_name = requestUpdate)]
pub fn request_update(host: Host) -> JsValue {
    if host.has_requested_update() {
        return host.update_promise();
    }
    host.set_has_requested_update(true);
    let resolved = promise_resolve(&host);
    let then: Function = js::get(&resolved, "then").unchecked_into();
    let promise = FLUSH
        .with(|f| then.call1(&resolved, f.as_ref()))
        .unwrap_or(JsValue::UNDEFINED);
    host.set_update_promise(&promise);
    promise
}

fn do_update(host: &Host) -> Result<(), JsValue> {
    let out = do_update_inner(host);
    // Clear transition-time focus skip after each commit
    dom::set_skip_focus_restore(false);
    out
}

fn do_update_inner(host: &Host) -> Result<(), JsValue> {
    host.set_has_requested_update(false);
    ensure_render_root(host)?;
    let list = controllers(host);
    for c in list.iter() {
        call_optional(&c, "hostUpdate")?;
    }
    // Reset style queue; useStyle pushes entries during render()
    host.set_style_queue(&Array::new());
    let result = host.call_render()?;
    let root: Node = host.render_root().unchecked_into();
    dom::render(result, root, true)?;
    // Apply styles after commit so they aren't wiped by the first render clear
    flush_styles(host.clone())?;
    host.set_has_rendered(true);
    for c in controllers(host).iter() {
        call_optional(&c, "hostUpdated")?;
    }
    host.call_updated()?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

fn query_selector(root: &JsValue, selector: &str) -> JsValue {
    match js::get(root, "querySelector").dyn_ref::<Function>() {
        Some(f) => f
            .call1(root, &JsValue::from_str(selector))
            .unwrap_or(JsValue::NULL),
        None => JsValue::NULL,
    }
}

fn style_element(root: &JsValue, hook_name: &str) -> Result<Element, JsValue> {
    let existing = query_selector(root, &format!("[data-style-hook=\"{hook_name}\"]"));
    if existing.is_truthy() {
        return Ok(existing.unchecked_into());
    }
    let el = document().create_element("style")?;
    el.set_attribute("data-style-hook", hook_name)?;
    root.unchecked_ref::<Node>().append_child(&el)?;
    Ok(el)
}

#[wasm_bindgen(js_name = flushStyles)]
pub fn flush_styles(host: Host) -> Result<(), JsValue> {
    let queue = host.style_queue();
    if !Array::is_array(&queue) || js::as_array(&queue).length() == 0 {
        return Ok(());
    }
    let shadow = js::get(&host, "shadowRoot");
    let root = if shadow.is_truthy() {
        shadow
    } else {
        host.render_root()
    };
    if !root.is_truthy() {
        return Ok(());
    }
    let mut adopted = host.adopted_sheets();
    if !adopted.is_object() {
        let o = Object::new();
        host.set_adopted_sheets(&o);
        adopted = o.into();
    }
    for entry in js::as_array(&queue).iter() {
        let hook_name = js::get(&entry, "hookName").as_string().unwrap_or_default();
        let css_text = js::get(&entry, "cssText").as_string().unwrap_or_default();
        let existing = js::get(&adopted, &hook_name);
        if existing.is_truthy() {
            let replaced = match js::get(&existing, "replaceSync").dyn_ref::<Function>() {
                Some(f) => f.call1(&existing, &JsValue::from_str(&css_text)).is_ok(),
                None => false,
            };
            if !replaced {
                style_element(&root, &hook_name)?.set_text_content(Some(&css_text));
            }
            continue;
        }

        let found = query_selector(&root, &format!("[data-style-hook=\"{hook_name}\"]"));
        if !found.is_truthy() && js::truthy(&js::get(&entry, "preferAdopted")) {
            let current = js::get(&root, "adoptedStyleSheets");
            let sheet = js::get(&js::get(&entry, "cssResult"), "styleSheet");
            if !current.is_undefined() && sheet.is_truthy() {
                let next: Array = js::as_array(&current).iter().collect();
                next.push(&sheet);
                js::set(&root, "adoptedStyleSheets", &next);
                js::set(&adopted, &hook_name, &sheet);
                continue;
            }
        }
        let el: Element = if found.is_truthy() {
            found.unchecked_into()
        } else {
            style_element(&root, &hook_name)?
        };
        el.set_text_content(Some(&css_text));
    }
    host.set_style_queue(&Array::new());
    Ok(())
}

// ---------------------------------------------------------------------------
// Current instance + hooks
// ---------------------------------------------------------------------------

#[wasm_bindgen(js_name = beginRender)]
pub fn begin_render(host: Host) {
    host.set_hook_index(0.0);
    CURRENT.with(|c| *c.borrow_mut() = Some(host));
}

/// Compat for `setCurrentInstance` from `element/instance.ts` (no index reset).
#[wasm_bindgen(js_name = setCurrentInstance)]
pub fn set_current_instance(host: JsValue) {
    let next = if host.is_truthy() {
        Some(host.unchecked_into())
    } else {
        None
    };
    CURRENT.with(|c| *c.borrow_mut() = next);
}

#[wasm_bindgen(js_name = endRender)]
pub fn end_render() {
    CURRENT.with(|c| *c.borrow_mut() = None);
}

#[wasm_bindgen(js_name = currentInstance)]
pub fn current_instance() -> JsValue {
    match CURRENT.with(|c| c.borrow().clone()) {
        Some(h) => h.into(),
        None => {
            web_sys::console::error_1(&"Hooks should only be called inside a component.".into());
            JsValue::NULL
        }
    }
}

fn current() -> Result<Host, JsValue> {
    CURRENT
        .with(|c| c.borrow().clone())
        .ok_or_else(|| js_sys::Error::new("Hooks should only be called inside a component.").into())
}

fn next_hook(host: &Host, prefix: &str) -> String {
    let index = host.hook_index();
    host.set_hook_index(index + 1.0);
    format!("{prefix}{index}")
}

fn deps_changed(prev: &JsValue, next: &JsValue) -> bool {
    if !Array::is_array(prev) || !Array::is_array(next) {
        return true;
    }
    let prev = js::as_array(prev);
    js::as_array(next)
        .iter()
        .enumerate()
        .any(|(i, dep)| dep != prev.get(i as u32))
}

#[wasm_bindgen(js_name = useState)]
pub fn use_state(initial: JsValue) -> Result<Array, JsValue> {
    let host = current()?;
    let name = next_hook(&host, "hook-");
    let hooks = host.hooks();
    let key = JsValue::from_str(&name);
    // `in` check — falsy values are valid state
    if !js_sys::Reflect::has(&hooks, &key)? {
        js_sys::Reflect::set(&hooks, &key, &initial)?;
    }
    Ok(Array::of3(
        &js_sys::Reflect::get(&hooks, &key)?,
        &host,
        &key,
    ))
}

#[wasm_bindgen(js_name = setState)]
pub fn set_state(host: Host, name: String, next: JsValue) -> Result<(), JsValue> {
    let hooks = host.hooks();
    let prev = js::get(&hooks, &name);
    let value = match next.dyn_ref::<Function>() {
        Some(f) => f.call1(&JsValue::UNDEFINED, &prev)?,
        None => next,
    };
    // Bail out of re-rendering when the value is unchanged (matches React)
    if Object::is(&prev, &value) {
        return Ok(());
    }
    js::set(&hooks, &name, &value);
    request_update(host);
    Ok(())
}

#[wasm_bindgen(js_name = useEffect)]
pub fn use_effect(effect: Function, dependencies: JsValue) -> Result<(), JsValue> {
    let host = current()?;
    let name = next_hook(&host, "hook-");
    let hooks = host.hooks();
    let prev = js::get(&hooks, &name);
    let prev_deps = if prev.is_object() {
        js::get(&prev, "dependencies")
    } else {
        JsValue::UNDEFINED
    };
    let registered = prev.is_object() && js::truthy(&js::get(&prev, "controllerRegistered"));

    if deps_changed(&prev_deps, &dependencies) {
        if prev.is_object() {
            if let Some(f) = js::get(&prev, "cleanup").dyn_ref::<Function>() {
                f.call0(&JsValue::UNDEFINED)?;
            }
        }
        let cleanup = effect.call0(&JsValue::UNDEFINED)?;
        let slot = Object::new();
        js::set(&slot, "dependencies", &dependencies);
        js::set(&slot, "cleanup", &cleanup);
        js::set(
            &slot,
            "controllerRegistered",
            &JsValue::from_bool(registered),
        );
        js::set(&hooks, &name, &slot);
    }

    // Register the disconnect-cleanup controller only once per hook slot
    let slot = js::get(&hooks, &name);
    if !js::truthy(&js::get(&slot, "controllerRegistered")) {
        js::set(&slot, "controllerRegistered", &JsValue::TRUE);
        let controller = Object::new();
        js::set(&controller, "__dimEffect", &JsValue::from_str(&name));
        add_controller(host, controller.into())?;
    }
    Ok(())
}

#[wasm_bindgen(js_name = useMemo)]
pub fn use_memo(calculation: Function, dependencies: JsValue) -> Result<JsValue, JsValue> {
    let host = current()?;
    let name = next_hook(&host, "hook-");
    let hooks = host.hooks();
    let prev = js::get(&hooks, &name);
    let prev_deps = if prev.is_object() {
        js::get(&prev, "dependencies")
    } else {
        JsValue::UNDEFINED
    };
    if deps_changed(&prev_deps, &dependencies) {
        let value = calculation.call0(&JsValue::UNDEFINED)?;
        let slot = Object::new();
        js::set(&slot, "value", &value);
        js::set(&slot, "dependencies", &dependencies);
        js::set(&hooks, &name, &slot);
        return Ok(value);
    }
    Ok(js::get(&prev, "value"))
}

#[wasm_bindgen(js_name = useRef)]
pub fn use_ref(initial: JsValue) -> Result<JsValue, JsValue> {
    let host = current()?;
    let name = next_hook(&host, "hook-");
    let hooks = host.hooks();
    let existing = js::get(&hooks, &name);
    if existing.is_truthy() {
        return Ok(existing);
    }
    // Without an initial value `current` defaults to the host (getRef lookup)
    let slot = Object::new();
    let current: JsValue = if initial.is_undefined() {
        host.clone().into()
    } else {
        initial
    };
    js::set(&slot, "current", &current);
    js::set(&hooks, &name, &slot);
    Ok(slot.into())
}

/// `css_result` is already a CSSResult (the facade wraps plain strings).
#[wasm_bindgen(js_name = useStyle)]
pub fn use_style(css_result: JsValue) -> Result<(), JsValue> {
    let host = current()?;
    let name = next_hook(&host, "style-hook-");
    let hooks = host.hooks();
    let css_text = js::get(&css_result, "cssText");
    let prev = js::get(&hooks, &name);
    if prev != css_text {
        js::set(&hooks, &name, &css_text);
        let mut queue = host.style_queue();
        if !Array::is_array(&queue) {
            let q = Array::new();
            host.set_style_queue(&q);
            queue = q.into();
        }
        let entry = Object::new();
        js::set(&entry, "hookName", &JsValue::from_str(&name));
        js::set(&entry, "cssText", &css_text);
        js::set(&entry, "cssResult", &css_result);
        js::set(
            &entry,
            "preferAdopted",
            &JsValue::from_bool(!prev.is_truthy()),
        );
        js::as_array(&queue).push(&entry);
    }
    Ok(())
}

#[wasm_bindgen(js_name = useScope)]
pub fn use_scope(elements: Object) -> Result<(), JsValue> {
    let registry: web_sys::CustomElementRegistry = dom::global("customElements").unchecked_into();
    let define = DEFINE
        .with(|d| d.borrow().clone())
        .ok_or("Dim runtime not initialised")?;
    for key in Object::keys(&elements).iter() {
        let key_str = key.as_string().unwrap_or_default();
        let component = js_sys::Reflect::get(&elements, &key)?;
        let stamped = if component.is_function() {
            js::get(&component, "tag")
        } else {
            JsValue::UNDEFINED
        };
        let tag = match stamped.as_string().filter(|t| !t.is_empty()) {
            Some(t) => t,
            None if key_str.contains('-') => key_str.clone(),
            None => {
                web_sys::console::warn_1(&format!(
                    "useScope: cannot resolve tag for \"{key_str}\". Use a hyphenated tag key or call define() on the component first."
                ).into());
                continue;
            }
        };
        if registry.get(&tag).is_undefined() {
            let opts = Object::new();
            js::set(&opts, "tag", &JsValue::from_str(&tag));
            js::set(&opts, "component", &component);
            define.call1(&JsValue::UNDEFINED, &opts)?;
        }
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Props / attributes
// ---------------------------------------------------------------------------

#[wasm_bindgen(js_name = parseAttributes)]
pub fn parse_attributes(element: Element) -> Object {
    let out = Object::new();
    for name in element.get_attribute_names().iter() {
        let name = name.as_string().unwrap_or_default();
        let raw = element.get_attribute(&name).unwrap_or_default();
        let value = if raw.starts_with('{') || raw.starts_with('[') {
            js_sys::JSON::parse(&raw).unwrap_or_else(|_| JsValue::from_str(&raw))
        } else {
            JsValue::from_str(&raw)
        };
        js::set(&out, &name, &value);
    }
    out
}

/// Case-insensitive property lookup (HTML lowercases attribute names).
#[wasm_bindgen(js_name = readProp)]
pub fn read_prop(obj: JsValue, name: String) -> JsValue {
    if !obj.is_object() {
        return JsValue::UNDEFINED;
    }
    let direct = js::get(&obj, &name);
    if !direct.is_undefined() {
        return direct;
    }
    let lower = name.to_lowercase();
    let target: &Object = obj.unchecked_ref();
    Object::keys(target)
        .iter()
        .find(|k| k.as_string().is_some_and(|k| k.to_lowercase() == lower))
        .map(|k| js_sys::Reflect::get(&obj, &k).unwrap_or(JsValue::UNDEFINED))
        .unwrap_or(JsValue::UNDEFINED)
}

#[wasm_bindgen(js_name = mergeProps)]
pub fn merge_props(
    attributes: Object,
    host_props: JsValue,
    children: JsValue,
    child_elements: JsValue,
) -> Object {
    let raw = Object::assign(&Object::new(), &attributes);
    if host_props.is_object() {
        Object::assign(&raw, host_props.unchecked_ref());
    }
    js::set(&raw, "children", &children);
    js::set(&raw, "childElements", &child_elements);
    raw
}
