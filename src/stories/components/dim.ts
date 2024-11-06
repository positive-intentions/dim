import { LitElement } from "lit";
import { css, html, unsafeCSS } from "./mini-lit";

let currentInstance = null;

function setCurrentInstance(instance) {
  currentInstance = instance;
}

function getCurrentInstance() {
  if (!currentInstance) {
    throw new Error("Hooks can only be called inside a component.");
  }
  return currentInstance;
}

export function define({ tag, component: CustomFunctionalComponent }) {
  class DimComponent extends LitElement {
    static get properties() {
      return {
        props: { type: Object },
      };
    }
    constructor() {
      super();
      this.hookIndex = 0;
      this.hooks = {};
    }

    render() {
      // Reset hook index on every render
      this.hookIndex = 0;

      // Set the current instance context
      setCurrentInstance(this);

      // Get all attributes as props
      const attributes = Array.from(this.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {});

      this.props = this.props || {};

      const sharedDependencies = {
        useState,
        useEffect,
        useMemo,
        useScope,
        useStyle,
        useStore,
        html,
        css,
      };

      // Call the functional component
      const result = CustomFunctionalComponent(
        {
          ...attributes,
          ...this.props,
          children: this.innerHTML,
        },
        sharedDependencies
      );

      // Clear the current instance context
      setCurrentInstance(null);

      return result;
    }
  }

  window.customElements.define(tag, DimComponent);
}

export function useState(initialState) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  if (!component.hooks[hookName]) {
    component.hooks[hookName] = initialState;
  }

  const setState = (newState) => {
    const value =
      typeof newState === "function"
        ? newState(component.hooks[hookName])
        : newState;
    component.hooks[hookName] = value;
    component.requestUpdate();
  };

  return [component.hooks[hookName], setState];
}

export function useEffect(effect, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  const prevDeps = component.hooks[hookName]?.dependencies;
  const hasChanged =
    !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    if (component.hooks[hookName]?.cleanup) {
      component.hooks[hookName].cleanup();
    }
    const cleanup = effect();
    component.hooks[hookName] = { dependencies, cleanup };
  }

  // // Add event listener to handle unmount
  // component.addEventListener("disconnectedCallback", () => {
  //   if (component.hooks[hookName]?.cleanup) {
  //     component.hooks[hookName].cleanup();
  //   }
  // });

  component.addController({
    hostDisconnected() {
      if (component.hooks[hookName]?.cleanup) {
        component.hooks[hookName].cleanup();
      }
    },
  });
}

export function useMemo(calculation, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  const prevDeps = component.hooks[hookName]?.dependencies;
  const hasChanged =
    !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    component.hooks[hookName] = {
      value: calculation(),
      dependencies,
    };
  }

  return component.hooks[hookName].value;
}

export function useScope(elements) {
  Object.keys(elements).forEach((key) => {
    const elementClass = elements[key];

    // Define the custom element with a unique tag per component instance
    if (!customElements.get(key)) {
      define({ tag: key, component: elementClass });
    }
  });
}

export function useStyle(styles) {
  const component = getCurrentInstance();

  if (!component._stylesApplied) {
    component._stylesApplied = true;

    // Apply the styles to the component
    const styleElement = document.createElement("style");
    styleElement.textContent = unsafeCSS(styles).cssText;
    component.shadowRoot.appendChild(styleElement);
  }
}

export const useLazyScope = (tag, promise) => {
  promise.then((module) => {
    const elementClass = new Function(`return ${module}`)();

    if (!customElements.get(tag)) {
      define({ tag, component: elementClass });
    }
  });
};
async function generateKey(password, salt = null) {
  const encoder = new TextEncoder();

  // If no salt is provided, generate a new random one
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(16));
  }

  // Encode the password into binary format
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive a key using PBKDF2 with the provided or generated salt
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  return { key: derivedKey, salt: salt };
}

async function encryptData(key, data) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    enc.encode(data)
  );

  return { encryptedData, iv };
}

async function decryptData(key, encryptedData, iv) {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedData
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedData);
}

function arrayBufferToString(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function stringToArrayBuffer(str) {
  const binaryString = atob(str);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

let db;
const databaseName = "DimDatabase";
const objectStoreName = "DimStore";

class AsyncronousStateManager {
  constructor() {
    this.store = {};
    this.eventListener = [];
    this.password = "my-strong-password";
    this.key = null;
    this.salt = null;
    this.openDatabase().catch(console.error);
    this.initEncryption().catch(console.error);
  }

  async initEncryption() {
    const stringifiedSalt = "7G8WKM1oWgCy2og2NB68cQ==";
    const stringifiedKey = "DNtvCq4ssPoXFQ20w/biT2yTvVTLrMUfzeJCsv0iN8o=";
    const deserializeKey = await crypto.subtle.importKey(
      "raw",
      stringToArrayBuffer(stringifiedKey),
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
    const deserializeSalt = stringToArrayBuffer(stringifiedSalt);
    this.key = deserializeKey;
    this.salt = deserializeSalt;
  }

  async encryptDataPromise(data) {
    const { encryptedData, iv } = await encryptData(
      this.key,
      JSON.stringify(data)
    );
    const encryptedDataString = arrayBufferToString(encryptedData);
    const ivString = arrayBufferToString(iv);
    this.decryptDataPromise(encryptedDataString, ivString, this.key).then(
      (decryptedData) => {
        console.log({
          encryptedDataString,
          ivString,
          decryptedData,
        });
      }
    );
    return {
      encryptedData: arrayBufferToString(encryptedData),
      iv: arrayBufferToString(iv),
    };
  }

  async decryptDataPromise(encryptedData, iv, key) {
    const deserializedEncryptedData = stringToArrayBuffer(encryptedData);
    const deserializeIv = stringToArrayBuffer(iv);
    const decryptedData = await decryptData(
      key || this.key,
      deserializedEncryptedData,
      deserializeIv
    ).catch((e) => {
      console.error("Error decrypting data: ", e);
    });

    return JSON.parse(decryptedData);
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
    const { encryptedData, iv } = await this.encryptDataPromise(value);
    let transaction2 = db.transaction([objectStoreName], "readwrite");
    let objectStore2 = transaction2.objectStore(objectStoreName);
    let request2 = objectStore2.put({
      id: "encrypted-" + id,
      iv: iv,
      value: encryptedData,
    });

    request2.onsuccess = function (event) {
      console.log("Encrypted value written successfully");
    };

    request2.onerror = function (event) {
      console.log("Error writing value: " + event.target.error);
    };

    return new Promise((resolve, reject) => {
      // let transaction = db.transaction([objectStoreName], "readwrite");
      // let objectStore = transaction.objectStore(objectStoreName);
      // let request = objectStore.put({ id: id, value: value });

      // request.onsuccess = function (event) {
      //   resolve("Value written successfully");
      // };

      // request.onerror = function (event) {
      //   reject("Error writing value: " + event.target.error);
      // };

      let transaction2 = db.transaction([objectStoreName], "readwrite");
      let objectStore2 = transaction2.objectStore(objectStoreName);
      let request2 = objectStore2.put({
        id: "encrypted-" + id,
        iv: iv,
        value: encryptedData,
      });

      request2.onsuccess = function (event) {
        resolve("Encrypted value written successfully");
      };

      request2.onerror = function (event) {
        reject("Error writing value: " + event.target.error);
      };
    });
  }

  async readValue(id, newState) {
    let transaction2 = db.transaction([objectStoreName], "readonly");
    let objectStore2 = transaction2.objectStore(objectStoreName);
    let request2 = objectStore2.get("encrypted-" + id);
    const decryptDataPromise = this.decryptDataPromise;
    const key = this.key;

    request2.onsuccess = async function (event) {
      if (request2.result) {
        console.log({
          value: request2.result.value,
          iv: request2.result.iv,
          newState,
        });

        const decryptedData = await decryptDataPromise(
          request2.result.value,
          request2.result.iv,
          key
        );

        console.log({
          decryptedData,
        });
      } else {
        console.log({});
      }
    };

    request2.onerror = function (event) {
      console.log("Error reading value: " + event.target.error);
    };

    return new Promise((resolve, reject) => {
      //   let transaction = db.transaction([objectStoreName], "readonly");
      //   let objectStore = transaction.objectStore(objectStoreName);
      //   let request = objectStore.get(id);

      //   request.onsuccess = function (event) {
      //     if (request.result) {
      //       resolve({ value: request.result.value, newState });
      //     } else {
      //       resolve({});
      //     }
      //   };

      //   request.onerror = function (event) {
      //     reject("Error reading value: " + event.target.error);
      //   };
      let transaction2 = db.transaction([objectStoreName], "readonly");
      let objectStore2 = transaction2.objectStore(objectStoreName);
      let request2 = objectStore2.get("encrypted-" + id);
      const decryptDataPromise = this.decryptDataPromise;
      const key = this.key;

      request2.onsuccess = async function (event) {
        if (request2.result) {
          console.log({
            value: request2.result.value,
            iv: request2.result.iv,
            newState,
          });

          const decryptedData = await decryptDataPromise(
            request2.result.value,
            request2.result.iv,
            key
          );

          resolve({
            value: decryptedData,
            newState,
          });
        } else {
          resolve({});
        }
      };

      request2.onerror = function (event) {
        console.log("Error reading value: " + event.target.error);
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

    const newState = this.store[key] || value[0];

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

const asyncronousStateManager = new AsyncronousStateManager();

const createListeners = (store, listenerId) => {
  const traverse = (obj, path) => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key].length === undefined) {
        traverse(obj[key], `${path}${key}.`);
      } else {
        const [asyncState, asyncSetState] =
          asyncronousStateManager.generateListener({
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

type DebouncedEventDispatcher = (eventName: string, value: any) => void;

function createDebouncedEventDispatcher(
  delay: number
): DebouncedEventDispatcher {
  const timeoutIds: { [key: string]: number | undefined } = {};

  return (eventName: string, value: any) => {
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

const loadFromDatabase = (store) => {
  const traverse = (obj, path) => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key].length === undefined) {
        traverse(obj[key], `${path}${key}.`);
      } else {
        asyncronousStateManager
          .readValue(`${path}${key}`, obj[key])
          .then(({ value }) => {
            debouncedDispatcher(`${path}${key}`, value);
          })
          .catch(console.error);
      }
    });
  };

  traverse(store, "");
};

export const useStore = (store) => {
  const [randomId] = useState(crypto.getRandomValues(new Uint8Array(8)));

  createListeners(store, randomId);

  useEffect(() => {
    loadFromDatabase(store);

    return () => {
      asyncronousStateManager.removeListeners(randomId);
    };
  }, []);

  return store;
};
