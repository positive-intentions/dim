export function wrapCallback(fn: any, schema: any): any;
export function validateValue(schema: any, value: any): any;
/**
 * Declare a contracted pure function.
 *   spec: { args: [schema], returns: schema, requires?, ensures?, kind? }
 * `requires` / `ensures` are predicates in the verifiable subset; they are
 * read by the prover from source and never executed here.
 */
export function contract(spec: any, fn: any): {
    (...args: any[]): any;
    contract: any;
    impl: any;
};
/** Verifiable reduce: the prover checks `inv` inductively over `step`. */
export function fold(items: any, init: any, step: any, inv: any): any;
/**
 * Validate component props against `inputs` (a t.record schema). Reads each
 * declared field through `props` (so the case-insensitive proxy still works)
 * and keeps children / childElements untouched.
 */
export function validateProps(inputs: any, props: any): any;
//# sourceMappingURL=contract.d.ts.map