import { useState } from "../hooks/useState";
import { useEffect } from "../hooks/useEffect";
import AsyncronousStateManager from "./async-manager.js";
import CryptoManager from "./crypto-manager.js";

// State managers keyed by encryption key. Encryption is opt-in: when no key is
// provided the store operates on plaintext. There is intentionally no default
// password baked into the framework.
const stateManagerMap = new Map();
const cryptoManagerMap = new Map();

// Shared singleton manager used when encryption is not enabled.
const plaintextStateManager = new AsyncronousStateManager(null);

function listenerIdKey(randomId) {
  if (randomId instanceof Uint8Array) {
    return Array.from(randomId).join(",");
  }
  return String(randomId);
}

/**
 * Bottom-up reactive store.
 *
 * @param store - schema object of `useState` tuples
 * @param options - optional config. Pass `{ encryptionKey }` (or a string key)
 *   to enable encrypted persistence. Encryption is OFF by default and there is
 *   no hardcoded fallback password.
 */
export const useStore = (
  store,
  options: { encryptionKey?: string } | string = {}
) => {
  const encryptionKey =
    typeof options === "string" ? options : options?.encryptionKey;

  const [randomId] = useState(crypto.getRandomValues(new Uint8Array(8)));
  const subscriberId = listenerIdKey(randomId);

  let stateManager;
  if (encryptionKey) {
    let cryptoManager = cryptoManagerMap.get(encryptionKey);
    stateManager = stateManagerMap.get(encryptionKey);

    if (!cryptoManager) {
      cryptoManager = new CryptoManager(encryptionKey);
      cryptoManagerMap.set(encryptionKey, cryptoManager);

      stateManager = new AsyncronousStateManager(cryptoManager);
      stateManagerMap.set(encryptionKey, stateManager);
    }
  } else {
    stateManager = plaintextStateManager;
  }

  // Add loading state for each store property
  const enhanceStoreWithLoading = (obj, path = "") => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key].length === undefined) {
        enhanceStoreWithLoading(obj[key], `${path}${key}.`);
      } else if (Array.isArray(obj[key]) && obj[key].length === 2) {
        const [value, setValue] = obj[key];
        const [isLoading, setIsLoading] = useState(true);

        // Replace the store entry with enhanced version that includes loading state
        obj[key] = [value, setValue, isLoading, setIsLoading];

        // Multicast: every subscriber for this key gets isLoading cleared.
        const fullKey = `${path}${key}`;
        stateManager.addLoadingSetter(fullKey, subscriberId, setIsLoading);
      }
    });
  };

  enhanceStoreWithLoading(store);
  // Use the same string id for listeners + loading setters so cleanup matches.
  stateManager.createListeners(store, subscriberId);

  useEffect(() => {
    // The async manager owns its StorageManager instance (stateManager.db).
    stateManager.db.loadFromDatabase(store, subscriberId);
    return () => {
      stateManager.removeListeners(subscriberId);
    };
  }, []);

  return store;
};
