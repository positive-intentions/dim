/**
 * `<foo-bar ... />` → `<foo-bar ...></foo-bar>` (custom elements only).
 * @param {string} input
 */
export function expandSelfClosing(input: string): string;
/**
 * @param {string[]} strings
 * @param {(body: string) => string|null|undefined} normalizeJson
 *   receives `{body}` and returns canonical JSON or null/undefined on failure
 * @returns {string[]|null} new strings, or null when unchanged
 */
export function processStaticStrings(strings: string[], normalizeJson: (body: string) => string | null | undefined): string[] | null;
/**
 * React-like preprocess for static template strings (DOM-free).
 */
export function isCustomTagChar(c: any): boolean;
//# sourceMappingURL=static-strings.d.ts.map