import StorageManager from './storage-manager.js';
import CryptoManager from './crypto-manager.js';

// Mock IndexedDB
const mockDB = {
  transaction: jest.fn(),
  objectStoreNames: {
    contains: jest.fn()
  }
};

const mockTransaction = {
  objectStore: jest.fn()
};

const mockObjectStore = {
  put: jest.fn(),
  get: jest.fn()
};

// Mock debouncedDispatcher
jest.mock('./mini-lit.js', () => ({
  debouncedDispatcher: jest.fn()
}));

import { debouncedDispatcher } from './mini-lit.js';

describe('StorageManager', () => {
  let storageManager;
  let cryptoManager;
  const testPassword = 'test-password';

  beforeEach(() => {
    cryptoManager = new CryptoManager(testPassword);
    
    // Mock IndexedDB
    global.indexedDB = {
      open: jest.fn(() => ({
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        result: mockDB
      }))
    };

    mockDB.transaction.mockReturnValue(mockTransaction);
    mockTransaction.objectStore.mockReturnValue(mockObjectStore);
    
    jest.clearAllMocks();
  });

  describe('Database Operations', () => {
    test('should open database on initialization', async () => {
      storageManager = new StorageManager(cryptoManager);
      
      // Simulate successful DB open
      const openRequest = indexedDB.open.mock.results[0].value;
      openRequest.onsuccess({ target: { result: mockDB } });

      expect(indexedDB.open).toHaveBeenCalledWith('DimDatabase', 1);
    });

    test('should write encrypted value to database', async () => {
      storageManager = new StorageManager(cryptoManager);
      
      // Simulate successful DB open
      const openRequest = indexedDB.open.mock.results[0].value;
      openRequest.onsuccess({ target: { result: mockDB } });

      const mockRequest = {
        onsuccess: null,
        onerror: null
      };
      mockObjectStore.put.mockReturnValue(mockRequest);

      const id = 'testKey';
      const encryptedValue = await cryptoManager.encryptData('testValue');

      const writePromise = storageManager.writeValue(id, encryptedValue);
      
      // Simulate successful write
      mockRequest.onsuccess({});

      await writePromise;

      expect(mockObjectStore.put).toHaveBeenCalledWith({
        id: id,
        value: encryptedValue
      });
    });

    test('should read and decrypt value from database', async () => {
      storageManager = new StorageManager(cryptoManager);
      
      // Simulate successful DB open
      const openRequest = indexedDB.open.mock.results[0].value;
      openRequest.onsuccess({ target: { result: mockDB } });

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: null
      };
      mockObjectStore.get.mockReturnValue(mockRequest);

      const id = 'testKey';
      const originalValue = 'testValue';
      const encryptedValue = await cryptoManager.encryptData(originalValue);

      const readPromise = storageManager.readValue(id, ['state', jest.fn()]);
      
      // Simulate successful read
      mockRequest.result = { id, value: encryptedValue };
      await mockRequest.onsuccess({});

      const result = await readPromise;

      expect(result).toEqual({
        value: originalValue,
        newState: ['state', jest.fn()]
      });
    });

    test('should handle non-encrypted legacy data', async () => {
      storageManager = new StorageManager(cryptoManager);
      
      // Simulate successful DB open
      const openRequest = indexedDB.open.mock.results[0].value;
      openRequest.onsuccess({ target: { result: mockDB } });

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: null
      };
      mockObjectStore.get.mockReturnValue(mockRequest);

      const id = 'testKey';
      const plainValue = 'plainTextValue';

      const readPromise = storageManager.readValue(id, ['state', jest.fn()]);
      
      // Simulate successful read with plain value
      mockRequest.result = { id, value: plainValue };
      await mockRequest.onsuccess({});

      const result = await readPromise;

      expect(result).toEqual({
        value: plainValue,
        newState: ['state', jest.fn()]
      });
    });

    test('should return null for non-existent values', async () => {
      storageManager = new StorageManager(cryptoManager);
      
      // Simulate successful DB open
      const openRequest = indexedDB.open.mock.results[0].value;
      openRequest.onsuccess({ target: { result: mockDB } });

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: null
      };
      mockObjectStore.get.mockReturnValue(mockRequest);

      const readPromise = storageManager.readValue('nonExistent', ['state', jest.fn()]);
      
      // Simulate no result
      await mockRequest.onsuccess({});

      const result = await readPromise;
      expect(result).toBe(null);
    });
  });

  describe('loadFromDatabase', () => {
    test('should load all store values from database', async () => {
      storageManager = new StorageManager(cryptoManager);
      
      // Mock async manager
      const mockAsyncManager = {
        loadingSetters: {
          'prop1': jest.fn(),
          'nested.prop2': jest.fn()
        }
      };
      storageManager.asyncManager = mockAsyncManager;

      const store = {
        prop1: ['value1', jest.fn()],
        nested: {
          prop2: ['value2', jest.fn()]
        }
      };

      // Mock readValue to return encrypted values
      storageManager.readValue = jest.fn()
        .mockResolvedValueOnce({ value: 'loadedValue1' })
        .mockResolvedValueOnce({ value: 'loadedValue2' });

      storageManager.loadFromDatabase(store, 'listener-id');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should dispatch events for loaded values
      expect(debouncedDispatcher).toHaveBeenCalledWith(
        'prop1-initialLoad-listener-id',
        { value: 'loadedValue1', _isInitialLoad: true }
      );
      expect(debouncedDispatcher).toHaveBeenCalledWith(
        'nested.prop2-initialLoad-listener-id',
        { value: 'loadedValue2', _isInitialLoad: true }
      );
    });

    test('should set loading to false when no value exists', async () => {
      storageManager = new StorageManager(cryptoManager);
      
      // Mock async manager
      const mockSetLoading = jest.fn();
      const mockAsyncManager = {
        loadingSetters: {
          'prop1': mockSetLoading
        }
      };
      storageManager.asyncManager = mockAsyncManager;

      const store = {
        prop1: ['value1', jest.fn()]
      };

      // Mock readValue to return null
      storageManager.readValue = jest.fn().mockResolvedValue(null);

      storageManager.loadFromDatabase(store, 'listener-id');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should set loading to false
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });
});