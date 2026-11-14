import { useState, useRef, useEffect } from 'react';

// src/core/store/useDimStore.ts

// src/core/store/crypto-manager.js
var DEFAULT_ITERATIONS = 1e6;
var CryptoManager = class {
  constructor(password, options = {}) {
    this.password = password;
    this.iterations = options.iterations || DEFAULT_ITERATIONS;
    this._keyCache = /* @__PURE__ */ new Map();
    this.key = null;
    this.keyPromise = this.generateKey(password).then((key) => {
      this.key = key;
      return key;
    });
  }
  arrayBufferToString(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binaryString = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binaryString);
  }
  stringToArrayBuffer(str) {
    const binaryString = atob(str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  // Derive the deterministic fallback salt for a password (legacy behaviour).
  // Only used when no explicit salt is supplied. Real encryption always uses
  // a random per-record salt embedded in the payload.
  async _fallbackSalt(password) {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(password)
    );
    return new Uint8Array(hash);
  }
  /**
   * Derive an AES-GCM key from a password and salt using PBKDF2.
   * @param {string} password
   * @param {Uint8Array|ArrayBuffer} [salt] - random salt; falls back to a
   *   deterministic salt derived from the password when omitted.
   * @returns {Promise<CryptoKey>}
   */
  async getKeyFromPassword(password, salt) {
    const encoder = new TextEncoder();
    let saltBytes;
    if (salt === void 0 || salt === null) {
      saltBytes = await this._fallbackSalt(password);
    } else {
      saltBytes = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
    }
    const cacheKey = `${password}::${this.arrayBufferToString(saltBytes)}`;
    if (this._keyCache.has(cacheKey)) {
      return this._keyCache.get(cacheKey);
    }
    const keyPromise = (async () => {
      const passwordKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      return crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltBytes,
          iterations: this.iterations,
          hash: "SHA-256"
        },
        passwordKey,
        {
          name: "AES-GCM",
          length: 256
        },
        true,
        ["encrypt", "decrypt"]
      );
    })();
    this._keyCache.set(cacheKey, keyPromise);
    return keyPromise;
  }
  // Legacy wrapper retained for backwards compatibility.
  async generateKey(password) {
    const key = await this.getKeyFromPassword(password);
    this.key = key;
    return key;
  }
  async encryptData(data) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.getKeyFromPassword(this.password, salt);
    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      enc.encode(dataString)
    );
    return JSON.stringify({
      encryptedData: this.arrayBufferToString(encryptedData),
      iv: this.arrayBufferToString(iv),
      salt: this.arrayBufferToString(salt)
    });
  }
  async decryptData(encryptedPayload) {
    let payload;
    if (typeof encryptedPayload === "string") {
      try {
        payload = JSON.parse(encryptedPayload);
      } catch {
        throw new Error("Invalid encrypted payload format");
      }
    } else {
      payload = encryptedPayload;
    }
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid encrypted payload format");
    }
    const { encryptedData, iv, salt } = payload;
    if (!encryptedData || !iv) {
      throw new Error("Invalid encrypted payload: missing encryptedData or iv");
    }
    if (typeof encryptedData === "object" || typeof iv === "object") {
      throw new Error(
        "Invalid encrypted payload: encryptedData and iv must be strings"
      );
    }
    const saltBytes = salt ? new Uint8Array(this.stringToArrayBuffer(salt)) : void 0;
    const key = await this.getKeyFromPassword(this.password, saltBytes);
    try {
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: this.stringToArrayBuffer(iv)
        },
        key,
        this.stringToArrayBuffer(encryptedData)
      );
      const dec = new TextDecoder();
      const decryptedString = dec.decode(decryptedData);
      try {
        const parsed = JSON.parse(decryptedString);
        if (parsed && typeof parsed === "object" && parsed.encryptedData && parsed.iv) {
          throw new Error(
            "Decryption returned encrypted payload structure - possible password mismatch or corruption"
          );
        }
        return parsed;
      } catch (parseError) {
        if (decryptedString.includes("encryptedData") && decryptedString.includes("iv")) {
          throw new Error(
            "Decryption returned encrypted payload structure - possible password mismatch"
          );
        }
        return decryptedString;
      }
    } catch (error) {
      const errorMessage = error.message || String(error);
      if (errorMessage.includes("OperationError") || errorMessage.includes("decrypt") || errorMessage.includes("AES-GCM")) {
        throw new Error(
          "Decryption failed: Incorrect password or corrupted data"
        );
      }
      throw new Error("Decryption failed: " + errorMessage);
    }
  }
};
var crypto_manager_default = CryptoManager;

// src/core/store/events.js
function createDebouncedEventDispatcher(delay) {
  const timeoutIds = {};
  return (eventName, value) => {
    if (timeoutIds[eventName] !== void 0) {
      clearTimeout(timeoutIds[eventName]);
    }
    timeoutIds[eventName] = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: value
        })
      );
      timeoutIds[eventName] = void 0;
    }, delay);
  };
}
var debouncedDispatcher = createDebouncedEventDispatcher(200);

// src/core/store/storage-manager.js
var databaseName = "DimDatabase";
var objectStoreName = "DimStore";
var StorageManager = class {
  constructor(crypto2 = null) {
    this.crypto = crypto2;
    this.asyncManager = null;
    this.db = null;
    this._dbPromise = this.openDatabase();
  }
  async openDatabase() {
    if (this.db) {
      return this.db;
    }
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(objectStoreName)) {
          database.createObjectStore(objectStoreName, { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      request.onerror = function(event) {
        reject("Error opening database: " + event.target.error);
      };
    });
  }
  async _ready() {
    if (!this.db) {
      await this._dbPromise;
    }
    return this.db;
  }
  async writeValue(id, value) {
    const db = await this._ready();
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database not available");
        return;
      }
      let transaction = db.transaction([objectStoreName], "readwrite");
      let objectStore = transaction.objectStore(objectStoreName);
      let request = objectStore.put({ id, value });
      request.onsuccess = function() {
        resolve("Value written successfully");
      };
      request.onerror = function(event) {
        reject("Error writing value: " + event.target.error);
      };
    });
  }
  async readValue(id, newState) {
    const db = await this._ready();
    return new Promise((resolve, reject) => {
      if (!db) {
        resolve(null);
        return;
      }
      let transaction = db.transaction([objectStoreName], "readonly");
      let objectStore = transaction.objectStore(objectStoreName);
      let request = objectStore.get(id);
      request.onsuccess = async () => {
        if (request.result) {
          try {
            const storedValue = request.result.value;
            if (this.crypto && typeof storedValue === "string") {
              try {
                const parsed = JSON.parse(storedValue);
                if (parsed.encryptedData && parsed.iv) {
                  try {
                    const decryptedValue = await this.crypto.decryptData(storedValue);
                    if (decryptedValue && typeof decryptedValue === "object" && decryptedValue.encryptedData && decryptedValue.iv) {
                      reject(
                        new Error(
                          "Decryption failed: Incorrect password - returned encrypted payload structure"
                        )
                      );
                      return;
                    }
                    resolve({ value: decryptedValue, newState });
                    return;
                  } catch (decryptError) {
                    const errorMessage = decryptError.message || String(decryptError);
                    if (errorMessage.includes("Incorrect password") || errorMessage.includes("Decryption failed")) {
                      reject(
                        new Error("Decryption failed: Incorrect password")
                      );
                      return;
                    }
                    reject(decryptError);
                    return;
                  }
                }
              } catch (parseError) {
              }
            }
            resolve({ value: storedValue, newState });
          } catch (error) {
            console.error("Failed to decrypt stored value:", error);
            const errorMessage = error.message || String(error);
            if (errorMessage.includes("Incorrect password") || errorMessage.includes("Decryption failed")) {
              reject(error);
            } else {
              resolve(null);
            }
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = function(event) {
        reject("Error reading value: " + event.target.error);
      };
    });
  }
  loadFromDatabase = (store, listenerId) => {
    const traverse = (obj, path) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key].length === void 0) {
          traverse(obj[key], `${path}${key}.`);
        } else {
          this.readValue(`${path}${key}`, obj[key]).then(async (response) => {
            if (response) {
              try {
                debouncedDispatcher(
                  `${path}${key}-initialLoad-${listenerId}`,
                  {
                    value: response.value,
                    _isInitialLoad: true
                  }
                );
              } catch (error) {
                console.error("Failed to encrypt for dispatch:", error);
              }
            } else {
              const k = `${path}${key}`;
              if (this.asyncManager?.clearLoading) {
                this.asyncManager.clearLoading(k);
              } else if (typeof this.asyncManager?.loadingSetters?.[k] === "function") {
                this.asyncManager.loadingSetters[k](false);
              }
            }
          }).catch((error) => {
            console.error(error);
            const k = `${path}${key}`;
            if (this.asyncManager?.clearLoading) {
              this.asyncManager.clearLoading(k);
            } else if (typeof this.asyncManager?.loadingSetters?.[k] === "function") {
              this.asyncManager.loadingSetters[k](false);
            }
          });
        }
      });
    };
    traverse(store, "");
  };
};
var storage_manager_default = StorageManager;

// src/core/store/useDimStore.ts
var cryptoManagerMap = /* @__PURE__ */ new Map();
var storageManagerMap = /* @__PURE__ */ new Map();
function getManagers(password) {
  let cryptoManager = cryptoManagerMap.get(password);
  let storageManager = storageManagerMap.get(password);
  if (!cryptoManager) {
    cryptoManager = new crypto_manager_default(password);
    cryptoManagerMap.set(password, cryptoManager);
  }
  if (!storageManager) {
    storageManager = new storage_manager_default(cryptoManager);
    storageManagerMap.set(password, storageManager);
  }
  return { cryptoManager, storageManager };
}
function useDimStore({
  key,
  password,
  defaultValue = ""
}) {
  if (!password) {
    throw new Error(
      "useDimStore: an explicit `password` (encryption key) is required."
    );
  }
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const { cryptoManager, storageManager } = getManagers(password);
  const mountedRef = useRef(true);
  const eventListenerRef = useRef(null);
  const instanceIdRef = useRef(
    Math.random().toString(36).substring(2, 15)
  );
  const isSettingValueRef = useRef(false);
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    const loadFromStorage = async () => {
      try {
        const result = await storageManager.readValue(key, null);
        if (!mountedRef.current) return;
        if (result && result.value !== null && result.value !== void 0) {
          const value2 = result.value;
          if (typeof value2 === "object" && value2 !== null && value2.encryptedData && value2.iv) {
            console.error(
              "useDimStore: Received encrypted payload structure instead of decrypted value - password may be incorrect"
            );
            if (!hasLoadedRef.current && !isSettingValueRef.current) {
              setValue(defaultValue);
              hasLoadedRef.current = true;
            }
            if (mountedRef.current) {
              setIsLoading(false);
            }
            return;
          }
        }
        if (!hasLoadedRef.current && !isSettingValueRef.current) {
          if (result && result.value !== null && result.value !== void 0) {
            setValue(result.value);
          } else {
            setValue(defaultValue);
          }
          hasLoadedRef.current = true;
        } else if (hasLoadedRef.current && result && result.value !== null && result.value !== void 0) {
          setValue(result.value);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to load from storage:", error);
        if (errorMessage.includes("Incorrect password") || errorMessage.includes("Decryption failed")) {
          console.warn("useDimStore: Password mismatch - using default value");
        }
        if (mountedRef.current && !hasLoadedRef.current) {
          setValue(defaultValue);
          hasLoadedRef.current = true;
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };
    loadFromStorage();
    const eventListener = async (event) => {
      try {
        if (event.detail._instanceId === instanceIdRef.current) {
          return;
        }
        if (isSettingValueRef.current) {
          return;
        }
        if (!mountedRef.current) return;
        const decryptedValue = await cryptoManager.decryptData({
          ...event.detail,
          crypto: cryptoManager
        });
        if (!mountedRef.current) return;
        if (decryptedValue && typeof decryptedValue === "object" && decryptedValue.encryptedData && decryptedValue.iv) {
          console.error(
            "useDimStore: Event decryption returned encrypted payload structure - password may be incorrect"
          );
          return;
        }
        setValue((currentValue) => {
          if (decryptedValue !== currentValue) {
            return decryptedValue;
          }
          return currentValue;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("Incorrect password") || errorMessage.includes("Decryption failed")) {
          console.warn(
            "useDimStore: Failed to process event data - password mismatch"
          );
        } else {
          console.error("Failed to process event data:", error);
        }
      }
    };
    window.addEventListener(key, eventListener);
    eventListenerRef.current = eventListener;
    return () => {
      mountedRef.current = false;
      if (eventListenerRef.current) {
        window.removeEventListener(
          key,
          eventListenerRef.current
        );
        eventListenerRef.current = null;
      }
    };
  }, [key, password, defaultValue]);
  const setValueAndStore = async (newValue) => {
    isSettingValueRef.current = true;
    setValue(newValue);
    try {
      const encryptedData = await cryptoManager.encryptData(newValue);
      await storageManager.writeValue(key, encryptedData);
      console.log(`Stored encrypted value for key "${key}" in IndexedDB`);
      try {
        const encryptedObject = JSON.parse(encryptedData);
        encryptedObject._instanceId = instanceIdRef.current;
        debouncedDispatcher(key, encryptedObject);
      } catch (error) {
        console.error("Failed to dispatch event:", error);
      }
    } catch (error) {
      console.error("Failed to store value:", error);
    } finally {
      setTimeout(() => {
        isSettingValueRef.current = false;
      }, 100);
    }
  };
  return [value, setValueAndStore, isLoading];
}

export { useDimStore };
//# sourceMappingURL=react.mjs.map
//# sourceMappingURL=react.mjs.map