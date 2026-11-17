/**
 * Attribute / URL / prop safety policy (DOM-free).
 * Shared shape with rust/dim-spec-core and the Lean oracle.
 */

export const CHILD_PART = 0;
export const ATTR_PART = 1;
export const PROP_PART = 2;
export const EVENT_PART = 3;
export const BOOL_PART = 4;
export const REF_PART = 5;

/** Attribute names that must never receive interpolated values. */
export const FORBIDDEN_ATTR_NAMES = new Set(["srcdoc"]);

/** Property names that must never be bound with `.prop=`. */
export const FORBIDDEN_PROP_NAMES = new Set(["innerHTML", "outerHTML"]);

/** Attributes whose values are treated as URLs. */
export const URL_ATTR_NAMES = new Set([
  "href",
  "src",
  "action",
  "formaction",
  "xlink:href",
  "poster",
  "ping",
]);

const ALLOWED_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Whether an attribute name is an inline event handler (`onclick`, …).
 * @param {string} name
 */
export function isEventHandlerAttr(name) {
  if (!name || name.length < 3) return false;
  const lower = name.toLowerCase();
  return lower.startsWith("on") && /^[a-z]+$/.test(lower.slice(2));
}

/**
 * Validate a binding against the security policy.
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function checkBindingPolicy(kind, name) {
  if (kind === ATTR_PART) {
    const lower = String(name || "").toLowerCase();
    if (isEventHandlerAttr(lower)) {
      return {
        ok: false,
        reason: `Attribute binding "${name}" is forbidden; use @${lower.slice(2)} instead of on* attributes`,
      };
    }
    if (FORBIDDEN_ATTR_NAMES.has(lower)) {
      return {
        ok: false,
        reason: `Attribute binding "${name}" is forbidden`,
      };
    }
  }
  if (kind === PROP_PART) {
    if (FORBIDDEN_PROP_NAMES.has(String(name || ""))) {
      return {
        ok: false,
        reason: `Property binding ".${name}" is forbidden; use text children or unsafeHTML for trusted HTML`,
      };
    }
  }
  return { ok: true };
}

/**
 * Sanitize a URL attribute value. Disallowed schemes become `about:invalid#dim`.
 * Relative URLs and allowlisted schemes pass through. For `src`, `data:image/*` is allowed.
 * @param {string} name attribute name
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeUrl(name, value) {
  if (value == null || value === false) return "";
  const raw = String(value).trim();
  if (!raw) return "";

  const lowerName = String(name || "").toLowerCase();
  const lower = raw.toLowerCase();

  // Protocol-relative
  if (raw.startsWith("//")) {
    return "about:invalid#dim";
  }

  // Absolute with scheme
  const colon = raw.indexOf(":");
  if (colon > 0) {
    const scheme = lower.slice(0, colon + 1);
    if (ALLOWED_SCHEMES.has(scheme)) {
      return raw;
    }
    if (
      lowerName === "src" &&
      scheme === "data:" &&
      /^data:image\/[a-z0-9.+-]+/i.test(raw)
    ) {
      return raw;
    }
    if (scheme === "about:" && lower.startsWith("about:invalid")) {
      return "about:invalid#dim";
    }
    return "about:invalid#dim";
  }

  // Relative / path / hash / query — no scheme
  return raw;
}

/**
 * Whether this attribute name should run through sanitizeUrl on commit.
 * @param {string} name
 */
export function isUrlAttr(name) {
  return URL_ATTR_NAMES.has(String(name || "").toLowerCase());
}

/**
 * Escape text so it is safe as HTML character data (no tags).
 * Used by laws / oracle; browser text nodes already do not parse tags.
 * @param {string} text
 */
export function escapeText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
