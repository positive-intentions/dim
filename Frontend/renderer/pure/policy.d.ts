/**
 * Whether an attribute name is an inline event handler (`onclick`, …).
 * @param {string} name
 */
export function isEventHandlerAttr(name: string): boolean;
/**
 * Validate a binding against the security policy.
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function checkBindingPolicy(kind: any, name: any): {
    ok: true;
} | {
    ok: false;
    reason: string;
};
/**
 * Sanitize a URL attribute value. Disallowed schemes become `about:invalid#dim`.
 * Relative URLs and allowlisted schemes pass through. For `src`, `data:image/*` is allowed.
 * @param {string} name attribute name
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeUrl(name: string, value: unknown): string;
/**
 * Whether this attribute name should run through sanitizeUrl on commit.
 * @param {string} name
 */
export function isUrlAttr(name: string): boolean;
/**
 * Escape text so it is safe as HTML character data (no tags).
 * Used by laws / oracle; browser text nodes already do not parse tags.
 * @param {string} text
 */
export function escapeText(text: string): string;
/**
 * Attribute / URL / prop safety policy (DOM-free).
 * Shared shape with rust/dim-spec-core and the Lean oracle.
 */
export const CHILD_PART: 0;
export const ATTR_PART: 1;
export const PROP_PART: 2;
export const EVENT_PART: 3;
export const BOOL_PART: 4;
export const REF_PART: 5;
/** Attribute names that must never receive interpolated values. */
export const FORBIDDEN_ATTR_NAMES: Set<string>;
/** Property names that must never be bound with `.prop=`. */
export const FORBIDDEN_PROP_NAMES: Set<string>;
/** Attributes whose values are treated as URLs. */
export const URL_ATTR_NAMES: Set<string>;
//# sourceMappingURL=policy.d.ts.map