interface UseDimStoreOptions {
    key: string;
    password: string;
    defaultValue?: string;
}
/**
 * React hook to use Dim's encrypted store
 *
 * @param options - Configuration object
 * @param options.key - The key to store the value under in IndexedDB
 * @param options.password - Required encryption key. There is no default; an
 *   explicit key must be supplied by the caller.
 * @param options.defaultValue - Default value if nothing is stored
 * @returns [value, setValue, isLoading] - Current value, setter function, and loading state
 */
export declare function useDimStore({ key, password, defaultValue, }: UseDimStoreOptions): [string, (newValue: string) => void, boolean];
export {};
//# sourceMappingURL=useDimStore.d.ts.map