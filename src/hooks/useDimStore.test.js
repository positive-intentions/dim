import { renderHook, waitFor } from '@testing-library/react';
import { useDimStore } from './useDimStore';
import CryptoManager from '../core/crypto-manager.js';
import StorageManager from '../core/storage-manager.js';

// Mock the managers
jest.mock('../core/crypto-manager.js');
jest.mock('../core/storage-manager.js');

describe('useDimStore', () => {
  let mockCryptoManager;
  let mockStorageManager;
  const testPassword = 'test-password-123';
  const wrongPassword = 'wrong-password';

  beforeEach(() => {
    // Create real instances for testing
    mockCryptoManager = new CryptoManager(testPassword);
    mockStorageManager = new StorageManager(mockCryptoManager);

    // Mock IndexedDB
    global.indexedDB = {
      open: jest.fn(() => ({
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: {
          transaction: jest.fn(() => ({
            objectStore: jest.fn(() => ({
              get: jest.fn(() => ({
                onsuccess: null,
                onerror: null,
                result: null
              })),
              put: jest.fn(() => ({
                onsuccess: null,
                onerror: null
              }))
            }))
          }))
        }
      }))
    };

    // Mock debouncedDispatcher
    global.debouncedDispatcher = jest.fn();

    jest.clearAllMocks();
  });

  describe('Password Validation', () => {
    test('should reject when password is incorrect', async () => {
      // Encrypt data with correct password
      const originalValue = 'test data';
      const encryptedValue = await mockCryptoManager.encryptData(originalValue);

      // Create storage manager with wrong password
      const wrongCryptoManager = new CryptoManager(wrongPassword);
      const wrongStorageManager = new StorageManager(wrongCryptoManager);

      // Mock readValue to simulate wrong password error
      wrongStorageManager.readValue = jest.fn().mockRejectedValue(
        new Error('Decryption failed: Incorrect password')
      );

      const { result } = renderHook(() =>
        useDimStore({
          key: 'test-key',
          password: wrongPassword,
          defaultValue: ''
        })
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false); // isLoading should be false
      });

      // Should use default value when password is wrong
      expect(result.current[0]).toBe('');
    });

    test('should return decrypted value correctly', async () => {
      const originalValue = 'test data';
      const encryptedValue = await mockCryptoManager.encryptData(originalValue);

      mockStorageManager.readValue = jest.fn().mockResolvedValue({
        value: originalValue,
        newState: null
      });

      const { result } = renderHook(() =>
        useDimStore({
          key: 'test-key',
          password: testPassword,
          defaultValue: ''
        })
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false); // isLoading should be false
      });

      expect(result.current[0]).toBe(originalValue);
    });

    test('should not return encrypted payload structure', async () => {
      const originalValue = 'test string';
      const encryptedValue = await mockCryptoManager.encryptData(originalValue);

      mockStorageManager.readValue = jest.fn().mockResolvedValue({
        value: originalValue,
        newState: null
      });

      const { result } = renderHook(() =>
        useDimStore({
          key: 'test-key',
          password: testPassword,
          defaultValue: ''
        })
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      const value = result.current[0];
      
      // Should be the decrypted string, not an object
      expect(typeof value).toBe('string');
      expect(value).toBe(originalValue);
      expect(value).not.toHaveProperty('encryptedData');
      expect(value).not.toHaveProperty('iv');
    });

    test('should handle password change scenario', async () => {
      const originalValue = 'test data';
      const encryptedValue = await mockCryptoManager.encryptData(originalValue);

      // First, store with correct password
      mockStorageManager.readValue = jest.fn().mockResolvedValue({
        value: originalValue,
        newState: null
      });

      const { result, rerender } = renderHook(
        ({ password }) =>
          useDimStore({
            key: 'test-key',
            password: password,
            defaultValue: ''
          }),
        {
          initialProps: { password: testPassword }
        }
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      expect(result.current[0]).toBe(originalValue);

      // Change password - should fail to decrypt
      const wrongCryptoManager = new CryptoManager(wrongPassword);
      const wrongStorageManager = new StorageManager(wrongCryptoManager);
      wrongStorageManager.readValue = jest.fn().mockRejectedValue(
        new Error('Decryption failed: Incorrect password')
      );

      rerender({ password: wrongPassword });

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      // Should fall back to default value
      expect(result.current[0]).toBe('');
    });
  });

  describe('Basic Functionality', () => {
    test('should return default value when no stored value exists', async () => {
      mockStorageManager.readValue = jest.fn().mockResolvedValue(null);

      const { result } = renderHook(() =>
        useDimStore({
          key: 'test-key',
          password: testPassword,
          defaultValue: 'default'
        })
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      expect(result.current[0]).toBe('default');
    });

    test('should set and store value', async () => {
      mockStorageManager.readValue = jest.fn().mockResolvedValue(null);
      mockStorageManager.writeValue = jest.fn().mockResolvedValue('Value written successfully');

      const { result } = renderHook(() =>
        useDimStore({
          key: 'test-key',
          password: testPassword,
          defaultValue: ''
        })
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      const newValue = 'new value';
      result.current[1](newValue);

      await waitFor(() => {
        expect(mockStorageManager.writeValue).toHaveBeenCalled();
      });

      expect(result.current[0]).toBe(newValue);
    });
  });
});

