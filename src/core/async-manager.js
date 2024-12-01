import CryptoManager from "./crypto-manager";
import { debouncedDispatcher } from './mini-lit.js';
import StorageManager from "./storage-manager";



const debouncedDispatcherHandler = (listenerName, newValue, cryptoManager, db) => debouncedDispatcher(listenerName, () => {
    const handleAsyncDispatch = async (newValue) => {
        const encryptedValue = await cryptoManager.encryptData(newValue);
        console.log("encryptedValue", encryptedValue);
        db.writeValue(listenerName, encryptedValue).catch(console.error);
        window.dispatchEvent(
            new CustomEvent(listenerName, {
                detail: encryptedValue,
            })
        );
    };
    handleAsyncDispatch(newValue);
})



class AsyncronousStateManager {
    constructor() {
        this.store = {};
        this.eventListener = [];
        this.db = new StorageManager();

        const password = "password";
        this.cryptoManager = new CryptoManager(password);
    }

    generateListener(listener) {
        const { listenerId, key, value } = listener;

        // Remove existing event listeners if they exist
        const existingListender = this.eventListener.find(
            (listener) => listener.listenerId === listenerId
        );

        const listenerName = `${key}`;

        if (existingListender) {
            window.removeEventListener(listenerName, existingListender.listener);

            this.eventListener = this.eventListener.filter(
                (listener) => listener.listenerId !== listenerId
            );
        }

        // Create a new event listener
        const newListener = (event) => {
            const updateState = async (eventValue) => {
                const decryptedValue = await this.cryptoManager.decryptData(eventValue);
                console.log("decryptedValue", decryptedValue);

                value[1](decryptedValue);

                this.store = {
                    ...this.store,
                    [key]: decryptedValue,
                };
            };
            updateState(event.detail);

            debouncedDispatcherHandler
        };

        window.addEventListener(listenerName, newListener);

        this.eventListener.push({
            listenerId,
            listener: newListener,
        });

        const newSetter = (newValue) => {
            debouncedDispatcherHandler(listenerName, newValue, this.cryptoManager, this.db);
        };

        const newState = this.store[key] || value[0];

        return [newState, newSetter];
    }

    removeListeners(listenerId) {
        const existingListender = this.eventListener.find(
            (listener) => listener.listenerId === listenerId
        );

        if (existingListender) {
            window.removeEventListener(
                `${existingListender.key}`,
                existingListender.listener
            );

            this.eventListener = this.eventListener.filter(
                (listener) => listener.listenerId !== listenerId
            );
        }
    }

    createListeners = (store, listenerId) => {
        const traverse = (obj, path) => {
            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === "object" && obj[key].length === undefined) {
                    traverse(obj[key], `${path}${key}.`);
                } else {
                    const [asyncState, asyncSetState] =
                        this.generateListener({
                            listenerId,
                            key: `${path}${key}`,
                            value: obj[key],
                        });

                    obj[key] = [asyncState, asyncSetState].concat(obj[key]);
                }
            });
        };

        traverse(store, "");
    };
}


export default AsyncronousStateManager;