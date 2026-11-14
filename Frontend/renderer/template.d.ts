export function isTemplateResult(value: any): boolean;
export function isKeyed(value: any): boolean;
export function isUnsafeHTML(value: any): boolean;
/**
 * Force fresh DOM when key changes (view transitions).
 */
export function keyed(key: any, result: any): {
    _$dimType$: 2;
    key: any;
    result: any;
};
/**
 * Render a string as HTML (trusted content only).
 */
export function unsafeHTML(value: any): {
    _$dimType$: 3;
    value: any;
};
/**
 * Template result types and the public `html` tagged template.
 * Parts-based: updates values in place so focus, selection, and child
 * custom-element state survive re-renders.
 */
/** @type {1} TemplateResult */
export const HTML_RESULT: 1;
/** @type {2} Keyed wrapper */
export const KEYED_RESULT: 2;
/** @type {3} Unsafe HTML */
export const UNSAFE_HTML_RESULT: 3;
export function html(strings: any, ...values: any[]): {
    _$dimType$: 1;
    strings: any;
    values: any[];
};
export function renderChildren(children: any): {
    _$dimType$: 1;
    strings: any;
    values: any[];
};
//# sourceMappingURL=template.d.ts.map