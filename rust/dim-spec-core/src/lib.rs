//! DOM-free pure core for Dim: template preparation and security policy.
//! Intended for unit tests, differential testing against the Lean oracle,
//! and (optionally) Aeneas translation into Lean.

pub mod policy;
pub mod prepare;

pub use policy::{
    check_binding_policy, escape_text, is_event_handler_attr, is_url_attr, sanitize_url,
    FORBIDDEN_ATTR_NAMES, FORBIDDEN_PROP_NAMES, URL_ATTR_NAMES,
};
// Re-export part kind constants used by conformance tests (also via prepare).
pub use prepare::{
    prepare, prepare_to_json, process_static_strings, PartInfo, Prepared, ATTR_PART, BOOL_PART,
    CHILD_PART, COMMENT_MARKER, COMMENT_MARKER_DATA, EVENT_PART, PROP_PART, REF_PART, TEXT_MARKER,
};
