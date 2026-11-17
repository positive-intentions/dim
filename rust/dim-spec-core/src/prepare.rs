//! Pure string logic for template preparation. Mirrors
//! `src/core/renderer/pure/prepare.js`. No JS/DOM types here so it can be unit
//! tested on the host with `cargo test` and translated by Aeneas.

use crate::policy::check_binding_policy;

pub const CHILD_PART: u8 = 0;
pub const ATTR_PART: u8 = 1;
pub const PROP_PART: u8 = 2;
pub const EVENT_PART: u8 = 3;
pub const BOOL_PART: u8 = 4;
pub const REF_PART: u8 = 5;

pub const COMMENT_MARKER: &str = "<!--{{dim}}-->";
pub const COMMENT_MARKER_DATA: &str = "{{dim}}";
/// Text sentinel for bindings inside <style>/<script>/<textarea>/<title>.
pub const TEXT_MARKER: &str = "\u{FFF0}dim\u{FFF1}";
const RAW_TEXT_TAGS: [&str; 4] = ["style", "script", "textarea", "title"];

#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct PartInfo {
    pub kind: u8,
    pub name: String,
    pub value_prefix: String,
    pub value_suffix: String,
    pub raw_text: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Prepared {
    pub html: String,
    pub parts: Vec<PartInfo>,
}

#[derive(Debug, PartialEq, Eq)]
struct Binding {
    kind: u8,
    name: String,
    quote: Option<char>,
    match_len: usize,
    value_prefix: String,
    partial: bool,
}

fn is_name_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | ':' | '.')
}

fn is_name_start(c: char) -> bool {
    c.is_ascii_alphabetic() || matches!(c, '_' | ':')
}

fn is_word_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_'
}

/// Match `([.?@])?([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*` ending exactly at `end`
/// (byte index). Returns `(match_start, prefix, name)` using leftmost-match
/// semantics of the JS regex.
fn match_attr_head(s: &str, end: usize) -> Option<(usize, Option<char>, String)> {
    let head = &s[..end];
    let trimmed = head.trim_end_matches(char::is_whitespace);
    let before_eq = trimmed.strip_suffix('=')?;
    let before_eq = before_eq.trim_end_matches(char::is_whitespace);
    let run_start = before_eq
        .char_indices()
        .rev()
        .take_while(|(_, c)| is_name_char(*c))
        .last()
        .map(|(i, _)| i)?;
    let run = &before_eq[run_start..];
    let (offset, _) = run.char_indices().find(|(_, c)| is_name_start(*c))?;
    let name_start = run_start + offset;
    let name = before_eq[name_start..].to_string();
    let prev = before_eq[..name_start].chars().next_back();
    match prev {
        Some(p @ ('.' | '?' | '@')) => Some((name_start - 1, Some(p), name)),
        _ => Some((name_start, None, name)),
    }
}

fn binding_kind(prefix: Option<char>, name: &str) -> u8 {
    match prefix {
        None if name == "ref" => REF_PART,
        Some('.') => PROP_PART,
        Some('@') => EVENT_PART,
        Some('?') => BOOL_PART,
        _ => ATTR_PART,
    }
}

fn get_binding_kind(s: &str) -> Binding {
    let child = Binding {
        kind: CHILD_PART,
        name: String::new(),
        quote: None,
        match_len: 0,
        value_prefix: String::new(),
        partial: false,
    };

    // Full binding at end: attr=, .prop=, @event=, ?bool=, ref=
    let (end, quote) = match s.chars().next_back() {
        Some(q @ ('"' | '\'')) => (s.len() - 1, Some(q)),
        _ => (s.len(), None),
    };
    if let Some((start, prefix, name)) = match_attr_head(s, end) {
        return Binding {
            kind: binding_kind(prefix, &name),
            name,
            quote,
            match_len: s.len() - start,
            value_prefix: String::new(),
            partial: false,
        };
    }

    // Partial attribute value: style="background:${x}" or class="a ${b} c"
    if let Some(qi) = s.rfind(['"', '\'']) {
        let Some(q) = s[qi..].chars().next() else {
            return child;
        };
        if let Some((start, prefix, name)) = match_attr_head(s, qi) {
            if prefix.is_some() {
                return child;
            }
            return Binding {
                kind: ATTR_PART,
                name,
                quote: Some(q),
                match_len: s.len() - start,
                value_prefix: s[qi + 1..].to_string(),
                partial: true,
            };
        }
    }
    child
}

/// Whether the end of `html_so_far` is inside a raw-text element.
fn is_inside_raw_text(html_so_far: &str) -> bool {
    let lower = html_so_far.to_ascii_lowercase();
    let b = lower.as_bytes();
    let mut in_raw: Option<String> = None;
    let mut i = 0;
    while i < b.len() {
        if b[i] != b'<' {
            i += 1;
            continue;
        }
        let mut j = i + 1;
        let is_close = j < b.len() && b[j] == b'/';
        if is_close {
            j += 1;
        }
        let name_start = j;
        if j < b.len() && b[j].is_ascii_lowercase() {
            j += 1;
            while j < b.len() && (b[j].is_ascii_lowercase() || b[j].is_ascii_digit()) {
                j += 1;
            }
        } else {
            i += 1;
            continue;
        }
        // \b: the name must not be followed by a word char
        if j < b.len() && is_word_char(b[j] as char) {
            i += 1;
            continue;
        }
        let Some(close) = lower[j..].find('>') else {
            i += 1;
            continue;
        };
        let name = &lower[name_start..j];
        if RAW_TEXT_TAGS.contains(&name) {
            if is_close {
                if in_raw.as_deref() == Some(name) {
                    in_raw = None;
                }
            } else if in_raw.is_none() {
                in_raw = Some(name.to_string());
            }
        }
        i = j + close + 1;
    }
    in_raw.is_some()
}

struct OpenAttr {
    name: String,
    quote: char,
}

/// Turn template strings into marker HTML plus part info.
/// Returns `Err` when a binding violates the security policy.
pub fn prepare(strings: &[String]) -> Result<Prepared, String> {
    let mut segs: Vec<String> = strings.to_vec();
    let mut parts = Vec::new();
    let mut out = String::new();
    let mut open_attr: Option<OpenAttr> = None;

    if segs.is_empty() {
        return Ok(Prepared { html: out, parts });
    }

    for i in 0..segs.len() - 1 {
        let s = segs[i].clone();

        if let Some(open) = open_attr.as_ref() {
            out.push_str(&format!(" data-dim-{i}=\"\""));
            let mut value_suffix = String::new();
            let name = open.name.clone();
            let quote = open.quote;
            let next = segs[i + 1].clone();
            if let Some(close_idx) = next.find(quote) {
                value_suffix = next[..close_idx].to_string();
                segs[i + 1] = next[close_idx + 1..].to_string();
                open_attr = None;
            }
            check_binding_policy(ATTR_PART, &name)?;
            parts.push(PartInfo {
                kind: ATTR_PART,
                name,
                value_prefix: s,
                value_suffix,
                raw_text: false,
            });
            continue;
        }

        let binding = get_binding_kind(&s);
        if binding.kind == CHILD_PART {
            let raw_text = is_inside_raw_text(&format!("{out}{s}"));
            out.push_str(&s);
            out.push_str(if raw_text {
                TEXT_MARKER
            } else {
                COMMENT_MARKER
            });
            parts.push(PartInfo {
                kind: CHILD_PART,
                raw_text,
                ..Default::default()
            });
            continue;
        }

        check_binding_policy(binding.kind, &binding.name)?;

        out.push_str(&s[..s.len() - binding.match_len]);
        out.push_str(&format!(" data-dim-{i}=\"\""));
        let mut value_suffix = String::new();
        let next = segs[i + 1].clone();
        let starts_with_quote = next.starts_with(['"', '\'']);
        if !next.is_empty() && (binding.kind == ATTR_PART || binding.kind == BOOL_PART) {
            let quote = binding
                .quote
                .or(if binding.partial { Some('"') } else { None });
            if let Some(quote) = quote {
                match next.find(quote) {
                    Some(0) => segs[i + 1] = next[1..].to_string(),
                    Some(close_idx) => {
                        value_suffix = next[..close_idx].to_string();
                        segs[i + 1] = next[close_idx + 1..].to_string();
                    }
                    None if binding.kind == ATTR_PART => {
                        open_attr = Some(OpenAttr {
                            name: binding.name.clone(),
                            quote,
                        });
                    }
                    None => {}
                }
            } else if starts_with_quote {
                segs[i + 1] = next[1..].to_string();
            }
        } else if !next.is_empty() && starts_with_quote {
            segs[i + 1] = next[1..].to_string();
        }
        parts.push(PartInfo {
            kind: binding.kind,
            name: binding.name,
            value_prefix: binding.value_prefix,
            value_suffix,
            raw_text: false,
        });
    }
    out.push_str(&segs[segs.len() - 1]);
    Ok(Prepared { html: out, parts })
}

fn is_custom_tag_char(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'-'
}

/// `<foo-bar ... />` → `<foo-bar ...></foo-bar>`
fn expand_self_closing(input: &str) -> String {
    let b = input.as_bytes();
    let mut out = String::with_capacity(input.len());
    let mut copied = 0;
    let mut i = 0;
    while i < b.len() {
        if b[i] != b'<' || i + 1 >= b.len() || !b[i + 1].is_ascii_alphabetic() {
            i += 1;
            continue;
        }
        let name_start = i + 1;
        let mut j = name_start + 1;
        while j < b.len() && b[j].is_ascii_alphanumeric() {
            j += 1;
        }
        if j >= b.len() || b[j] != b'-' {
            i += 1;
            continue;
        }
        while j < b.len() && is_custom_tag_char(b[j]) {
            j += 1;
        }
        let name_end = j;
        let Some(gt) = input[name_end..].find('>') else {
            i += 1;
            continue;
        };
        let gt = name_end + gt;
        if gt == name_end || b[gt - 1] != b'/' {
            i += 1;
            continue;
        }
        let attrs = input[name_end..gt - 1].trim_end_matches(char::is_whitespace);
        let name = &input[name_start..name_end];
        out.push_str(&input[copied..i]);
        out.push('<');
        out.push_str(name);
        out.push_str(attrs);
        out.push_str("></");
        out.push_str(name);
        out.push('>');
        copied = gt + 1;
        i = gt + 1;
    }
    out.push_str(&input[copied..]);
    out
}

/// Find `name={{body}}` occurrences (`(\w+)=\{\{([^}]+)\}\}`).
fn find_object_attrs(input: &str) -> Vec<(String, String, String)> {
    let mut found = Vec::new();
    let b = input.as_bytes();
    let mut search_from = 0;
    while let Some(rel) = input[search_from..].find("={{") {
        let eq = search_from + rel;
        let mut start = eq;
        while start > search_from && is_word_char(b[start - 1] as char) {
            start -= 1;
        }
        let body_start = eq + 3;
        let close = input[body_start..].find('}').map(|c| body_start + c);
        match close {
            Some(close) if start < eq && close > body_start && b.get(close + 1) == Some(&b'}') => {
                found.push((
                    input[start..close + 2].to_string(),
                    input[start..eq].to_string(),
                    input[body_start..close].to_string(),
                ));
                search_from = close + 2;
            }
            _ => search_from = eq + 1,
        }
    }
    found
}

/// React-like preprocess for static template strings. Returns `None` when the
/// strings are unchanged so callers can keep the original array identity.
/// `normalize_json` receives `{body}` and returns its canonical JSON string.
pub fn process_static_strings(
    strings: &[String],
    normalize_json: impl Fn(&str) -> Option<String>,
) -> Option<Vec<String>> {
    if strings.is_empty() {
        return None;
    }
    let value_count = strings.len() - 1;
    let mut full = strings[0].clone();
    for (i, s) in strings.iter().enumerate().skip(1) {
        full.push_str(&format!("__VALUE_{}__", i - 1));
        full.push_str(s);
    }
    let original = full.clone();

    full = expand_self_closing(&full);

    let mut replacements = Vec::new();
    for (whole, name, body) in find_object_attrs(&full) {
        match normalize_json(&format!("{{{body}}}")) {
            Some(json) => replacements.push((whole, format!("{name}='{json}'"))),
            None => web_warn_json(&body),
        }
    }
    for (from, to) in replacements {
        full = full.replacen(&from, &to, 1);
    }

    if full == original {
        return None;
    }

    let mut out = Vec::with_capacity(value_count + 1);
    let mut rest = full.as_str();
    loop {
        match find_value_marker(rest) {
            Some((start, end)) => {
                out.push(rest[..start].to_string());
                rest = &rest[end..];
            }
            None => {
                out.push(rest.to_string());
                break;
            }
        }
    }
    while out.len() < value_count + 1 {
        out.push(String::new());
    }
    Some(out)
}

fn find_value_marker(s: &str) -> Option<(usize, usize)> {
    let mut from = 0;
    while let Some(rel) = s[from..].find("__VALUE_") {
        let start = from + rel;
        let digits_start = start + "__VALUE_".len();
        let digits = s[digits_start..]
            .bytes()
            .take_while(|b| b.is_ascii_digit())
            .count();
        let after = digits_start + digits;
        if digits > 0 && s[after..].starts_with("__") {
            return Some((start, after + 2));
        }
        from = start + 1;
    }
    None
}

fn web_warn_json(_body: &str) {}

/// JSON-serializable prepare result for the Lean oracle / differential tests.
pub fn prepare_to_json(strings: &[String]) -> Result<String, String> {
    let p = prepare(strings)?;
    let mut out = String::from("{\"html\":");
    out.push_str(&json_string(&p.html));
    out.push_str(",\"parts\":[");
    for (i, part) in p.parts.iter().enumerate() {
        if i > 0 {
            out.push(',');
        }
        out.push_str("{\"kind\":");
        out.push_str(&part.kind.to_string());
        out.push_str(",\"name\":");
        out.push_str(&json_string(&part.name));
        out.push_str(",\"valuePrefix\":");
        out.push_str(&json_string(&part.value_prefix));
        out.push_str(",\"valueSuffix\":");
        out.push_str(&json_string(&part.value_suffix));
        out.push_str(",\"rawText\":");
        out.push_str(if part.raw_text { "true" } else { "false" });
        out.push('}');
    }
    out.push_str("]}");
    Ok(out)
}

fn json_string(s: &str) -> String {
    let mut out = String::from("\"");
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                out.push_str(&format!("\\u{:04x}", c as u32));
            }
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn v(items: &[&str]) -> Vec<String> {
        items.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn binding_kinds() {
        assert_eq!(get_binding_kind("<button @click=\"").kind, EVENT_PART);
        assert_eq!(get_binding_kind("<x-y .props=\"").kind, PROP_PART);
        assert_eq!(get_binding_kind("<b ?disabled=").kind, BOOL_PART);
        assert_eq!(get_binding_kind("<i ref=").kind, REF_PART);
        let b = get_binding_kind("<div class=\"");
        assert_eq!(
            (b.kind, b.name.as_str(), b.quote),
            (ATTR_PART, "class", Some('"'))
        );
        assert_eq!(b.match_len, " class=\"".len() - 1);
        assert_eq!(get_binding_kind("<p>hello ").kind, CHILD_PART);
    }

    #[test]
    fn partial_binding() {
        let b = get_binding_kind("<div style=\"background:");
        assert!(b.partial);
        assert_eq!(b.name, "style");
        assert_eq!(b.value_prefix, "background:");
        assert_eq!(get_binding_kind("<div @click=\"x ").kind, CHILD_PART);
    }

    #[test]
    fn prepare_child_and_attrs() {
        let p = prepare(&v(&["<div class=\"", "\">", "</div>"])).unwrap();
        assert_eq!(
            p.html,
            "<div  data-dim-0=\"\">".to_string() + COMMENT_MARKER + "</div>"
        );
        assert_eq!(p.parts.len(), 2);
        assert_eq!(p.parts[0].kind, ATTR_PART);
        assert_eq!(p.parts[1].kind, CHILD_PART);
    }

    #[test]
    fn prepare_multi_value_attr() {
        let p = prepare(&v(&["<div class=\"a ", " ", " c\"></div>"])).unwrap();
        assert_eq!(p.parts[0].value_prefix, "a ");
        assert_eq!(p.parts[0].value_suffix, "");
        assert_eq!(p.parts[1].name, "class");
        assert_eq!(p.parts[1].value_prefix, " ");
        assert_eq!(p.parts[1].value_suffix, " c");
        assert_eq!(p.html, "<div  data-dim-0=\"\" data-dim-1=\"\"></div>");
    }

    #[test]
    fn prepare_raw_text() {
        let p = prepare(&v(&["<style>a{color:", "}</style>"])).unwrap();
        assert!(p.parts[0].raw_text);
        assert!(p.html.contains(TEXT_MARKER));
        let p = prepare(&v(&["<style></style><p>", "</p>"])).unwrap();
        assert!(!p.parts[0].raw_text);
    }

    #[test]
    fn prepare_rejects_onclick() {
        let err = prepare(&v(&["<a onclick=\"", "\">x</a>"])).unwrap_err();
        assert!(err.contains("forbidden"));
    }

    #[test]
    fn self_closing_and_json() {
        let out = process_static_strings(&v(&["<my-el .props=\"", "\" />"]), |_| None).unwrap();
        assert_eq!(out, v(&["<my-el .props=\"", "\"></my-el>"]));
        let out = process_static_strings(&v(&["<x-a data={{\"a\": 1}}></x-a>"]), |s| {
            Some(s.replace(' ', ""))
        })
        .unwrap();
        assert_eq!(out, v(&["<x-a data='{\"a\":1}'></x-a>"]));
        assert!(process_static_strings(&v(&["<div></div>"]), |_| None).is_none());
    }
}
