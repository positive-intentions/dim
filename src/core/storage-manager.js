import { debouncedDispatcher } from './mini-lit.js';

let db;
const databaseName = "DimDatabase";
const objectStoreName = "DimStore";

class StorageManager {
    constructor(crypto) {
        this.crypto = crypto;
        this.asyncManager = null; // Will be set by async manager
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
        // Wait for database to be ready
        if (!db) {
            await this.openDatabase();
        }
        
        return new Promise((resolve, reject) => {
            if (!db) {
                reject("Database not available");
                return;
            }
            
            let transaction = db.transaction([objectStoreName], "readwrite");
            let objectStore = transaction.objectStore(objectStoreName);

            // Value is already encrypted by async-manager (as a JSON string), store it directly
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
        // Wait for database to be ready
        if (!db) {
            await this.openDatabase();
        }
        
        return new Promise((resolve, reject) => {
            if (!db) {
                resolve(null);
                return;
            }
            
            let transaction = db.transaction([objectStoreName], "readonly");
            let objectStore = transaction.objectStore(objectStoreName);
            let request = objectStore.get(id);

            request.onsuccess = async (event) => {
                if (request.result) {
                    try {
                        const storedValue = request.result.value;
                        
                        // Check if it's an encrypted value (string that parses to object with encryptedData and iv)
                        if (this.crypto && typeof storedValue === 'string') {
                            try {
                                const parsed = JSON.parse(storedValue);
                                if (parsed.encryptedData && parsed.iv) {
                                    // It's encrypted, decrypt it
                                    try {
                                        const decryptedValue = await this.crypto.decryptData(storedValue);
                                        
                                        // Validate that we got a decrypted value, not the encrypted structure
                                        if (decryptedValue && typeof decryptedValue === 'object' && 
                                            decryptedValue.encryptedData && decryptedValue.iv) {
                                            // This shouldn't happen - decryption returned encrypted structure
                                            reject(new Error('Decryption failed: Incorrect password - returned encrypted payload structure'));
                                            return;
                                        }
                                        
                                        resolve({ value: decryptedValue, newState });
                                        return;
                                    } catch (decryptError) {
                                        // Check if this is a password mismatch error
                                        const errorMessage = decryptError.message || String(decryptError);
                                        if (errorMessage.includes('Incorrect password') || 
                                            errorMessage.includes('Decryption failed')) {
                                            // Password is wrong - reject instead of returning null
                                            reject(new Error('Decryption failed: Incorrect password'));
                                            return;
                                        }
                                        // Other decryption errors - still reject
                                        reject(decryptError);
                                        return;
                                    }
                                }
                            } catch (parseError) {
                                // Not encrypted JSON, treat as plain value
                            }
                        }
                        
                        // Fallback for non-encrypted data
                        resolve({ value: storedValue, newState });
                    } catch (error) {
                        console.error('Failed to decrypt stored value:', error);
                        // Only resolve with null if it's not a password error
                        const errorMessage = error.message || String(error);
                        if (errorMessage.includes('Incorrect password') || 
                            errorMessage.includes('Decryption failed')) {
                            reject(error);
                        } else {
                            resolve(null);
                        }
                    }
                } else {
                    resolve(null);
                }
            };

            request.onerror = function (event) {
                reject("Error reading value: " + event.target.error);
            };
        });
    }

    loadFromDatabase = (store, listenerId) => {
        const traverse = (obj, path) => {
            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === "object" && obj[key].length === undefined) {
                    traverse(obj[key], `${path}${key}.`);
                } else {
                    this
                        .readValue(`${path}${key}`, obj[key])
                        .then(async (response) => {
                            if (response) {
                                try {
                                    
                                    // For initial load, dispatch a component-specific event
                                    // Use a unique event name that includes the listenerId
                                    debouncedDispatcher(`${path}${key}-initialLoad-${listenerId}`, {
                                        value: response.value,
                                        _isInitialLoad: true
                                    });
                                } catch (error) {
                                    console.error('Failed to encrypt for dispatch:', error);
                                }
                            } else {
                                // No value in DB, set loading to false
                                if (this.asyncManager?.loadingSetters[`${path}${key}`]) {
                                    this.asyncManager.loadingSetters[`${path}${key}`](false);
                                }
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                            // Set loading to false on error
                            if (this.asyncManager?.loadingSetters[`${path}${key}`]) {
                                this.asyncManager.loadingSetters[`${path}${key}`](false);
                            }
                        });
                }
            });
        };

        traverse(store, "");
    };
}

export default StorageManager;