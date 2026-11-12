import StorageManager from "./storage-manager";
import { debouncedDispatcher } from "./events.js";

class AsyncronousStateManager {
    constructor(crypto = null) {
        this.store = {};
        // Per-key list of { id, setIsLoading }. Legacy tests may assign a
        // single function; clearLoading() accepts both shapes.
        this.loadingSetters = {};
        this.eventListener = [];
        this.crypto = crypto;
        this.db = new StorageManager(crypto);
        this.db.asyncManager = this; // Connect storage manager back to this
    }

    /**
     * Notify every loading subscriber for `key` (or a legacy single function).
     */
    clearLoading(key) {
        const entry = this.loadingSetters?.[key];
        if (!entry) return;
        if (typeof entry === "function") {
            entry(false);
            return;
        }
        if (Array.isArray(entry)) {
            entry.forEach((item) => {
                const setter =
                    typeof item === "function" ? item : item?.setIsLoading;
                if (typeof setter === "function") setter(false);
            });
        }
    }

    /**
     * Register (or replace) a loading setter for a subscriber id on `key`.
     */
    addLoadingSetter(key, id, setIsLoading) {
        this.loadingSetters = this.loadingSetters || {};
        const existing = this.loadingSetters[key];
        if (typeof existing === "function") {
            // Promote legacy single-function shape to a list.
            this.loadingSetters[key] = [
                { id: "__legacy", setIsLoading: existing },
            ];
        } else if (!Array.isArray(this.loadingSetters[key])) {
            this.loadingSetters[key] = [];
        }
        this.loadingSetters[key] = this.loadingSetters[key].filter(
            (item) => item?.id !== id
        );
        this.loadingSetters[key].push({ id, setIsLoading });
    }

    /**
     * Drop loading setters registered under `listenerId`.
     */
    removeLoadingSetters(listenerId) {
        if (!this.loadingSetters) return;
        Object.keys(this.loadingSetters).forEach((key) => {
            const entry = this.loadingSetters[key];
            if (!Array.isArray(entry)) return;
            this.loadingSetters[key] = entry.filter(
                (item) => item?.id !== listenerId
            );
            if (this.loadingSetters[key].length === 0) {
                delete this.loadingSetters[key];
            }
        });
    }

    generateListener(listener) {
        const { listenerId, key, value } = listener;

        // Capture the real useState setter BEFORE we wrap the slot.
        // (value may already be a length-4 [value, set, loading, setLoading].)
        const originalSetter = value[1];

        // Remove existing event listeners if they exist
        const existingListeners = this.eventListener.filter(
            (listener) => listener.listenerId === listenerId && listener.key === key
        );

        existingListeners.forEach(existingListener => {
            window.removeEventListener(existingListener.eventName, existingListener.listener);
        });

        this.eventListener = this.eventListener.filter(
            (listener) => !(listener.listenerId === listenerId && listener.key === key)
        );

        // Create listeners for both regular updates and initial loads
        const listenerName = `${key}`;
        const initialLoadListenerName = `${key}-initialLoad-${listenerId}`;

        // Shared listener logic
        const createListener = (isInitialLoadEvent) => async (event) => {
            try {
                // Check if this is an initial load event (has _isInitialLoad flag)
                const isInitialLoad = isInitialLoadEvent || event.detail?._isInitialLoad;
                
                let finalValue;
                if (isInitialLoad) {
                    // For initial load, the value is already decrypted by storage manager
                    finalValue = event.detail.value;
                } else if (this.crypto) {
                    // For user updates, decrypt the value
                    finalValue = await this.crypto.decryptData({...event.detail, crypto: this.crypto});
                } else {
                    // No encryption: the dispatched detail is the plaintext value
                    finalValue = event.detail;
                }
                
                // Update the store
                this.store = {
                    ...this.store,
                    [key]: finalValue,
                };
                
                // Update the component state directly without triggering another event
                const currentState = value[0];
                if (JSON.stringify(currentState) !== JSON.stringify(finalValue)) {
                    originalSetter(finalValue);
                }
                
                this.clearLoading(key);
            } catch (error) {
                console.error('Failed to process event data:', error);
                this.clearLoading(key);
            }
        };

        // Create regular listener for global updates
        const regularListener = createListener(false);
        window.addEventListener(listenerName, regularListener);

        this.eventListener.push({
            listenerId,
            key,
            eventName: listenerName,
            listener: regularListener,
        });

        // Create initial load listener specific to this component
        const initialLoadListener = createListener(true);
        window.addEventListener(initialLoadListenerName, initialLoadListener);

        this.eventListener.push({
            listenerId,
            key,
            eventName: initialLoadListenerName,
            listener: initialLoadListener,
        });

        const newSetter = (newValue, isInternalUpdate = false) => {
            // Internal updates from our own event listener: only touch local state.
            if (isInternalUpdate) {
                originalSetter(newValue);
                return;
            }

            // Keep the manager cache in sync before re-render. Otherwise the next
            // generateListener() overwrites value[0] with a stale this.store[key]
            // (truthy empty/restored arrays beat the fresh useState value via ||).
            this.store = {
                ...this.store,
                [key]: newValue,
            };

            // User updates: update UI immediately, then persist + broadcast.
            originalSetter(newValue);

            const storeToDB = async () => {
                try {
                    // When encryption is enabled, persist the serialized ciphertext;
                    // otherwise persist the plaintext value directly.
                    const valueToStore = this.crypto
                        ? await this.crypto.encryptData(newValue)
                        : newValue;
                    await this.db.writeValue(key, valueToStore);
                } catch (error) {
                    console.error('Failed to store value:', error);
                }
            };
            storeToDB();

            const dispatchUpdate = async (eventName, value) => {
                try {
                    if (this.crypto) {
                        const encryptedValue = await this.crypto.encryptData(value);
                        // Parse the encrypted string back to object for dispatch
                        const encryptedObject = JSON.parse(encryptedValue);
                        debouncedDispatcher(eventName, encryptedObject);
                    } else {
                        // No encryption: dispatch the plaintext value directly
                        debouncedDispatcher(eventName, value);
                    }
                } catch (error) {
                    console.error('Failed to dispatch update:', error);
                }
            };
            dispatchUpdate(listenerName, newValue);
        };

        // Prefer cache when present — including empty arrays (do not use ||).
        const newState =
            this.store[key] !== undefined ? this.store[key] : value[0];

        return [newState, newSetter];
    }

    removeListeners(listenerId) {
        const existingListeners = this.eventListener.filter(
            (listener) => listener.listenerId === listenerId
        );

        existingListeners.forEach(existingListener => {
            window.removeEventListener(
                existingListener.eventName,
                existingListener.listener
            );
        });

        this.eventListener = this.eventListener.filter(
            (listener) => listener.listenerId !== listenerId
        );

        this.removeLoadingSetters(listenerId);
    }

    createListeners = (store, listenerId) => {
        const traverse = (obj, path) => {
          Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "object" && obj[key].length === undefined) {
              traverse(obj[key], `${path}${key}.`);
            } else {
              const fullKey = `${path}${key}`;
              
              const [asyncState, asyncSetState] =
                this.generateListener({
                  listenerId,
                  key: fullKey,
                  value: obj[key]
                });
      
              // Preserve the loading state info (indices 2 and 3)
              obj[key][0] = asyncState;
              obj[key][1] = asyncSetState;
            }
          });
        };
      
        traverse(store, "");
      };
}


export default AsyncronousStateManager;
