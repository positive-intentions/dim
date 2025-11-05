import { useState, useEffect, useRef } from 'react';
import CryptoManager from '../core/crypto-manager.js';
import StorageManager from '../core/storage-manager.js';

// Default password matching the one in Dim framework
const DEFAULT_PASSWORD = "test-password-123";

// Global instances map to reuse crypto/storage managers per password
const cryptoManagerMap = new Map<string, CryptoManager>();
const storageManagerMap = new Map<string, StorageManager>();

/**
 * Get or create a CryptoManager and StorageManager for a given password
 */
function getManagers(password: string) {
  let cryptoManager = cryptoManagerMap.get(password);
  let storageManager = storageManagerMap.get(password);

  if (!cryptoManager) {
    cryptoManager = new CryptoManager(password);
    cryptoManagerMap.set(password, cryptoManager);
  }

  if (!storageManager) {
    storageManager = new StorageManager(cryptoManager);
    storageManagerMap.set(password, storageManager);
  }

  return { cryptoManager, storageManager };
}

interface UseDimStoreOptions {
  key: string;
  password?: string;
  defaultValue?: string;
}

/**
 * React hook to use Dim's encrypted store
 *
 * @param options - Configuration object
 * @param options.key - The key to store the value under in IndexedDB
 * @param options.password - Optional password for encryption (defaults to "test-password-123")
 * @param options.defaultValue - Default value if nothing is stored
 * @returns [value, setValue, isLoading] - Current value, setter function, and loading state
 */
export function useDimStore({
  key,
  password = DEFAULT_PASSWORD,
  defaultValue = ""
}: UseDimStoreOptions): [string, (newValue: string) => void, boolean] {
  const [value, setValue] = useState<string>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const { cryptoManager, storageManager } = getManagers(password);
  const mountedRef = useRef(true);

  // Load initial value from IndexedDB
  useEffect(() => {
    mountedRef.current = true;

    const loadFromStorage = async () => {
      try {
        const result = await storageManager.readValue(key, null);

        if (!mountedRef.current) return;

        if (result && result.value !== null && result.value !== undefined) {
          setValue(result.value);
        } else {
          // No stored value, use default
          setValue(defaultValue);
        }
      } catch (error) {
        console.error('Failed to load from storage:', error);
        if (mountedRef.current) {
          setValue(defaultValue);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadFromStorage();

    return () => {
      mountedRef.current = false;
    };
  }, [key, password, defaultValue]);

  // Save to IndexedDB whenever value changes
  const setValueAndStore = async (newValue: string) => {
    setValue(newValue);

    try {
      // Encrypt the data
      const encryptedData = await cryptoManager.encryptData(newValue);

      // Store encrypted data
      await storageManager.writeValue(key, encryptedData);

      console.log(`Stored encrypted value for key "${key}" in IndexedDB`);
    } catch (error) {
      console.error('Failed to store value:', error);
    }
  };

  return [value, setValueAndStore, isLoading];
}

