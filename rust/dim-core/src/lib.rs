//! Dim runtime core compiled to WebAssembly.
//!
//! This crate is loaded by `src/wasm/index.ts`, which exposes the exact public
//! API of `@positive-intentions/dim` so existing components run unchanged.

pub mod template;

#[cfg(target_arch = "wasm32")]
pub mod css;
#[cfg(target_arch = "wasm32")]
pub mod dom;
#[cfg(target_arch = "wasm32")]
pub mod host;
#[cfg(target_arch = "wasm32")]
pub mod js;
