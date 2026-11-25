/**
 * Contract type DSL. Every constructor returns a plain-data Schema IR node
 * (JSON-serialisable) so the same schema drives the pure-JS validator, the
 * Rust/WASM validator, the Lean reference (`Dim.Spec.Validate`) and the
 * prover in `src/verify`.
 *
 * Node shapes (key `k` is the kind):
 *   any | bool | int{min,max} | num{min,max}
 *   str{min,max,trim,nl,chars} | text{max} | url{attr}
 *   enum{values} | rec{fields:[[name, schema]]} | arr{of,min,max}
 *   opt{of} | nullable{of} | union{of:[...]} | fn{args,ret}
 * Optional on every node: coerce (bool), default (lowered value).
 */
export const MAX_SAFE: 9007199254740991;
export const DEFAULT_STR_MAX: 100000;
export const DEFAULT_ARR_MAX: 100000;
export namespace t {
    export function any(): {
        k: string;
    };
    export function bool(opts: any): any;
    export function int(opts?: {}): any;
    export function num(opts?: {}): any;
    export function string(opts?: {}): any;
    export function id(opts?: {}): any;
    export function text(opts?: {}): any;
    export function url(opts?: {}): any;
    export function _enum(values: any, opts: any): any;
    export { _enum as enum };
    export function lit(value: any, opts: any): any;
    export function record(fields: any, opts: any): any;
    export function array(of: any, opts?: {}): any;
    export function optional(of: any): {
        k: string;
        of: any;
    };
    export function nullable(of: any, opts: any): any;
    export function union(alternatives: any, opts: any): any;
    export function fn(args: any[], ret: any, opts?: {}): any;
    export function _void(): {
        k: string;
    };
    export { _void as void };
}
//# sourceMappingURL=t.d.ts.map