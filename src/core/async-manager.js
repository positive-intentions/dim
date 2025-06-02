import StorageManager from "./storage-manager";
import {debouncedDispatcher} from './mini-lit.js';
import CryptoManager from "./crypto-manager.js";

class AsyncronousStateManager {
    constructor(crypto) {
        this.store = {};
        this.loadingSetters = {};
        this.eventListener = [];
        this.crypto = crypto;
        this.db = new StorageManager(crypto);
        this.db.asyncManager = this; // Connect storage manager back to this
    }

    generateListener(listener) {
        const { listenerId, key, value } = listener;

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
                const isInitialLoad = isInitialLoadEvent || event.detail._isInitialLoad;
                
                let finalValue;
                if (isInitialLoad) {
                    // For initial load, the value is already decrypted by storage manager
                    finalValue = event.detail.value;
                } else {
                    // For user updates, decrypt the value
                    const decryptedValue = await this.crypto.decryptData({...event.detail, crypto: this.crypto});
                    finalValue = decryptedValue;
                }
                
                // Update the store
                this.store = {
                    ...this.store,
                    [key]: finalValue,
                };
                
                // Update the component state directly without triggering another event
                const currentState = value[0];
                if (JSON.stringify(currentState) !== JSON.stringify(finalValue)) {
                    // Call the setter with isInternalUpdate flag to prevent loop
                    value[1](finalValue, true);
                }
                
                // Update loading state if we have a setter
                if (this.loadingSetters[key]) {
                    this.loadingSetters[key](false);
                }
            } catch (error) {
                console.error('Failed to process event data:', error);
                // Update loading state on error
                if (this.loadingSetters[key]) {
                    this.loadingSetters[key](false);
                }
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
            // Store reference to original setter for internal use
            if (!newSetter.__originalSetter) {
                newSetter.__originalSetter = value[1];
            }
            
            // If this is an internal update from the event listener, skip processing
            if (isInternalUpdate) {
                newSetter.__originalSetter(newValue);
                return;
            }
            
            const storeToDB = async () => {
                try {
                    // encryptData returns a serialized JSON string
                    const encryptedValue = await this.crypto.encryptData(newValue);
                    await this.db.writeValue(key, encryptedValue);
                } catch (error) {
                    console.error('Failed to encrypt and store value:', error);
                }
            };
            storeToDB();

            const encryptAndDispatch = async (listenerName, newValue) => {
                try {
                    const encryptedValue = await this.crypto.encryptData(newValue);
                    // Parse the encrypted string back to object for dispatch
                    const encryptedObject = JSON.parse(encryptedValue);
                    debouncedDispatcher(listenerName, encryptedObject);
                } catch (error) {
                    console.error('Failed to encrypt for dispatch:', error);
                }
            };
            encryptAndDispatch(listenerName, newValue);
        };

        const newState = this.store[key] || value[0];

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