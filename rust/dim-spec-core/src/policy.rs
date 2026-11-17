//! Attribute / URL / prop safety policy (DOM-free).

use crate::prepare::{ATTR_PART, PROP_PART};

/// Attribute names that must never receive interpolated values.
pub const FORBIDDEN_ATTR_NAMES: &[&str] = &["srcdoc"];

/// Property names that must never be bound with `.prop=`.
pub const FORBIDDEN_PROP_NAMES: &[&str] = &["innerHTML", "outerHTML"];

/// Attributes whose values are treated as URLs.
pub const URL_ATTR_NAMES: &[&str] = &[
    "href",
    "src",
    "action",
    "formaction",
    "xlink:href",
    "poster",
    "ping",
];

const ALLOWED_SCHEMES: &[&str] = &["http:", "https:", "mailto:", "tel:"];

/// Whether an attribute name is an inline event handler (`onclick`, …).
pub fn is_event_handler_attr(name: &str) -> bool {
    let lower = name.to_ascii_lowercase();
    if lower.len() < 3 || !lower.starts_with("on") {
        return false;
    }
    lower[2..].bytes().all(|b| b.is_ascii_lowercase())
}

/// Validate a binding against the security policy.
pub fn check_binding_policy(kind: u8, name: &str) -> Result<(), String> {
    if kind == ATTR_PART {
        let lower = name.to_ascii_lowercase();
        if is_event_handler_attr(&lower) {
            return Err(format!(
                "Attribute binding \"{name}\" is forbidden; use @{} instead of on* attributes",
                &lower[2..]
            ));
        }
        if FORBIDDEN_ATTR_NAMES
            .iter()
            .any(|n| n.eq_ignore_ascii_case(&lower))
        {
            return Err(format!("Attribute binding \"{name}\" is forbidden"));
        }
    }
    if kind == PROP_PART
        && FORBIDDEN_PROP_NAMES.iter().any(|n| *n == name)
    {
        return Err(format!(
            "Property binding \".{name}\" is forbidden; use text children or unsafeHTML for trusted HTML"
        ));
    }
    Ok(())
}

pub fn is_url_attr(name: &str) -> bool {
    let lower = name.to_ascii_lowercase();
    URL_ATTR_NAMES.iter().any(|n| *n == lower)
}

/// Sanitize a URL attribute value. Disallowed schemes become `about:invalid#dim`.
pub fn sanitize_url(name: &str, value: &str) -> String {
    let raw = value.trim();
    if raw.is_empty() {
        return String::new();
    }
    let lower_name = name.to_ascii_lowercase();
    let lower = raw.to_ascii_lowercase();

    if raw.starts_with("//") {
        return "about:invalid#dim".to_string();
    }

    if let Some(colon) = raw.find(':') {
        if colon > 0 {
            let scheme = &lower[..=colon];
            if ALLOWED_SCHEMES.iter().any(|s| *s == scheme) {
                return raw.to_string();
            }
            if lower_name == "src"
                && scheme == "data:"
                && lower.starts_with("data:image/")
            {
                // data:image/<subtype>
                let rest = &lower["data:image/".len()..];
                let ok = rest
                    .chars()
                    .next()
                    .is_some_and(|c| c.is_ascii_alphanumeric());
                if ok {
                    return raw.to_string();
                }
            }
            return "about:invalid#dim".to_string();
        }
    }

    raw.to_string()
}

/// Escape text so it never contains `<` (law helper / oracle).
pub fn escape_text(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_onclick() {
        assert!(check_binding_policy(ATTR_PART, "onclick").is_err());
        assert!(check_binding_policy(ATTR_PART, "onClick").is_err());
    }

    #[test]
    fn rejects_srcdoc_and_inner_html() {
        assert!(check_binding_policy(ATTR_PART, "srcdoc").is_err());
        assert!(check_binding_policy(PROP_PART, "innerHTML").is_err());
        assert!(check_binding_policy(PROP_PART, "outerHTML").is_err());
    }

    #[test]
    fn allows_class_and_click_event() {
        assert!(check_binding_policy(ATTR_PART, "class").is_ok());
        assert!(check_binding_policy(crate::prepare::EVENT_PART, "click").is_ok());
    }

    #[test]
    fn sanitize_blocks_javascript() {
        assert_eq!(
            sanitize_url("href", "javascript:alert(1)"),
            "about:invalid#dim"
        );
        assert_eq!(sanitize_url("href", "https://ex.com"), "https://ex.com");
        assert_eq!(sanitize_url("href", "/path"), "/path");
        assert_eq!(
            sanitize_url("src", "data:image/png;base64,xx"),
            "data:image/png;base64,xx"
        );
        assert_eq!(
            sanitize_url("src", "data:text/html,x"),
            "about:invalid#dim"
        );
    }

    #[test]
    fn escape_never_outputs_lt() {
        assert!(!escape_text("<script>").contains('<'));
    }
}
