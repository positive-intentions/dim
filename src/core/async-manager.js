import StorageManager from "./storage-manager";

function createDebouncedEventDispatcher(
    delay
  ) {
    const timeoutIds = {};
  
    return (eventName, value) => {
      if (timeoutIds[eventName] !== undefined) {
        clearTimeout(timeoutIds[eventName]);
      }
  
      timeoutIds[eventName] = window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: value,
          })
        );
        timeoutIds[eventName] = undefined;
      }, delay);
    };
  }
  
  const debouncedDispatcher = createDebouncedEventDispatcher(10);

class AsyncronousStateManager {
    constructor() {
        this.store = {};
        this.eventListener = [];
        this.db = new StorageManager();
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
            value[1](event.detail);

            this.store = {
                ...this.store,
                [key]: event.detail,
            };
        };

        window.addEventListener(listenerName, newListener);

        this.eventListener.push({
            listenerId,
            listener: newListener,
        });

        const newSetter = (newValue) => {
            this.db.writeValue(key, newValue).catch(console.error);
            // window.dispatchEvent(
            //     new CustomEvent(listenerName, {
            //         detail: newValue,
            //     })
            // );

            debouncedDispatcher(listenerName, newValue);
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