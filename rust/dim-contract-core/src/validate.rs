//! Contract validator — line-for-line mirror of `src/core/contracts/validate.js`
//! and the Lean reference `Dim.Spec.Validate.validate`.

use crate::json::Value;
use dim_spec_core::policy::{escape_text, sanitize_url};

pub type VResult = Result<Value, (String, String)>;

const PLACEHOLDER_KEYS: [&str; 4] = ["$u", "$fn", "$o", "$nf"];

pub fn is_placeholder(v: &Value, key: &str) -> bool {
    matches!(v, Value::Obj(kvs) if kvs.len() == 1 && kvs[0].0 == key)
}

fn is_record_value(v: &Value) -> bool {
    matches!(v, Value::Obj(_)) && !PLACEHOLDER_KEYS.iter().any(|k| is_placeholder(v, k))
}

pub fn undef() -> Value {
    Value::obj(vec![("$u", Value::Num(1.0))])
}

fn noop_fn() -> Value {
    Value::obj(vec![("$fn", Value::Num(-1.0))])
}

fn is_ascii_ws(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\n' | '\u{b}' | '\u{c}' | '\r')
}

pub fn trim_ascii(s: &str) -> String {
    s.trim_matches(is_ascii_ws).to_string()
}

pub fn normalize_newlines(s: &str) -> String {
    s.replace("\r\n", "\n").replace('\r', "\n")
}

pub fn len16(s: &str) -> usize {
    s.encode_utf16().count()
}

pub fn truncate16(s: &str, max: usize) -> String {
    let mut out = String::new();
    let mut len = 0;
    for c in s.chars() {
        if len + c.len_utf16() > max {
            break;
        }
        out.push(c);
        len += c.len_utf16();
    }
    out
}

fn char_allowed(cls: &str, ch: char) -> bool {
    let c = ch as u32;
    match cls {
        "id" => {
            ch.is_ascii_alphanumeric() || c == 95 || c == 46 || c == 58 || c == 45
        }
        "digits" => ch.is_ascii_digit(),
        "line" => c == 9 || (c >= 32 && c != 127),
        _ => true,
    }
}

fn flag(s: &Value, key: &str) -> bool {
    s.get(key).and_then(Value::as_bool).unwrap_or(false)
}

fn num_field(s: &Value, key: &str, dflt: f64) -> f64 {
    s.get(key).and_then(Value::as_f64).unwrap_or(dflt)
}

fn fail(s: &Value, path: &str, reason: &str) -> VResult {
    if flag(s, "coerce") {
        if let Some(d) = s.get("default") {
            return Ok(d.clone());
        }
    }
    Err((path.to_string(), reason.to_string()))
}

fn propagate(s: &Value, r: VResult) -> VResult {
    match r {
        Ok(v) => Ok(v),
        Err(e) => {
            if flag(s, "coerce") {
                if let Some(d) = s.get("default") {
                    return Ok(d.clone());
                }
            }
            Err(e)
        }
    }
}

fn is_int_string(v: &str) -> bool {
    let digits = v.strip_prefix('-').unwrap_or(v);
    !digits.is_empty() && digits.len() <= 15 && digits.bytes().all(|b| b.is_ascii_digit())
}

fn validate_number(s: &Value, path: &str, n: f64) -> VResult {
    let min = num_field(s, "min", f64::MIN);
    let max = num_field(s, "max", f64::MAX);
    if n >= min && n <= max {
        return Ok(Value::Num(n));
    }
    if flag(s, "coerce") {
        return Ok(Value::Num(if n < min { min } else { max }));
    }
    fail(s, path, "out of range")
}

fn values_equal(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Null, Value::Null) => true,
        (Value::Bool(x), Value::Bool(y)) => x == y,
        (Value::Num(x), Value::Num(y)) => x == y,
        (Value::Str(x), Value::Str(y)) => x == y,
        _ => false,
    }
}

pub fn validate(s: &Value, v: &Value, path: &str) -> VResult {
    let kind = s.get("k").and_then(Value::as_str).unwrap_or("");
    match kind {
        "any" => Ok(v.clone()),

        "bool" => match v {
            Value::Bool(_) => Ok(v.clone()),
            Value::Str(x) if flag(s, "coerce") && (x == "true" || x.is_empty()) => {
                Ok(Value::Bool(true))
            }
            Value::Str(x) if flag(s, "coerce") && x == "false" => Ok(Value::Bool(false)),
            _ => fail(s, path, "expected boolean"),
        },

        "int" => match v {
            Value::Num(n) if n.fract() == 0.0 => validate_number(s, path, *n),
            Value::Str(x) if flag(s, "coerce") && is_int_string(x) => {
                validate_number(s, path, x.parse::<f64>().unwrap_or(0.0))
            }
            _ => fail(s, path, "expected integer"),
        },

        "num" => match v {
            Value::Num(n) => validate_number(s, path, *n),
            _ => fail(s, path, "expected finite number"),
        },

        "str" => {
            let Value::Str(raw) = v else {
                return fail(s, path, "expected string");
            };
            let coerce = flag(s, "coerce");
            let trim = flag(s, "trim");
            let mut out = if flag(s, "nl") { normalize_newlines(raw) } else { raw.clone() };
            if trim {
                out = trim_ascii(&out);
            }
            let chars = s.get("chars").and_then(Value::as_str).unwrap_or("any");
            if chars != "any" {
                let filtered: String = out.chars().filter(|c| char_allowed(chars, *c)).collect();
                if filtered != out {
                    if !coerce {
                        return fail(s, path, &format!("disallowed characters ({chars})"));
                    }
                    out = if trim { trim_ascii(&filtered) } else { filtered };
                }
            }
            let max = num_field(s, "max", f64::MAX);
            if (len16(&out) as f64) > max {
                if !coerce {
                    return fail(s, path, &format!("longer than {}", crate::json::format_number(max)));
                }
                out = truncate16(&out, max as usize);
                if trim {
                    out = trim_ascii(&out);
                }
            }
            let min = num_field(s, "min", 0.0);
            if (len16(&out) as f64) < min {
                return fail(s, path, &format!("shorter than {}", crate::json::format_number(min)));
            }
            Ok(Value::Str(out))
        }

        "text" => {
            let Value::Str(raw) = v else {
                return fail(s, path, "expected string");
            };
            let max = num_field(s, "max", f64::MAX);
            let mut out = raw.clone();
            if (len16(&out) as f64) > max {
                if !flag(s, "coerce") {
                    return fail(s, path, &format!("longer than {}", crate::json::format_number(max)));
                }
                out = truncate16(&out, max as usize);
            }
            Ok(Value::Str(escape_text(&out)))
        }

        "url" => {
            let Value::Str(raw) = v else {
                return fail(s, path, "expected url string");
            };
            let attr = s.get("attr").and_then(Value::as_str).unwrap_or("href");
            Ok(Value::Str(sanitize_url(attr, raw)))
        }

        "enum" => {
            let values = s.get("values").and_then(Value::as_arr).unwrap_or(&[]);
            if values.iter().any(|x| values_equal(x, v)) {
                Ok(v.clone())
            } else {
                fail(s, path, "not one of the allowed values")
            }
        }

        "rec" => {
            if !is_record_value(v) {
                return fail(s, path, "expected object");
            }
            let mut out: Vec<(String, Value)> = Vec::new();
            let fields = s.get("fields").and_then(Value::as_arr).unwrap_or(&[]);
            for f in fields {
                let pair = f.as_arr().unwrap_or(&[]);
                let (Some(Value::Str(name)), Some(fs)) = (pair.first(), pair.get(1)) else {
                    continue;
                };
                let given = v.get(name).cloned().unwrap_or_else(undef);
                let r = validate(fs, &given, &format!("{path}.{name}"));
                match r {
                    Ok(x) => {
                        if !is_placeholder(&x, "$u") {
                            out.push((name.clone(), x));
                        }
                    }
                    Err(e) => return propagate(s, Err(e)),
                }
            }
            Ok(Value::Obj(out))
        }

        "arr" => {
            let Value::Arr(items) = v else {
                return fail(s, path, "expected array");
            };
            let max = num_field(s, "max", f64::MAX);
            let mut items: &[Value] = items;
            if (items.len() as f64) > max {
                if !flag(s, "coerce") {
                    return fail(s, path, &format!("more than {} items", crate::json::format_number(max)));
                }
                items = &items[..max as usize];
            }
            let of = s.get("of").cloned().unwrap_or(Value::Null);
            let mut out = Vec::with_capacity(items.len());
            for (i, x) in items.iter().enumerate() {
                match validate(&of, x, &format!("{path}[{i}]")) {
                    Ok(y) => out.push(y),
                    Err(e) => return propagate(s, Err(e)),
                }
            }
            let min = num_field(s, "min", 0.0);
            if (out.len() as f64) < min {
                return fail(s, path, &format!("fewer than {} items", crate::json::format_number(min)));
            }
            Ok(Value::Arr(out))
        }

        "opt" => {
            if is_placeholder(v, "$u") {
                return Ok(v.clone());
            }
            validate(s.get("of").unwrap_or(&Value::Null), v, path)
        }

        "nullable" => {
            if *v == Value::Null {
                return Ok(Value::Null);
            }
            propagate(s, validate(s.get("of").unwrap_or(&Value::Null), v, path))
        }

        "union" => {
            for alt in s.get("of").and_then(Value::as_arr).unwrap_or(&[]) {
                if let Ok(x) = validate(alt, v, path) {
                    return Ok(x);
                }
            }
            fail(s, path, "no union alternative matched")
        }

        "fn" => {
            if is_placeholder(v, "$fn") {
                Ok(v.clone())
            } else if flag(s, "coerce") {
                Ok(noop_fn())
            } else {
                fail(s, path, "expected function")
            }
        }

        other => Err((path.to_string(), format!("unknown schema kind {other}"))),
    }
}

/// `{ok:true,value}` / `{ok:false,path,reason}` — the shape JS expects.
pub fn result_to_value(r: VResult) -> Value {
    match r {
        Ok(v) => Value::obj(vec![("ok", Value::Bool(true)), ("value", v)]),
        Err((path, reason)) => Value::obj(vec![
            ("ok", Value::Bool(false)),
            ("path", Value::Str(path)),
            ("reason", Value::Str(reason)),
        ]),
    }
}
