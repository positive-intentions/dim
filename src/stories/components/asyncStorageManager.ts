async function generateKey(password, salt = "") {
  const encoder = new TextEncoder();

  const passwordSha256Hash = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(password)
  );

  console.log("password", password, arrayBufferToString(passwordSha256Hash));

  // If no salt is provided, generate a new random one
  if (!salt) {
    salt = stringToArrayBuffer(arrayBufferToString(passwordSha256Hash));
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
      iterations: 1000000,
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

export default class AsyncronousStateManager {
  constructor({ password = null } = {}) {
    this.store = {};
    this.eventListener = [];
    this.password = password;
    this.openDatabase().catch(console.error);
  }

  async getOrCreateBiometricCredential() {
    return await new Promise((resolve, reject) => {
      (async () => {
        try {
          // Check if WebAuthn is supported in the browser
          if (!window.PublicKeyCredential) {
            reject("WebAuthn is not supported in this browser.");
          }

          // Create a random challenge (this would usually come from the server)
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);

          const publicKeyCredentialCreationOptions = {
            challenge: challenge, // Random challenge from the server
            rp: {
              name: "positive-intentions", // Name of your site/service
              id: window.location.hostname,
            },
            user: {
              id: Uint8Array.from(
                window.crypto.getRandomValues(new Uint8Array(16))
              ), // User ID (must be unique per user)
              name: "me@positive-intentions.com", // Username/email for the user
              displayName: "Device User",
            },
            pubKeyCredParams: [
              {
                type: "public-key",
                alg: -7, // Algorithm, usually ECDSA with SHA-256
              },
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform", // Use device's biometric (platform) authenticator
              userVerification: "required",
            },
            timeout: 60000,
            attestation: "direct", // Attestation type
          };

          // Register a new passkey if none exist
          let credentials;
          try {
            credentials = await navigator.credentials
              .get({
                publicKey: {
                  challenge: challenge,
                  rpId: window.location.hostname, // The relying party's domain (this website)
                  allowCredentials: [], // Empty to allow user to choose from any available credentials
                  userVerification: "required",
                },
              })
              .then((credentials) => {
                console.log("Biometric Authentication successful!");
                console.log("Credential ID:", credentials.id);
                this.biometricInProgress = false;
                resolve(credentials.id);
              });
          } catch (error) {
            console.log("No credentials found, attempting to create one.");

            // If no credentials are available, we create a new one
            const newCredential = await navigator.credentials.create({
              publicKey: publicKeyCredentialCreationOptions,
            });

            // Store the credential for future logins (typically, you'd send this to a server)
            console.log("New passkey created:", newCredential);

            // Now that we've created a passkey, attempt to use it for authentication
            credentials = await navigator.credentials.get({
              publicKey: {
                challenge: challenge,
                rpId: window.location.hostname,
                allowCredentials: [
                  {
                    id: newCredential.rawId,
                    type: "public-key",
                    transports: ["internal"],
                  },
                ],
                userVerification: "required",
              },
            });
            console.log(
              "Biometric Authentication successful after creating passkey!"
            );
            console.log("Credential ID:", credentials.id);
            resolve(credentials.id);
          }
        } catch (error) {
          // Log the error if authentication or registration fails
          reject("Error during authentication or registration:", error);
        }
      })();
    });
  }

  async init() {
    // const getCredentials = async () => {
    if (!this.password) {
      const shouldUseWebAuth =
        !!false &&
        confirm("would you like to use WebAuthn instead of password?");
      if (shouldUseWebAuth) {
        console.log("Using WebAuthn");
        this.password = await this.getOrCreateBiometricCredential();
        return;
      } else {
        const promptInput = prompt("Enter password for encryption");
        if (promptInput) {
          console.log("Password entered: ", promptInput);
          this.password = promptInput;
        } else {
          console.error("No password entered");
          this.password = "promptInput";
        }
      }
    }
    // };
    // await getCredentials();

    const { key } = await generateKey(this.password, this.salt);
    this.key = key;

    window.dispatchEvent(new Event("async-state-auth-ready"));
    return;
  }

  async authReady() {
    return new Promise((resolve, reject) => {
      // listen for auth ready event
      const authReadyListener = () => {
        // remove listener
        console.log("auth ready");
        window.removeEventListener("async-state-auth-ready", authReadyListener);
        resolve();
      };
      window.addEventListener("async-state-auth-ready", authReadyListener);

      this.init().catch((e) => {
        reject(e);
      });
    });
  }

  async encryptData(key, data) {
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

  async decryptData(key, encryptedData, iv) {
    return new Promise((resolve, reject) => {
      const decryptData = async () => {
        const decryptedData = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: iv,
          },
          key,
          encryptedData
        );

        if (!decryptedData) {
          reject("Decryption failed");
        } else {
          const dec = new TextDecoder();
          return resolve(dec.decode(decryptedData));
        }
      };

      decryptData().catch(reject);
    });
  }

  async encryptDataPromise(data) {
    // const { key } = await generateKey(this.password, this.salt);
    const key = this.key || (await generateKey(this.password, this.salt));
    const { encryptedData, iv } = await this.encryptData(
      key,
      JSON.stringify(data)
    );
    // const encryptedDataString = arrayBufferToString(encryptedData);
    // const ivString = arrayBufferToString(iv);
    // this.decryptDataPromise(encryptedDataString, ivString, key).then(
    //   (decryptedData) => {
    //     console.log({
    //       encryptedDataString,
    //       ivString,
    //       decryptedData,
    //     });
    //   }
    // );
    return {
      encryptedData: arrayBufferToString(encryptedData),
      iv: arrayBufferToString(iv),
    };
  }

  async decryptDataPromise(encryptedData, iv, key) {
    const deserializedEncryptedData = stringToArrayBuffer(encryptedData);
    const deserializeIv = stringToArrayBuffer(iv);
    const decryptedData = await this.decryptData(
      key,
      deserializedEncryptedData,
      deserializeIv
    );

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
    // const { key } = await generateKey(this.password, this.salt);
    const key = this.key || (await generateKey(this.password, this.salt));
    const decryptDataPromise = this.decryptDataPromise.bind(this);

    request2.onsuccess = async (event) => {
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
      let transaction2 = db.transaction([objectStoreName], "readonly");
      let objectStore2 = transaction2.objectStore(objectStoreName);
      let request2 = objectStore2.get("encrypted-" + id);

      request2.onsuccess = async (event) => {
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

  loadFromDatabase(store) {
    return new Promise((resolve, reject) => {
      const traverse = (obj, path) => {
        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] === "object" && obj[key].length === undefined) {
            traverse(obj[key], `${path}${key}.`);
          } else {
            this.readValue(`${path}${key}`, obj[key])
              .then(({ value }) => {
                debouncedDispatcher(`${path}${key}`, value, resolve);
              })
              .catch((e) => {
                resolve();
              });
          }
        });
      };

      traverse(store, "");
    });
  }

  createListeners(store, listenerId) {
    const traverse = (obj, path) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key].length === undefined) {
          traverse(obj[key], `${path}${key}.`);
        } else {
          const [asyncState, asyncSetState] = this.generateListener({
            listenerId,
            key: `${path}${key}`,
            value: obj[key],
          });

          obj[key] = [asyncState, asyncSetState].concat(obj[key]);
        }
      });
    };

    traverse(store, "");
  }
}

type DebouncedEventDispatcher = (eventName: string, value: any) => void;

function createDebouncedEventDispatcher(
  delay: number
): DebouncedEventDispatcher {
  const timeoutIds: { [key: string]: number | undefined } = {};

  return (eventName: string, value: any, resolve: any) => {
    if (timeoutIds[eventName] !== undefined) {
      clearTimeout(timeoutIds[eventName]);
    }

    timeoutIds[eventName] = window.setTimeout(() => {
      resolve(
        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: value,
          })
        )
      );

      timeoutIds[eventName] = undefined;
    }, delay);
  };
}

const debouncedDispatcher = createDebouncedEventDispatcher(10);
