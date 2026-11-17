//! Differential tests: Rust pure core vs Lean dim-oracle (when available).
//! Also self-contained property tests via proptest.

use dim_spec_core::{
    check_binding_policy, escape_text, sanitize_url, ATTR_PART, PROP_PART,
};
use proptest::prelude::*;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};

fn oracle_bin() -> Option<PathBuf> {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../../verification/lean/.lake/build/bin/dim-oracle");
    if root.is_file() {
        Some(root)
    } else {
        None
    }
}

fn ask_oracle(bin: &PathBuf, req: &str) -> Option<String> {
    let mut child = Command::new(bin)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;
    {
        let mut stdin = child.stdin.take()?;
        writeln!(stdin, "{req}").ok()?;
        writeln!(stdin, "QUIT").ok()?;
    }
    let stdout = child.stdout.take()?;
    let mut lines = BufReader::new(stdout).lines();
    let line = lines.next()?.ok()?;
    let _ = child.wait();
    // {"ok":true,"result":"..."}
    let key = "\"result\":\"";
    let start = line.find(key)? + key.len();
    let rest = &line[start..];
    let mut out = String::new();
    let mut chars = rest.chars();
    while let Some(c) = chars.next() {
        if c == '"' {
            break;
        }
        if c == '\\' {
            if let Some(n) = chars.next() {
                out.push(n);
            }
        } else {
            out.push(c);
        }
    }
    Some(out)
}

proptest! {
    #[test]
    fn sanitize_never_protocol_relative(name in "[a-z]{0,8}", value in ".*") {
        let out = sanitize_url(&name, &value);
        prop_assert!(!out.starts_with("//"));
    }

    #[test]
    fn escape_never_lt(s in ".*") {
        prop_assert!(!escape_text(&s).contains('<'));
    }

    #[test]
    fn onclick_rejected(suffix in "[a-z]{1,12}") {
        let name = format!("on{suffix}");
        // only pure lowercase event names are rejected by is_event_handler_attr
        if suffix.chars().all(|c| c.is_ascii_lowercase()) {
            prop_assert!(check_binding_policy(ATTR_PART, &name).is_err());
        }
    }
}

#[test]
fn concrete_policy_cases() {
    assert!(check_binding_policy(ATTR_PART, "onclick").is_err());
    assert!(check_binding_policy(ATTR_PART, "srcdoc").is_err());
    assert!(check_binding_policy(PROP_PART, "innerHTML").is_err());
    assert!(check_binding_policy(ATTR_PART, "class").is_ok());
    assert_eq!(
        sanitize_url("href", "javascript:alert(1)"),
        "about:invalid#dim"
    );
    assert_eq!(sanitize_url("href", "https://ex.com/a"), "https://ex.com/a");
    assert!(!escape_text("<script>").contains('<'));
}

#[test]
fn oracle_sanitize_matches_when_present() {
    let Some(bin) = oracle_bin() else {
        eprintln!("dim-oracle not built — skipping oracle differential test");
        return;
    };
    let cases = [
        ("href", "javascript:x"),
        ("href", "https://example.com"),
        ("href", "/rel"),
        ("src", "data:image/png;base64,xx"),
        ("src", "data:text/html,x"),
        ("href", "//evil"),
    ];
    for (name, value) in cases {
        let rust = sanitize_url(name, value);
        let req = format!(
            r#"{{"op":"sanitizeUrl","name":"{name}","value":"{value}"}}"#
        );
        let lean = ask_oracle(&bin, &req).expect("oracle response");
        assert_eq!(rust, lean, "mismatch for {name}={value}");
    }
}

#[test]
fn oracle_escape_matches_when_present() {
    let Some(bin) = oracle_bin() else {
        return;
    };
    for s in ["", "a", "<a>", "a&b", "<>&\""] {
        let rust = escape_text(s);
        let escaped_json = s
            .replace('\\', "\\\\")
            .replace('"', "\\\"")
            .replace('\n', "\\n");
        let req = format!(r#"{{"op":"escapeText","value":"{escaped_json}"}}"#);
        let lean = ask_oracle(&bin, &req).expect("oracle response");
        assert_eq!(rust, lean, "escape mismatch for {s:?}");
    }
}
