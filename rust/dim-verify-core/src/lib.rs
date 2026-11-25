//! Prover + certificate checker for Dim contracts.
//! Mirrors `src/verify/{cert,prover,ir}.js`.

pub mod cert;
pub mod prove;

pub use cert::{check_cert, check_cert_json, well_formed};
pub use prove::{prove_obligation, prove_obligation_json};

/// JSON-lines / WASM boundary: prove one obligation object.
pub fn prove_json(obligation: &str) -> String {
    prove_obligation_json(obligation)
}

#[cfg(target_arch = "wasm32")]
mod wasm_api {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen(js_name = proveJson)]
    pub fn prove_json(obligation: &str) -> String {
        crate::prove_json(obligation)
    }

    #[wasm_bindgen(js_name = checkCertJson)]
    pub fn check_cert_json(cert: &str) -> String {
        crate::check_cert_json(cert)
    }
}
