//! Re-export of the DOM-free pure core (`dim-spec-core`), plus a thin
//! wasm-friendly warning hook for JSON attribute rewrite failures.

pub use dim_spec_core::prepare::{
    prepare as prepare_result, process_static_strings as process_static_strings_inner, PartInfo,
    Prepared, ATTR_PART, BOOL_PART, CHILD_PART, COMMENT_MARKER, COMMENT_MARKER_DATA, EVENT_PART,
    PROP_PART, REF_PART, TEXT_MARKER,
};
pub use dim_spec_core::policy::{
    check_binding_policy, is_url_attr, sanitize_url,
};

/// Turn template strings into marker HTML plus part info.
/// Panics are avoided: policy errors are returned to the WASM adapter as `Err`.
pub fn prepare(strings: &[String]) -> Result<Prepared, String> {
    dim_spec_core::prepare(strings)
}

/// React-like preprocess. On WASM, JSON parse failures are logged to the console.
pub fn process_static_strings(
    strings: &[String],
    normalize_json: impl Fn(&str) -> Option<String>,
) -> Option<Vec<String>> {
    // Wrap so we can warn on failure when the caller returns None — the inner
    // already calls a no-op warn. Dim-core layers console warn for WASM.
    let result = process_static_strings_inner(strings, |body| {
        let out = normalize_json(body);
        if out.is_none() {
            web_warn_json(body.trim_start_matches('{').trim_end_matches('}'));
        }
        out
    });
    result
}

#[cfg(target_arch = "wasm32")]
fn web_warn_json(body: &str) {
    web_sys::console::warn_2(
        &"Failed to parse object attribute as JSON (use .props for functions/non-JSON values):"
            .into(),
        &body.into(),
    );
}

#[cfg(not(target_arch = "wasm32"))]
fn web_warn_json(_body: &str) {}
