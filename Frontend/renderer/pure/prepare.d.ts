/**
 * @param {string} stringBefore
 */
export function getBindingKind(stringBefore: string): {
    kind: number;
    name: string;
    quote: string;
    matchLength: number;
    valuePrefix?: undefined;
    valueSuffix?: undefined;
    partial?: undefined;
} | {
    kind: number;
    name: string;
    quote: string;
    matchLength: number;
    valuePrefix: string;
    valueSuffix: string;
    partial?: undefined;
} | {
    kind: number;
    name?: undefined;
    quote?: undefined;
    matchLength?: undefined;
    valuePrefix?: undefined;
    valueSuffix?: undefined;
    partial?: undefined;
} | {
    kind: number;
    name: string;
    quote: string;
    matchLength: number;
    valuePrefix: string;
    valueSuffix: string;
    partial: boolean;
};
/**
 * @param {string} htmlSoFar
 */
export function isInsideRawText(htmlSoFar: string): boolean;
/**
 * Pure prepare: strings → { html, parts }. Throws on policy violations.
 * @param {string[]|ArrayLike<string>} strings
 * @returns {{ html: string, parts: object[] }}
 */
export function prepare(strings: string[] | ArrayLike<string>): {
    html: string;
    parts: object[];
};
/**
 * JSON-serializable prepare result for the Lean oracle / differential tests.
 * @param {string[]} strings
 */
export function prepareToJson(strings: string[]): {
    html: string;
    parts: {
        kind: any;
        name: any;
        valuePrefix: any;
        valueSuffix: any;
        rawText: boolean;
    }[];
};
export const COMMENT_MARKER: "<!--{{dim}}-->";
export const TEXT_MARKER: "\uFFF0dim\uFFF1";
import { CHILD_PART } from "./policy.js";
import { ATTR_PART } from "./policy.js";
import { PROP_PART } from "./policy.js";
import { EVENT_PART } from "./policy.js";
import { BOOL_PART } from "./policy.js";
import { REF_PART } from "./policy.js";
export { CHILD_PART, ATTR_PART, PROP_PART, EVENT_PART, BOOL_PART, REF_PART };
//# sourceMappingURL=prepare.d.ts.map