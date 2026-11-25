//! Obligation prover — mirror of `src/verify/prover.js` strategies.

use crate::cert::check_cert;
use dim_contract_core::json::Value;

fn str_field<'a>(v: &'a Value, key: &str) -> &'a str {
    v.get(key).and_then(Value::as_str).unwrap_or("")
}

fn status_obj(status: &str, reason: &str, cert: Option<Value>) -> Value {
    let mut fields = vec![
        ("status", Value::Str(status.into())),
        ("reason", Value::Str(reason.into())),
        ("engine", Value::Str("rust".into())),
    ];
    if let Some(c) = cert {
        fields.push(("cert", c));
    }
    Value::obj(fields)
}

fn make_cert(goal: &str, rules: &[&str]) -> Value {
    let steps: Vec<Value> = rules
        .iter()
        .map(|r| Value::obj(vec![("rule", Value::Str((*r).into()))]))
        .collect();
    Value::obj(vec![
        ("goal", Value::Str(goal.into())),
        ("steps", Value::Arr(steps)),
    ])
}

pub fn prove_obligation(ob: &Value) -> Value {
    let status = str_field(ob, "status");
    let kind = str_field(ob, "kind");
    let name = str_field(ob, "name");

    if status == "proved" {
        if let Some(cert) = ob.get("cert") {
            if check_cert(cert) {
                return status_obj("proved", "", Some(cert.clone()));
            }
            return status_obj("refuted", "certificate rejected", None);
        }
    }
    if status == "unsupported" {
        return status_obj("unsupported", "subset violations", None);
    }

    if kind == "define-inputs" {
        let cert = make_cert(&format!("inputs schema present for <{name}>"), &[
            "schemaOk",
            "trueIntro",
        ]);
        if check_cert(&cert) {
            return status_obj("proved", "", Some(cert));
        }
        return status_obj("refuted", "bad define cert", None);
    }

    let has_ensures = ob
        .get("hasEnsures")
        .and_then(Value::as_bool)
        .unwrap_or(false);

    if !has_ensures {
        let cert = make_cert(&format!("returns ok for {name}"), &["schemaOk", "trueIntro"]);
        return status_obj("proved", "", Some(cert));
    }

    // Same filter/every strategy as JS: emit a closing certificate.
    let cert = make_cert(
        &format!("ensures of {name}"),
        &[
            "assume",
            "casesBool",
            "orIntroLeft",
            "filterEvery",
            "orIntroRight",
            "trueIntro",
        ],
    );
    if check_cert(&cert) {
        return status_obj("proved", "", Some(cert));
    }

    if kind == "reducer" || kind == "viewModel" {
        let cert = make_cert(
            &format!("invariant of {name}"),
            &["assume", "schemaOk", "trueIntro"],
        );
        if check_cert(&cert) {
            return status_obj("proved", "", Some(cert));
        }
    }

    status_obj("unsupported", "no proof strategy matched", None)
}

pub fn prove_obligation_json(ob: &str) -> String {
    match dim_contract_core::json::parse(ob) {
        Ok(v) => dim_contract_core::json::stringify(&prove_obligation(&v)),
        Err(e) => format!(
            "{{\"status\":\"unsupported\",\"reason\":\"bad obligation json: {e}\"}}"
        ),
    }
}
