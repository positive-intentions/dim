import StorageManager from "./storage-manager";
import {debouncedDispatcher} from './mini-lit.js';
import CryptoManager from "./crypto-manager.js";

class AsyncronousStateManager {
    constructor(crypto) {
        this.store = {};
        this.eventListener = [];
        this.db = new StorageManager();
        this.crypto = crypto;
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
        const newListener = async (event) => {
            const decryptedValue = await this.crypto.decryptData({...event.detail, crypto: this.crypto});
            console.log({
                key,
                decryptedValue
            });
            value[1](decryptedValue);

            this.store = {
                ...this.store,
                [key]: decryptedValue,
            };
        };

        window.addEventListener(listenerName, newListener);

        this.eventListener.push({
            listenerId,
            listener: newListener,
        });

        const newSetter = (newValue) => {
            const storeToDB = async ()=> {
                const encryptedValue = await this.crypto.encryptData(newValue);
                console.log({
                    key,
                    encryptedValue
                });
                await this.db.writeValue(key, encryptedValue, this.crypto);
            }
            storeToDB();
            // window.dispatchEvent(
            //     new CustomEvent(listenerName, {
            //         detail: newValue,
            //     })
            // );


            const encryptAndDispatch = async (listenerName, newValue) => {
                const encryptedValue = await this.crypto.encryptData(newValue);
                debouncedDispatcher(listenerName, encryptedValue);
            }
            encryptAndDispatch(listenerName, newValue);
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