//! JSON-lines driver for differential tests / DimTest dual prover.
//!   stdin:  obligation JSON  OR  {"op":"checkCert","cert":{...}}
//!   stdout: prove/check result JSON

use dim_contract_core::json;
use dim_verify_core::{check_cert_json, prove_json};
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
                let op = req.get("op").and_then(json::Value::as_str).unwrap_or("");
                if op == "checkCert" {
                    let cert = req.get("cert").cloned().unwrap_or(req);
                    check_cert_json(&json::stringify(&cert))
                } else if req.get("kind").is_some() || req.get("status").is_some() {
                    prove_json(line)
                } else if req.get("cert").is_some() {
                    check_cert_json(&json::stringify(req.get("cert").unwrap()))
                } else {
                    prove_json(line)
                }
            }
            Err(e) => format!("{{\"status\":\"unsupported\",\"reason\":\"bad request: {e}\"}}"),
        };
        let _ = writeln!(out, "{reply}");
    }
}
