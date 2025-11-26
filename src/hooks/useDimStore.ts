import { useState, useEffect, useRef } from 'react';
import CryptoManager from '../core/crypto-manager.js';
import StorageManager from '../core/storage-manager.js';
import { debouncedDispatcher } from '../core/mini-lit.js';

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
  const eventListenerRef = useRef<((event: CustomEvent) => void) | null>(null);
  const instanceIdRef = useRef<string>(Math.random().toString(36).substring(2, 15));
  const isSettingValueRef = useRef<boolean>(false);
  const hasLoadedRef = useRef<boolean>(false);

  // Load initial value from IndexedDB and set up event listener
  useEffect(() => {
    mountedRef.current = true;

    const loadFromStorage = async () => {
      try {
        const result = await storageManager.readValue(key, null);

        if (!mountedRef.current) return;

        // Validate that result.value is not an encrypted payload structure
        if (result && result.value !== null && result.value !== undefined) {
          const value = result.value;
          // Check if value looks like an encrypted payload structure (shouldn't happen)
          if (typeof value === 'object' && value !== null && 
              value.encryptedData && value.iv) {
            console.error('useDimStore: Received encrypted payload structure instead of decrypted value - password may be incorrect');
            // Password is wrong - use default value
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

        // Only set value if we haven't already loaded and if we're not currently setting a value
        // This prevents race conditions where a save happens before load completes
        if (!hasLoadedRef.current && !isSettingValueRef.current) {
          if (result && result.value !== null && result.value !== undefined) {
            setValue(result.value);
          } else {
            // No stored value, use default
            setValue(defaultValue);
          }
          hasLoadedRef.current = true;
        } else if (hasLoadedRef.current && result && result.value !== null && result.value !== undefined) {
          // If we've already loaded but got a new value (from another instance), update it
          setValue(result.value);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to load from storage:', error);
        
        // If it's a password error, use default value and log warning
        if (errorMessage.includes('Incorrect password') || 
            errorMessage.includes('Decryption failed')) {
          console.warn('useDimStore: Password mismatch - using default value');
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

    // Set up event listener for cross-component synchronization
    const eventListener = async (event: CustomEvent) => {
      try {
        // Skip if this is our own update (prevent infinite loop)
        if (event.detail._instanceId === instanceIdRef.current) {
          return;
        }

        // Skip if we're currently setting a value (prevent processing our own dispatched event)
        if (isSettingValueRef.current) {
          return;
        }

        if (!mountedRef.current) return;

        // Decrypt the incoming event data
        // decryptData expects an object with encryptedData and iv properties (from JSON.parse of encrypted string)
        const decryptedValue = await cryptoManager.decryptData({
          ...event.detail,
          crypto: cryptoManager
        });

        if (!mountedRef.current) return;

        // Validate that decryptedValue is not an encrypted payload structure
        if (decryptedValue && typeof decryptedValue === 'object' && 
            decryptedValue.encryptedData && decryptedValue.iv) {
          console.error('useDimStore: Event decryption returned encrypted payload structure - password may be incorrect');
          return; // Don't update with encrypted structure
        }

        // Update local state (use functional update to avoid stale closure)
        setValue((currentValue) => {
          // Only update if value actually changed
          if (decryptedValue !== currentValue) {
            return decryptedValue;
          }
          return currentValue;
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Incorrect password') || 
            errorMessage.includes('Decryption failed')) {
          console.warn('useDimStore: Failed to process event data - password mismatch');
        } else {
          console.error('Failed to process event data:', error);
        }
      }
    };

    // Listen for events with the key as event name
    window.addEventListener(key, eventListener as EventListener);
    eventListenerRef.current = eventListener as (event: CustomEvent) => void;

    return () => {
      mountedRef.current = false;
      // Clean up event listener
      if (eventListenerRef.current) {
        window.removeEventListener(key, eventListenerRef.current as EventListener);
        eventListenerRef.current = null;
      }
    };
    // Note: cryptoManager and storageManager are stable (cached per password), so we only need password in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, password, defaultValue]);

  // Save to IndexedDB and dispatch encrypted event whenever value changes
  const setValueAndStore = async (newValue: string) => {
    // Mark that we're setting a value to prevent processing our own event
    isSettingValueRef.current = true;

    // Update local state immediately
    setValue(newValue);

    try {
      // Encrypt the data
      const encryptedData = await cryptoManager.encryptData(newValue);

      // Store encrypted data in IndexedDB
      await storageManager.writeValue(key, encryptedData);

      console.log(`Stored encrypted value for key "${key}" in IndexedDB`);

      // Dispatch encrypted custom event for cross-component synchronization
      // Parse the encrypted string back to object for dispatch (same pattern as async-manager)
      try {
        const encryptedObject = JSON.parse(encryptedData);
        // Include instance ID so we can skip processing our own event
        encryptedObject._instanceId = instanceIdRef.current;
        debouncedDispatcher(key, encryptedObject);
      } catch (error) {
        console.error('Failed to dispatch event:', error);
      }
    } catch (error) {
      console.error('Failed to store value:', error);
    } finally {
      // Reset flag after a short delay to allow event to be dispatched
      setTimeout(() => {
        isSettingValueRef.current = false;
      }, 100);
    }
  };

  return [value, setValueAndStore, isLoading];
}

