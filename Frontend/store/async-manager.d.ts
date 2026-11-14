export default AsyncronousStateManager;
declare class AsyncronousStateManager {
    constructor(crypto?: any);
    store: {};
    loadingSetters: {};
    savingSetters: {};
    eventListener: any[];
    writeGen: {};
    persistedGen: {};
    persistTimers: {};
    crypto: any;
    db: StorageManager;
    /**
     * Notify every loading subscriber for `key` (or a legacy single function).
     */
    clearLoading(key: any): void;
    /**
     * Notify every saving subscriber for `key`.
     */
    setSaving(key: any, isSaving: any): void;
    /**
     * Register (or replace) a loading setter for a subscriber id on `key`.
     */
    addLoadingSetter(key: any, id: any, setIsLoading: any): void;
    /**
     * Register (or replace) a saving setter for a subscriber id on `key`.
     */
    addSavingSetter(key: any, id: any, setIsSaving: any): void;
    /**
     * Drop loading setters registered under `listenerId`.
     */
    removeLoadingSetters(listenerId: any): void;
    /**
     * Drop saving setters registered under `listenerId`.
     */
    removeSavingSetters(listenerId: any): void;
    /**
     * Persist the latest value for `key` (encrypt once, write DB, broadcast).
     */
    flushPersist(key: any, eventName: any): Promise<void>;
    schedulePersist(key: any, eventName: any): void;
    generateListener(listener: any): any[];
    removeListeners(listenerId: any): void;
    createListeners: (store: any, listenerId: any) => void;
}
export const PERSIST_DEBOUNCE_MS: 300;
import StorageManager from "./storage-manager";
//# sourceMappingURL=async-manager.d.ts.map