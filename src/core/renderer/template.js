/**
 * Template result types and the public `html` tagged template.
 * Parts-based: updates values in place so focus, selection, and child
 * custom-element state survive re-renders.
 */

import { processStaticStrings } from "./pure/static-strings.js";

/** @type {1} TemplateResult */
export const HTML_RESULT = 1;
/** @type {2} Keyed wrapper */
export const KEYED_RESULT = 2;
/** @type {3} Unsafe HTML */
export const UNSAFE_HTML_RESULT = 3;

export function isTemplateResult(value) {
  return (
    value != null &&
    typeof value === "object" &&
    value._$dimType$ === HTML_RESULT
  );
}

export function isKeyed(value) {
  return (
    value != null &&
    typeof value === "object" &&
    value._$dimType$ === KEYED_RESULT
  );
}

export function isUnsafeHTML(value) {
  return (
    value != null &&
    typeof value === "object" &&
    value._$dimType$ === UNSAFE_HTML_RESULT
  );
}

const processedStringsCache = new WeakMap();

function normalizeJsonObjectLiteral(bodyWithBraces) {
  try {
    const objValue = JSON.parse(bodyWithBraces);
    return JSON.stringify(objValue);
  } catch {
    console.warn(
      "Failed to parse object attribute as JSON (use .props for functions/non-JSON values):",
      bodyWithBraces,
    );
    return null;
  }
}

function processCached(strings) {
  const processed = processStaticStrings(strings, normalizeJsonObjectLiteral);
  if (!processed) return strings;
  processed.raw = [...processed];
  return processed;
}

/**
 * Enhanced html tagged template — Dim's public template API.
 * Requires a real template-strings array (with `.raw`).
 */
export const html = (strings, ...values) => {
  if (
    !strings ||
    typeof strings !== "object" ||
    !Array.isArray(strings.raw) ||
    !Array.isArray(strings)
  ) {
    throw new Error(
      "html`...` requires a template literal (TemplateStringsArray with .raw). " +
        "Do not call html() with a plain string or crafted array.",
    );
  }

  let processedStrings = processedStringsCache.get(strings);
  if (!processedStrings) {
    processedStrings = processCached(strings);
    processedStringsCache.set(strings, processedStrings);
  }

  return {
    _$dimType$: HTML_RESULT,
    strings: processedStrings,
    values,
  };
};

/**
 * Force fresh DOM when key changes (view transitions).
 */
export function keyed(key, result) {
  return { _$dimType$: KEYED_RESULT, key, result };
}

/**
 * Render a string as HTML (trusted content only).
 * When Trusted Types is enforced, pass a TrustedHTML value or a string that
 * the installed `dim` policy will create.
 */
export function unsafeHTML(value) {
  return { _$dimType$: UNSAFE_HTML_RESULT, value };
}

/**
 * Helper to render children content into a template.
 * Strings are text (escaped by the browser text node). Raw HTML requires
 * an explicit `unsafeHTML(...)` wrapper.
 */
export const renderChildren = (children) => {
  if (!children) return html``;

  if (typeof children === "string") {
    return html`${children}`;
  }

  if (Array.isArray(children)) {
    return html`<slot></slot>`;
  }

  return html`<slot></slot>`;
};
