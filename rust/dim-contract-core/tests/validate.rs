use dim_contract_core::{json, validate, validate_json};
use proptest::prelude::*;

fn schema(src: &str) -> json::Value {
    json::parse(src).unwrap()
}

#[test]
fn strings_trim_truncate_and_chars() {
    let s = r#"{"k":"str","min":0,"max":3,"trim":true,"nl":false,"chars":"any","coerce":true}"#;
    assert_eq!(validate_json(s, r#""  abcd ""#), r#"{"ok":true,"value":"abc"}"#);
    let id = r#"{"k":"str","min":1,"max":128,"trim":true,"nl":false,"chars":"id"}"#;
    assert_eq!(
        validate_json(id, r#""a b""#),
        r#"{"ok":false,"path":"$","reason":"disallowed characters (id)"}"#
    );
    let s2 = r#"{"k":"str","min":0,"max":3,"trim":false,"nl":false,"chars":"any","coerce":true}"#;
    assert_eq!(validate_json(s2, "\"ab\u{1F600}\""), r#"{"ok":true,"value":"ab"}"#);
}

#[test]
fn records_defaults_optional_fn() {
    let s = r#"{"k":"rec","fields":[["a",{"k":"str","min":0,"max":9,"trim":false,"nl":false,"chars":"any","coerce":true,"default":""}],["b",{"k":"opt","of":{"k":"int","min":0,"max":9}}],["on",{"k":"fn","args":[],"ret":{"k":"any"},"coerce":true}]]}"#;
    assert_eq!(
        validate_json(s, r#"{"x":1}"#),
        r#"{"ok":true,"value":{"a":"","on":{"$fn":-1}}}"#
    );
}

#[test]
fn url_and_text_use_spec_core() {
    assert_eq!(
        validate_json(r#"{"k":"url","attr":"href"}"#, r#""javascript:x""#),
        r#"{"ok":true,"value":"about:invalid#dim"}"#
    );
    assert_eq!(
        validate_json(r#"{"k":"text","max":10}"#, r#""<b>""#),
        r#"{"ok":true,"value":"&lt;b&gt;"}"#
    );
}

#[test]
fn arrays_and_paths() {
    let s = r#"{"k":"arr","of":{"k":"int","min":-9,"max":9},"min":0,"max":5}"#;
    assert_eq!(
        validate_json(s, r#"[1,"x"]"#),
        r#"{"ok":false,"path":"$[1]","reason":"expected integer"}"#
    );
}

proptest! {
    #[test]
    fn idempotent_on_outputs(raw in "[ a-z\t\r\n!]{0,12}", n in -50i64..50) {
        let s = schema(r#"{"k":"rec","fields":[["t",{"k":"str","min":0,"max":5,"trim":true,"nl":true,"chars":"line","coerce":true}],["n",{"k":"int","min":-3,"max":3,"coerce":true}]]}"#);
        let v = json::Value::obj(vec![("t", json::Value::Str(raw)), ("n", json::Value::Num(n as f64))]);
        if let Ok(w) = validate(&s, &v, "$") {
            prop_assert_eq!(validate(&s, &w, "$"), Ok(w));
        }
    }
}
