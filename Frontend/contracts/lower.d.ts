export function lower(value: any): {
    value: any;
    fns: any[];
    opaques: any[];
};
/**
 * Raise a validated lowered value. `wrap(fn, schema)` is applied to callbacks
 * whose schema is known so their payloads are validated when invoked.
 */
export function raise(schema: any, value: any, ctx: any, wrap: any): any;
//# sourceMappingURL=lower.d.ts.map