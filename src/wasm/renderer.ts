/**
 * WASM-backed replacement for `src/core/renderer/*`. Template parsing,
 * caching, commit/diffing and focus preservation run in Rust.
 */
import "./load";
import * as wasm from "./generated/pkg/dim_core.js";

export const HTML_RESULT = 1;
export const KEYED_RESULT = 2;
export const UNSAFE_HTML_RESULT = 3;

const dimType = (value) =>
  value != null && typeof value === "object" ? value._$dimType$ : undefined;
export const isTemplateResult = (value) => dimType(value) === HTML_RESULT;
export const isKeyed = (value) => dimType(value) === KEYED_RESULT;
export const isUnsafeHTML = (value) => dimType(value) === UNSAFE_HTML_RESULT;

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

const global = globalThis as any;

export const supportsAdoptingStyleSheets =
  global.ShadowRoot &&
  (global.ShadyCSS === undefined || global.ShadyCSS.nativeShadow) &&
  "adoptedStyleSheets" in Document.prototype &&
  "replace" in CSSStyleSheet.prototype;

const constructionToken = Symbol();
const cssTagCache = new WeakMap();

export class CSSResult {
  cssText: string;
  _strings: any;
  _styleSheet: CSSStyleSheet | undefined;

  constructor(cssText, strings, safeToken) {
    this["_$cssResult$"] = true;
    if (safeToken !== constructionToken) {
      throw new Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead.",
      );
    }
    this.cssText = cssText;
    this._strings = strings;
  }
  get styleSheet() {
    let styleSheet = this._styleSheet;
    const strings = this._strings;
    if (supportsAdoptingStyleSheets && styleSheet === undefined) {
      const cacheable = strings !== undefined && strings.length === 1;
      if (cacheable) {
        styleSheet = cssTagCache.get(strings);
      }
      if (styleSheet === undefined) {
        (this._styleSheet = styleSheet = new CSSStyleSheet()).replaceSync(
          this.cssText,
        );
        if (cacheable) {
          cssTagCache.set(strings, styleSheet);
        }
      }
    }
    return styleSheet;
  }
  toString() {
    return this.cssText;
  }
}

export const unsafeCSS = (value) =>
  new CSSResult(
    typeof value === "string" ? value : String(value),
    undefined,
    constructionToken,
  );

export const css = (strings, ...values) =>
  new CSSResult(wasm.cssText(strings, values), strings, constructionToken);

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const html = (strings, ...values) => wasm.html(strings, values);
export const keyed = (key, result) => wasm.keyed(key, result);
export const unsafeHTML = (value) => wasm.unsafeHTML(value);
export const renderChildren = (children) => wasm.renderChildren(children);

export function render(result, container, options: any = {}) {
  wasm.render(result, container, options.preserveFocus !== false);
}

// ---------------------------------------------------------------------------
// Focus
// ---------------------------------------------------------------------------

export let skipFocusRestore = false;
export function setSkipFocusRestore(value) {
  skipFocusRestore = !!value;
  wasm.setSkipFocusRestore(!!value);
}

export function isFormControl(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
