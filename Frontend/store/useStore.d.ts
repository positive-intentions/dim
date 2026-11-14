/**
 * Bottom-up reactive store.
 *
 * @param store - schema object of `useState` tuples
 * @param options - optional config. Pass `{ encryptionKey }` (or a string key)
 *   to enable encrypted persistence. Encryption is OFF by default and there is
 *   no hardcoded fallback password.
 */
export declare const useStore: (store: any, options?: {
    encryptionKey?: string;
} | string) => any;
//# sourceMappingURL=useStore.d.ts.map