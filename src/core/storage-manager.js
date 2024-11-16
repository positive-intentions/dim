let db;
const databaseName = "DimDatabase";
const objectStoreName = "DimStore";

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

class StorageManager {
    constructor() {
        this.openDatabase();
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

    loadFromDatabase = (store) => {
        const traverse = (obj, path) => {
          Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "object" && obj[key].length === undefined) {
              traverse(obj[key], `${path}${key}.`);
            } else {
              this
                .readValue(`${path}${key}`, obj[key])
                .then((response) => {
                    if (response) {
                        // throw new Error("Value not found in database");
                        debouncedDispatcher(`${path}${key}`, response.value);
                    }
                })
                .catch(console.error);
            }
          });
        };
      
        traverse(store, "");
      };
}

export default StorageManager;