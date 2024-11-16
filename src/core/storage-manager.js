import {debouncedDispatcher} from './mini-lit.js';

let db;
const databaseName = "DimDatabase";
const objectStoreName = "DimStore";

class StorageManager {
    constructor(crypto) {
        this.openDatabase();
        this.crypto = crypto;
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

    

    async writeValue(id, value, crypto) {
        return new Promise((resolve, reject) => {

            const encryptAndStore = async () => {
                const encryptedValue = await crypto.encryptData(value);
                let transaction = db.transaction([objectStoreName], "readwrite");
                let objectStore = transaction.objectStore(objectStoreName);
    
                let request = objectStore.put({ id: id, value: encryptedValue });
    
                request.onsuccess = function (event) {
                    resolve("Value written successfully");
                };
    
                request.onerror = function (event) {
                    reject("Error writing value: " + event.target.error);
                };
            }
            encryptAndStore().catch(reject);
        });
    }

    async readValue(id, newState, crypto) {
        return new Promise((resolve, reject) => {
            const decryptAndReturn = async () => {
                let transaction = db.transaction([objectStoreName], "readonly");
                let objectStore = transaction.objectStore(objectStoreName);
                let request = objectStore.get(id);
    
                request.onsuccess = async function (event) {
                    if (request.result) {
                        const decryptedValue = await crypto?.decryptData({...request.result.value, crypto});
                        resolve({ value: decryptedValue, newState });
                    } else {
                        resolve(null);
                    }
                };
    
                request.onerror = function (event) {
                    reject("Error reading value: " + event.target.error);
                };
            }
            decryptAndReturn().catch(reject);
        });
    }

    loadFromDatabase = (store) => {
        const traverse = (obj, path) => {
          Object.keys(obj).forEach((key) => {
            if (typeof obj[key] === "object" && obj[key].length === undefined) {
              traverse(obj[key], `${path}${key}.`);
            } else {
              this
                .readValue(`${path}${key}`, obj[key], this.crypto)
                .then((response) => {
                    if (response) {
                        // throw new Error("Value not found in database");
                        console.log({
                            key: `${path}${key}`,
                            value: response.value       
                        })

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