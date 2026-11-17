//! Template instantiation and commit. Mirrors `src/core/renderer/commit.js`,
//! `prepare.js` (DOM half), `template.js` and `focus.js`.

use std::cell::Cell;

use js_sys::{Array, Function, Object, WeakMap};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{Document, DocumentFragment, Element, HtmlTemplateElement, Node, ShadowRoot};

use crate::js::{
    self, as_tagged, is_empty_str, js_string, js_string_val, new_part, new_state, PartRec, Tagged,
    TemplateState,
};
use crate::template::{
    self, ATTR_PART, BOOL_PART, CHILD_PART, COMMENT_MARKER_DATA, EVENT_PART, PROP_PART, REF_PART,
    TEXT_MARKER,
};

pub const HTML_RESULT: u32 = 1;
pub const KEYED_RESULT: u32 = 2;
pub const UNSAFE_HTML_RESULT: u32 = 3;

const SHOW_ELEMENT: u32 = 0x1;
const SHOW_TEXT: u32 = 0x4;
const SHOW_COMMENT: u32 = 0x80;
const ELEMENT_NODE: u16 = 1;
const TEXT_NODE: u16 = 3;
const COMMENT_NODE: u16 = 8;

thread_local! {
    static TEMPLATE_CACHE: WeakMap = WeakMap::new();
    static PROCESSED_STRINGS: WeakMap = WeakMap::new();
    static CONTAINER_STATE: WeakMap = WeakMap::new();
    static SKIP_FOCUS_RESTORE: Cell<bool> = const { Cell::new(false) };
    static SLOT_STRINGS: Array = raw_strings(&["<slot></slot>"]);
    static EMPTY_STRINGS: Array = raw_strings(&[""]);
    static VALUE_STRINGS: Array = raw_strings(&["", ""]);
}

/// Read from `globalThis` without `instanceof Window` checks (which fail in
/// jsdom and other non-browser DOM hosts).
pub fn global(name: &str) -> JsValue {
    js::get(&js_sys::global(), name)
}

pub fn document() -> Document {
    global("document").unchecked_into()
}

fn raw_strings(items: &[&str]) -> Array {
    let arr: Array = items.iter().map(|s| JsValue::from_str(s)).collect();
    let raw: Array = items.iter().map(|s| JsValue::from_str(s)).collect();
    js::set(&arr, "raw", &raw);
    arr
}

fn dim_type(value: &JsValue) -> u32 {
    if !value.is_object() {
        return 0;
    }
    as_tagged(value).dim_type_raw().as_f64().unwrap_or(0.0) as u32
}

fn new_tagged(kind: u32) -> Tagged {
    let o: Tagged = Object::new().unchecked_into();
    o.set_dim_type_raw(kind);
    o
}

fn template_result(strings: &JsValue, values: &JsValue) -> JsValue {
    let o = new_tagged(HTML_RESULT);
    o.set_t_strings(strings);
    o.set_t_values(values);
    o.into()
}

fn to_strings(arr: &JsValue) -> Vec<String> {
    js::as_array(arr)
        .iter()
        .map(|s| s.as_string().unwrap_or_else(|| js_string(&s)))
        .collect()
}

// ---------------------------------------------------------------------------
// Public template API
// ---------------------------------------------------------------------------

#[wasm_bindgen(js_name = html)]
pub fn html(strings: JsValue, values: JsValue) -> Result<JsValue, JsValue> {
    let has_raw = strings.is_object()
        && js::get(&strings, "raw").is_truthy()
        && Array::is_array(&strings);
    if !has_raw {
        return Err(JsValue::from_str(
            "html`...` requires a template literal (TemplateStringsArray with .raw). \
             Do not call html() with a plain string or crafted array.",
        ));
    }

    let cached = PROCESSED_STRINGS.with(|m| m.get(strings.unchecked_ref()));
    let processed = if cached.is_undefined() {
        let normalize = |body: &str| {
            js_sys::JSON::parse(body)
                .ok()
                .and_then(|v| js_sys::JSON::stringify(&v).ok())
                .and_then(|s| s.as_string())
        };
        let next = match template::process_static_strings(&to_strings(&strings), normalize) {
            Some(items) => {
                let refs: Vec<&str> = items.iter().map(String::as_str).collect();
                raw_strings(&refs).into()
            }
            None => strings.clone(),
        };
        PROCESSED_STRINGS.with(|m| m.set(strings.unchecked_ref(), &next));
        next
    } else {
        cached
    };
    Ok(template_result(&processed, &values))
}

#[wasm_bindgen(js_name = keyed)]
pub fn keyed(key: JsValue, result: JsValue) -> JsValue {
    let o = new_tagged(KEYED_RESULT);
    o.set_t_key(&key);
    o.set_t_result(&result);
    o.into()
}

#[wasm_bindgen(js_name = unsafeHTML)]
pub fn unsafe_html(value: JsValue) -> JsValue {
    let o = new_tagged(UNSAFE_HTML_RESULT);
    o.set_t_value(&value);
    o.into()
}

#[wasm_bindgen(js_name = renderChildren)]
pub fn render_children(children: JsValue) -> JsValue {
    if !children.is_truthy() {
        return EMPTY_STRINGS.with(|s| template_result(s, &Array::new()));
    }
    if children.is_string() {
        // Strings are text, never HTML. Raw markup requires unsafeHTML(...).
        let values = Array::of1(&children);
        return VALUE_STRINGS.with(|s| template_result(s, &values));
    }
    SLOT_STRINGS.with(|s| template_result(s, &Array::new()))
}

// ---------------------------------------------------------------------------
// Template preparation (DOM half)
// ---------------------------------------------------------------------------

fn walker_for(root: &Node) -> Result<web_sys::TreeWalker, JsValue> {
    document().create_tree_walker_with_what_to_show(root, SHOW_ELEMENT | SHOW_COMMENT | SHOW_TEXT)
}

/// Prepare once per strings identity: parse, build the `<template>`, and
/// record each part's node index in TreeWalker order so instances can be
/// wired up without re-scanning attributes or node text.
fn get_prepared(strings: &JsValue) -> Result<JsValue, JsValue> {
    let cached = TEMPLATE_CACHE.with(|m| m.get(strings.unchecked_ref()));
    if !cached.is_undefined() {
        return Ok(cached);
    }
    let prepared = template::prepare(&to_strings(strings)).map_err(|e| JsValue::from_str(&e))?;
    let tpl: HtmlTemplateElement = document().create_element("template")?.unchecked_into();
    tpl.set_inner_html(&prepared.html);
    let has_raw = prepared.parts.iter().any(|p| p.raw_text);

    let mut comment_nodes: Vec<u32> = Vec::new();
    let mut attr_nodes: Vec<(usize, u32)> = Vec::new();
    if !has_raw {
        let content = tpl.content();
        let mut markers = Vec::new();
        let walker = walker_for(&content)?;
        while let Some(node) = walker.next_node()? {
            if node.node_type() == COMMENT_NODE
                && node.node_value().as_deref() == Some(COMMENT_MARKER_DATA)
            {
                markers.push(node);
            }
        }
        // Swap each marker for its (start, end) text pair in the template
        // itself; deep clones keep empty text nodes, so instances need no
        // per-part node creation.
        for comment in markers {
            let parent = comment.parent_node().ok_or("detached marker")?;
            let doc = document();
            parent.insert_before(&doc.create_text_node(""), Some(&comment))?;
            parent.insert_before(&doc.create_text_node(""), Some(&comment))?;
            parent.remove_child(&comment)?;
        }
        let walker = walker_for(&content)?;
        let mut index = 0u32;
        let mut pending_start = false;
        while let Some(node) = walker.next_node()? {
            match node.node_type() {
                TEXT_NODE => {
                    if node.node_value().is_none_or(|d| d.is_empty()) {
                        if !pending_start {
                            comment_nodes.push(index);
                        }
                        pending_start = !pending_start;
                    } else {
                        pending_start = false;
                    }
                }
                ELEMENT_NODE => {
                    let el: &Element = node.unchecked_ref();
                    for name in el.get_attribute_names().iter() {
                        let name = name.as_string().unwrap_or_default();
                        if let Some(Ok(part)) = name.strip_prefix("data-dim-").map(str::parse) {
                            attr_nodes.push((part, index));
                            el.remove_attribute(&name)?;
                        }
                    }
                }
                _ => {}
            }
            index += 1;
        }
    }

    let infos = Array::new();
    let mut comments = comment_nodes.into_iter();
    for (i, p) in prepared.parts.iter().enumerate() {
        let info = new_part();
        info.set_kind(p.kind);
        info.set_name(&js::key(&p.name));
        info.set_value_prefix(&JsValue::from_str(&p.value_prefix));
        info.set_value_suffix(&JsValue::from_str(&p.value_suffix));
        info.set_raw_text(p.raw_text);
        let node_index = if p.kind == CHILD_PART {
            comments.next()
        } else {
            attr_nodes
                .iter()
                .find(|(part, _)| *part == i)
                .map(|(_, n)| *n)
        };
        info.set_node_index(node_index.map(f64::from).unwrap_or(-1.0));
        infos.push(&info);
    }
    let max_index = prepared.parts.iter().enumerate().fold(-1.0, |m, (i, _)| {
        f64::max(
            m,
            infos.get(i as u32).unchecked_into::<PartRec>().node_index() + 1.0,
        )
    });
    let mut attr_names: Vec<(i64, &str)> = Vec::new();
    let mut grouped = has_raw;
    for (i, p) in prepared.parts.iter().enumerate() {
        if p.kind == ATTR_PART {
            let node = infos.get(i as u32).unchecked_into::<PartRec>().node_index() as i64;
            grouped |= attr_names.contains(&(node, p.name.as_str()));
            attr_names.push((node, p.name.as_str()));
        }
    }
    let entry = Object::new();
    js::set(&entry, "t", &tpl);
    js::set(&entry, "p", &infos);
    js::set(&entry, "raw", &JsValue::from_bool(has_raw));
    js::set(&entry, "max", &JsValue::from_f64(max_index));
    js::set(&entry, "grp", &JsValue::from_bool(grouped));
    TEMPLATE_CACHE.with(|m| m.set(strings.unchecked_ref(), &entry));
    Ok(entry.into())
}

fn new_child_part(info: &PartRec) -> PartRec {
    let part = new_part();
    part.set_kind(info.kind());
    part.set_name(&info.name());
    part.set_committed(&JsValue::UNDEFINED);
    part
}

fn new_attr_part(info: &PartRec, element: &JsValue) -> PartRec {
    let part = new_child_part(info);
    part.set_element(element);
    part.set_listener(&JsValue::NULL);
    part.set_value_prefix(&info.value_prefix());
    part.set_value_suffix(&info.value_suffix());
    part
}

fn wire_comment_marker(part: &PartRec, comment: &Node) -> Result<(), JsValue> {
    let doc = document();
    let start: Node = doc.create_text_node("").into();
    let end: Node = doc.create_text_node("").into();
    let parent = comment.parent_node().ok_or("detached marker")?;
    parent.insert_before(&start, Some(comment))?;
    parent.insert_before(&end, Some(comment))?;
    parent.remove_child(comment)?;
    part.set_start(&start);
    part.set_end(&end);
    Ok(())
}

fn append_empty_range(part: &PartRec, fragment: &DocumentFragment) -> Result<(), JsValue> {
    let doc = document();
    let start: Node = doc.create_text_node("").into();
    let end: Node = doc.create_text_node("").into();
    fragment.append_child(&start)?;
    fragment.append_child(&end)?;
    part.set_start(&start);
    part.set_end(&end);
    Ok(())
}

fn create_instance(prepared: &JsValue) -> Result<(DocumentFragment, Array), JsValue> {
    let tpl: HtmlTemplateElement = js::get(prepared, "t").unchecked_into();
    let infos = js::as_array(&js::get(prepared, "p"));
    let fragment: DocumentFragment = tpl.content().clone_node_with_deep(true)?.unchecked_into();
    let parts = if js::truthy(&js::get(prepared, "raw")) {
        instantiate_scanning(&fragment, &infos)?
    } else {
        let max = js::get(prepared, "max").as_f64().unwrap_or(-1.0);
        instantiate_indexed(&fragment, &infos, max)?
    };
    if js::truthy(&js::get(prepared, "grp")) {
        link_attr_groups(&parts);
    }
    Ok((fragment, parts))
}

/// Fast path: grab marker nodes by their precomputed walk index. Child
/// parts index their start text node; the end node is its next sibling.
fn instantiate_indexed(
    fragment: &DocumentFragment,
    infos: &Array,
    max: f64,
) -> Result<Array, JsValue> {
    let mut nodes: Vec<Node> = Vec::new();
    if max >= 0.0 {
        let walker = walker_for(fragment)?;
        while (nodes.len() as f64) <= max {
            match walker.next_node()? {
                Some(n) => nodes.push(n),
                None => break,
            }
        }
    }
    let parts = Array::new();
    for info in infos.iter() {
        let info: PartRec = info.unchecked_into();
        let idx = info.node_index();
        let node = if idx >= 0.0 {
            nodes.get(idx as usize)
        } else {
            None
        };
        let part = if info.kind() == CHILD_PART {
            let part = new_child_part(&info);
            match (node, nodes.get(idx as usize + 1)) {
                (Some(start), Some(end)) if idx >= 0.0 => {
                    part.set_start(start);
                    part.set_end(end);
                }
                _ => append_empty_range(&part, fragment)?,
            }
            part
        } else {
            new_attr_part(
                &info,
                node.map(JsValue::from).as_ref().unwrap_or(&JsValue::NULL),
            )
        };
        parts.push(&part);
    }
    Ok(parts)
}

enum Marker {
    Comment(Node),
    Text(Node),
}

/// Slow path for templates with bindings inside raw-text elements
/// (`<style>`, `<textarea>`, ...): scan markers like the JS renderer does.
fn instantiate_scanning(fragment: &DocumentFragment, infos: &Array) -> Result<Array, JsValue> {
    let doc = document();
    let walker = walker_for(fragment)?;
    let mut child_markers = Vec::new();
    let mut attr_nodes: Vec<(Element, usize, String)> = Vec::new();
    while let Some(node) = walker.next_node()? {
        match node.node_type() {
            COMMENT_NODE => {
                if node.node_value().as_deref() == Some(COMMENT_MARKER_DATA) {
                    child_markers.push(Marker::Comment(node));
                }
            }
            TEXT_NODE => {
                if node.node_value().is_some_and(|d| d.contains(TEXT_MARKER)) {
                    child_markers.push(Marker::Text(node));
                }
            }
            ELEMENT_NODE => {
                let el: Element = node.unchecked_into();
                for name in el.get_attribute_names().iter() {
                    let name = name.as_string().unwrap_or_default();
                    if let Some(Ok(index)) = name.strip_prefix("data-dim-").map(str::parse) {
                        attr_nodes.push((el.clone(), index, name));
                    }
                }
            }
            _ => {}
        }
    }

    let parts = Array::new();
    let mut markers = child_markers.into_iter();
    for (i, info) in infos.iter().enumerate() {
        let info: PartRec = info.unchecked_into();
        if info.kind() == CHILD_PART {
            let part = new_child_part(&info);
            match markers.next() {
                None => append_empty_range(&part, fragment)?,
                Some(Marker::Comment(comment)) => wire_comment_marker(&part, &comment)?,
                Some(Marker::Text(text)) => {
                    let start: Node = doc.create_text_node("").into();
                    let end: Node = doc.create_text_node("").into();
                    let parent = text.parent_node().ok_or("detached marker")?;
                    let data = text.node_value().unwrap_or_default();
                    let idx = data.find(TEXT_MARKER).unwrap_or(0);
                    let before = &data[..idx];
                    let after = &data[idx + TEXT_MARKER.len()..];
                    if !before.is_empty() {
                        parent.insert_before(&doc.create_text_node(before), Some(&text))?;
                    }
                    parent.insert_before(&start, Some(&text))?;
                    parent.insert_before(&end, Some(&text))?;
                    if !after.is_empty() {
                        parent.insert_before(&doc.create_text_node(after), Some(&text))?;
                    }
                    parent.remove_child(&text)?;
                    part.set_start(&start);
                    part.set_end(&end);
                }
            }
            parts.push(&part);
        } else {
            let element = match attr_nodes.iter().find(|a| a.1 == i) {
                Some((el, _, attr_name)) => {
                    el.remove_attribute(attr_name)?;
                    JsValue::from(el.clone())
                }
                None => JsValue::NULL,
            };
            parts.push(&new_attr_part(&info, &element));
        }
    }
    Ok(parts)
}

/// Link ATTR parts that share element + name so multi-binding attributes
/// (`class="${a} ${b}"`) commit as one joined string.
fn link_attr_groups(parts: &Array) {
    let mut groups: Vec<(JsValue, JsValue, Array)> = Vec::new();
    for p in parts.iter() {
        let p: PartRec = p.unchecked_into();
        if p.kind() != ATTR_PART || !p.element().is_truthy() {
            continue;
        }
        let el = p.element();
        let name = p.name();
        match groups.iter().find(|(e, n, _)| *e == el && *n == name) {
            Some((_, _, g)) => {
                g.push(&p);
            }
            None => groups.push((el, name, Array::of1(&p))),
        }
    }
    for (_, _, group) in groups {
        if group.length() > 1 {
            for p in group.iter() {
                p.unchecked_into::<PartRec>().set_attr_group(&group);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Commit
// ---------------------------------------------------------------------------

fn empty_js() -> JsValue {
    js::key("")
}

fn format_attr_mid(value: &JsValue) -> JsValue {
    if value.is_null_or_undefined() || value.as_bool().is_some() {
        return empty_js();
    }
    if value.is_string() {
        return value.clone();
    }
    js_string_val(value)
}

fn concat(a: &JsValue, b: &JsValue) -> JsValue {
    if is_empty_str(a) {
        return b.clone();
    }
    if is_empty_str(b) {
        return a.clone();
    }
    a.unchecked_ref::<js_sys::JsString>().concat(b).into()
}

fn finalize_attr_value(name: &JsValue, value: JsValue) -> JsValue {
    let name_str = name.as_string().unwrap_or_default();
    if template::is_url_attr(&name_str) {
        let raw = value.as_string().unwrap_or_else(|| js_string(&value));
        JsValue::from_str(&template::sanitize_url(&name_str, &raw))
    } else {
        value
    }
}

fn commit_attr_group(part: &PartRec) -> Result<(), JsValue> {
    let el: Element = part.element().unchecked_into();
    let group = part.attr_group();
    if group.is_undefined() {
        let prefix = part.value_prefix();
        let suffix = part.value_suffix();
        let committed = part.committed();
        let empty = committed.is_null_or_undefined() || committed == JsValue::FALSE;
        if empty && is_empty_str(&prefix) && is_empty_str(&suffix) {
            return js::dom(&el).remove_attribute_js(&part.name());
        }
        let value = concat(&concat(&prefix, &format_attr_mid(&committed)), &suffix);
        let value = finalize_attr_value(&part.name(), value);
        return js::dom(&el).set_attribute_js(&part.name(), &value);
    }
    let group = js::as_array(&group);
    let last: PartRec = group.get(group.length() - 1).unchecked_into();
    if JsValue::from(part.clone()) != JsValue::from(last.clone()) {
        return Ok(());
    }
    let mut result = empty_js();
    for g in group.iter() {
        let g: PartRec = g.unchecked_into();
        result = concat(
            &concat(&result, &g.value_prefix()),
            &format_attr_mid(&g.committed()),
        );
    }
    result = concat(&result, &last.value_suffix());
    let result = finalize_attr_value(&part.name(), result);
    js::dom(&el).set_attribute_js(&part.name(), &result)
}

fn clear_nodes_between(start: &Node, end: &Node) -> Result<(), JsValue> {
    let Some(first) = start.next_sibling() else {
        return Ok(());
    };
    if first.is_same_node(Some(end)) {
        return Ok(());
    }
    if first
        .next_sibling()
        .is_some_and(|n| n.is_same_node(Some(end)))
    {
        if let Some(parent) = first.parent_node() {
            parent.remove_child(&first)?;
        }
        return Ok(());
    }
    // One Range call instead of a boundary round trip per removed sibling.
    let range = document().create_range()?;
    range.set_start_after(start)?;
    range.set_end_before(end)?;
    range.delete_contents()
}

fn insert_before_end(part: &PartRec, node: &Node) -> Result<(), JsValue> {
    let end = part.end();
    if let Some(parent) = end.parent_node() {
        parent.insert_before(node, Some(&end))?;
    }
    Ok(())
}

fn reset_child(part: &PartRec) {
    part.set_child_state(&JsValue::UNDEFINED);
    part.set_array_state(&JsValue::UNDEFINED);
}

fn set_child_value(part: &PartRec, value: &JsValue) -> Result<(), JsValue> {
    match dim_type(value) {
        KEYED_RESULT => {
            let prev = part.committed();
            let tagged = as_tagged(value);
            let key_changed = !prev.is_truthy()
                || dim_type(&prev) != KEYED_RESULT
                || as_tagged(&prev).t_key() != tagged.t_key();
            if key_changed {
                clear_nodes_between(&part.start(), &part.end())?;
                reset_child(part);
            }
            part.set_committed(value);
            set_child_value(part, &tagged.t_result())?;
            part.set_committed(value);
            return Ok(());
        }
        UNSAFE_HTML_RESULT => {
            let raw = as_tagged(value).t_value();
            let html_string = if raw.is_null_or_undefined() {
                empty_js()
            } else {
                js_string_val(&raw)
            };
            let prev = part.committed();
            if dim_type(&prev) == UNSAFE_HTML_RESULT && as_tagged(&prev).t_value() == html_string {
                return Ok(());
            }
            clear_nodes_between(&part.start(), &part.end())?;
            if !is_empty_str(&html_string) {
                let tpl: HtmlTemplateElement =
                    document().create_element("template")?.unchecked_into();
                let html = html_string
                    .as_string()
                    .unwrap_or_else(|| js_string(&html_string));
                tpl.set_inner_html(&html);
                insert_before_end(part, &tpl.content())?;
            }
            part.set_committed(value);
            reset_child(part);
            return Ok(());
        }
        HTML_RESULT => {
            part.set_array_state(&JsValue::UNDEFINED);
            let mut state = part.child_state();
            if state.is_undefined() {
                state = new_state().into();
                part.set_child_state(&state);
            }
            commit_template_result(value, part, state.unchecked_ref())?;
            part.set_committed(value);
            return Ok(());
        }
        _ => {}
    }

    if Array::is_array(value) {
        commit_array(&js::as_array(value), part)?;
        part.set_committed(value);
        return Ok(());
    }

    if value.is_null_or_undefined() || *value == JsValue::FALSE {
        clear_nodes_between(&part.start(), &part.end())?;
        part.set_committed(value);
        reset_child(part);
        return Ok(());
    }

    if let Some(node) = value.dyn_ref::<Node>() {
        clear_nodes_between(&part.start(), &part.end())?;
        insert_before_end(part, node)?;
        part.set_committed(value);
        reset_child(part);
        return Ok(());
    }

    let text = if value.is_string() {
        value.clone()
    } else {
        js_string_val(value)
    };
    let end = part.end();
    let next = part.start().next_sibling();
    match next {
        Some(n)
            if !n.is_same_node(Some(&end))
                && n.node_type() == TEXT_NODE
                && n.next_sibling().is_some_and(|s| s.is_same_node(Some(&end))) =>
        {
            if js::dom(&n).text_data() != text {
                js::dom(&n).set_text_data(&text);
            }
        }
        _ => {
            clear_nodes_between(&part.start(), &end)?;
            insert_before_end(part, &js::dom(&document()).create_text_node_js(&text))?;
        }
    }
    part.set_committed(value);
    reset_child(part);
    Ok(())
}

fn commit_array(values: &Array, part: &PartRec) -> Result<(), JsValue> {
    let doc = document();
    if part.array_state().is_undefined() {
        clear_nodes_between(&part.start(), &part.end())?;
        part.set_array_state(&Array::new());
        part.set_child_state(&JsValue::UNDEFINED);
    }
    let state = js::as_array(&part.array_state());
    let len = values.length();
    let mut have = state.length();
    while have < len {
        let slot = new_part();
        let start: Node = doc.create_text_node("").into();
        let end: Node = doc.create_text_node("").into();
        insert_before_end(part, &start)?;
        insert_before_end(part, &end)?;
        slot.set_start(&start);
        slot.set_end(&end);
        slot.set_committed(&JsValue::UNDEFINED);
        state.push(&slot);
        have += 1;
    }
    if have > len {
        let first: PartRec = state.get(len).unchecked_into();
        let last: PartRec = state.get(have - 1).unchecked_into();
        let range = doc.create_range()?;
        range.set_start_before(&first.start())?;
        range.set_end_after(&last.end())?;
        range.delete_contents()?;
        state.set_length(len);
    }
    for i in 0..len {
        set_child_value(state.get(i).unchecked_ref(), &values.get(i))?;
    }
    Ok(())
}

fn commit_template_result(
    result: &JsValue,
    parent: &PartRec,
    state: &TemplateState,
) -> Result<(), JsValue> {
    let tagged = as_tagged(result);
    let strings = tagged.t_strings();
    if state.strings() != strings {
        let prepared = get_prepared(&strings)?;
        clear_nodes_between(&parent.start(), &parent.end())?;
        let (fragment, parts) = create_instance(&prepared)?;
        insert_before_end(parent, &fragment)?;
        state.set_strings(&strings);
        state.set_parts(&parts);
    }
    commit_values(&state.parts(), &tagged.t_values())
}

fn commit_values(parts: &JsValue, values: &JsValue) -> Result<(), JsValue> {
    let parts = js::as_array(parts);
    let values: Array = if values.is_object() {
        js::as_array(values)
    } else {
        Array::new()
    };
    for i in 0..parts.length() {
        commit_part(parts.get(i).unchecked_ref(), &values.get(i))?;
    }
    Ok(())
}

pub fn is_form_control(el: &JsValue) -> bool {
    match el.dyn_ref::<Element>() {
        Some(e) => matches!(e.tag_name().as_str(), "INPUT" | "TEXTAREA" | "SELECT"),
        None => false,
    }
}

/// Identical primitives (and the same listener function) need no DOM work.
/// `.prop` parts always re-assign so controlled inputs re-sync, and grouped
/// attributes commit at their last member so cannot skip individually.
fn is_unchanged(part: &PartRec, kind: u8, value: &JsValue) -> bool {
    if kind == PROP_PART || kind == REF_PART {
        return false;
    }
    let prev = part.committed();
    !prev.is_undefined()
        && prev == *value
        && !value.is_object()
        && (kind != ATTR_PART || part.attr_group().is_undefined())
}

fn commit_part(part: &PartRec, value: &JsValue) -> Result<(), JsValue> {
    let kind = part.kind();
    if is_unchanged(part, kind, value) {
        return Ok(());
    }
    if kind == CHILD_PART {
        return set_child_value(part, value);
    }
    let el = part.element();
    if kind == ATTR_PART {
        part.set_committed(value);
        if el.is_truthy() {
            commit_attr_group(part)?;
        }
        return Ok(());
    }
    if !el.is_truthy() {
        return Ok(());
    }
    let name = part.name();
    match kind {
        PROP_PART => {
            if (name == js::key("value") || name == js::key("checked"))
                && is_form_control(&el)
                && document()
                    .active_element()
                    .is_some_and(|a| JsValue::from(a) == el)
                && js_sys::Reflect::get(&el, &name)? == *value
            {
                part.set_committed(value);
                return Ok(());
            }
            js_sys::Reflect::set(&el, &name, value)?;
        }
        BOOL_PART => {
            let el: &Element = el.unchecked_ref();
            if value.is_truthy() {
                js::dom(&el).set_attribute_js(&name, &empty_js())?;
            } else {
                js::dom(&el).remove_attribute_js(&name)?;
            }
        }
        EVENT_PART => {
            let target: &web_sys::EventTarget = el.unchecked_ref();
            let prev = part.listener();
            if let Some(f) = prev.dyn_ref::<Function>() {
                js::dom(target).remove_listener_js(&name, f)?;
                part.set_listener(&JsValue::NULL);
            }
            if let Some(f) = value.dyn_ref::<Function>() {
                part.set_listener(f);
                js::dom(target).add_listener_js(&name, f)?;
            }
        }
        REF_PART => {
            if value.is_object() {
                js::set(value, "current", &el);
            }
        }
        _ => {}
    }
    part.set_committed(value);
    Ok(())
}

// ---------------------------------------------------------------------------
// Focus preservation
// ---------------------------------------------------------------------------

#[wasm_bindgen(js_name = setSkipFocusRestore)]
pub fn set_skip_focus_restore(value: bool) {
    SKIP_FOCUS_RESTORE.with(|c| c.set(value));
}

#[wasm_bindgen(js_name = getSkipFocusRestore)]
pub fn skip_focus_restore() -> bool {
    SKIP_FOCUS_RESTORE.with(Cell::get)
}

struct FocusSnapshot {
    el: Element,
    selection: Option<(JsValue, JsValue)>,
}

fn capture_focus(container: &Node) -> Option<FocusSnapshot> {
    if skip_focus_restore() {
        return None;
    }
    let root: JsValue = if container.dyn_ref::<ShadowRoot>().is_some() {
        container.clone().into()
    } else {
        container.get_root_node().into()
    };
    let mut active = js::get(&root, "activeElement");
    if !active.is_truthy() {
        active = document()
            .active_element()
            .map(JsValue::from)
            .unwrap_or(JsValue::NULL);
    }
    if !active.is_truthy() || !is_form_control(&active) {
        return None;
    }
    let active: Element = active.unchecked_into();
    if !container.contains(Some(&active)) && !container.is_same_node(Some(&active)) {
        return None;
    }
    let start = js::get(&active, "selectionStart");
    let selection = start
        .as_f64()
        .map(|_| (start, js::get(&active, "selectionEnd")));
    Some(FocusSnapshot {
        el: active,
        selection,
    })
}

fn restore_focus(snapshot: Option<FocusSnapshot>) {
    let Some(FocusSnapshot { el, selection }) = snapshot else {
        return;
    };
    if skip_focus_restore() || !el.is_connected() {
        return;
    }
    let el_val: JsValue = el.clone().into();
    if document().active_element().map(JsValue::from) != Some(el_val.clone()) {
        let opts = Object::new();
        js::set(&opts, "preventScroll", &JsValue::TRUE);
        if let Some(f) = js::get(&el_val, "focus").dyn_ref::<Function>() {
            let _ = f.call1(&el_val, &opts);
        }
    }
    if let Some((s, e)) = selection {
        if let Some(f) = js::get(&el_val, "setSelectionRange").dyn_ref::<Function>() {
            let _ = f.call2(&el_val, &s, &e);
        }
    }
}

// ---------------------------------------------------------------------------
// render()
// ---------------------------------------------------------------------------

/// Render a TemplateResult (or null) into a container (Element or ShadowRoot).
/// Commit state is keyed by container, not by result, so the same result can
/// render into a second container (view-transition outgoing layer).
#[wasm_bindgen(js_name = render)]
pub fn render(result: JsValue, container: Node, preserve_focus: bool) -> Result<(), JsValue> {
    let snapshot = if preserve_focus {
        capture_focus(&container)
    } else {
        None
    };
    let out = render_inner(&result, &container);
    if preserve_focus {
        restore_focus(snapshot);
    }
    out
}

fn render_inner(result: &JsValue, container: &Node) -> Result<(), JsValue> {
    let existing = CONTAINER_STATE.with(|m| m.get(container.unchecked_ref()));
    let state: TemplateState = if existing.is_undefined() {
        let s = new_state();
        s.set_strings(&JsValue::NULL);
        s.set_parts(&JsValue::NULL);
        CONTAINER_STATE.with(|m| m.set(container.unchecked_ref(), &s));
        s
    } else {
        existing.unchecked_into()
    };

    let reset = |state: &TemplateState| {
        container.set_text_content(Some(""));
        state.set_strings(&JsValue::NULL);
        state.set_parts(&JsValue::NULL);
    };

    if result.is_null_or_undefined() {
        reset(&state);
        return Ok(());
    }

    let mut top = result.clone();
    if dim_type(&top) == KEYED_RESULT {
        let key = as_tagged(&top).t_key();
        if state.key() != key {
            reset(&state);
            state.set_key(&key);
        }
        top = as_tagged(&top).t_result();
    }

    if dim_type(&top) != HTML_RESULT {
        reset(&state);
        if top.as_string().is_some() || top.as_f64().is_some() {
            container.set_text_content(Some(&js_string(&top)));
        }
        return Ok(());
    }

    let strings = as_tagged(&top).t_strings();
    if state.strings() != strings {
        let prepared = get_prepared(&strings)?;
        container.set_text_content(Some(""));
        let (fragment, parts) = create_instance(&prepared)?;
        container.append_child(&fragment)?;
        state.set_strings(&strings);
        state.set_parts(&parts);
    }
    commit_values(&state.parts(), &as_tagged(&top).t_values())
}
