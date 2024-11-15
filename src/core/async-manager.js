let db;
const databaseName = "DimDatabase";
const objectStoreName = "DimStore";

class AsyncronousStateManager {
    constructor() {
        this.store = {};
        this.eventListener = []; this.openDatabase().catch(console.error);
    }

    async openDatabase() {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(databaseName, 1);

            request.onupgradeneeded = function (event) {
                db = event.target.result;
                if (!db.objectStoreNames.contains(objectStoreName)) {
                    db.createObjectStore(objectStoreName, { keyPath: "id" });
                }
            };

            request.onsuccess = function (event) {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = function (event) {
                reject("Error opening database: " + event.target.error);
            };
        });
    }

    async writeValue(id, value) {
        return new Promise((resolve, reject) => {
            let transaction = db.transaction([objectStoreName], "readwrite");
            let objectStore = transaction.objectStore(objectStoreName);
            let request = objectStore.put({ id: id, value: value });

            request.onsuccess = function (event) {
                resolve("Value written successfully");
            };

            request.onerror = function (event) {
                reject("Error writing value: " + event.target.error);
            };
        });
    }

    async readValue(id, newState) {
        return new Promise((resolve, reject) => {
            let transaction = db.transaction([objectStoreName], "readonly");
            let objectStore = transaction.objectStore(objectStoreName);
            let request = objectStore.get(id);

            request.onsuccess = function (event) {
                if (request.result) {
                    resolve({ value: request.result.value, newState });
                } else {
                    resolve(null);
                }
            };

            request.onerror = function (event) {
                reject("Error reading value: " + event.target.error);
            };
        });
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
            this.writeValue(key, newValue).catch(console.error);
            window.dispatchEvent(
                new CustomEvent(listenerName, {
                    detail: newValue,
                })
            );
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
}


export default AsyncronousStateManager;