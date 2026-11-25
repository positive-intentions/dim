//! JSON-lines driver used by the JS differential tests:
//!   stdin:  {"schema": <schema>, "value": <lowered value>}
//!   stdout: {"ok":true,"value":...} | {"ok":false,"path":...,"reason":...}

use dim_contract_core::{json, result_to_value, validate};
use std::io::{BufRead, Write};

fn main() {
    let stdin = std::io::stdin();
    let mut out = std::io::stdout().lock();
    for line in stdin.lock().lines() {
        let Ok(line) = line else { break };
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        if line == "QUIT" {
            break;
        }
        let reply = match json::parse(line) {
            Ok(req) => {
                let schema = req.get("schema").cloned().unwrap_or(json::Value::Null);
                let value = req.get("value").cloned().unwrap_or(json::Value::Null);
                json::stringify(&result_to_value(validate(&schema, &value, "$")))
            }
            Err(e) => format!("{{\"ok\":false,\"path\":\"$\",\"reason\":\"bad request: {e}\"}}"),
        };
        let _ = writeln!(out, "{reply}");
    }
}
