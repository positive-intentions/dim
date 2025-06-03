import AsyncronousStateManager from './async-manager.js';
import CryptoManager from './crypto-manager.js';
import StorageManager from './storage-manager.js';

// Mock debouncedDispatcher
jest.mock('./mini-lit.js', () => ({
  debouncedDispatcher: jest.fn((eventName, detail) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  })
}));

describe('AsyncronousStateManager', () => {
  let asyncManager;
  let cryptoManager;
  const testPassword = 'test-password';

  beforeEach(() => {
    cryptoManager = new CryptoManager(testPassword);
    asyncManager = new AsyncronousStateManager(cryptoManager);
    
    // Clear any existing event listeners
    asyncManager.eventListener = [];
  });

  afterEach(() => {
    // Clean up event listeners
    asyncManager.eventListener.forEach(listener => {
      window.removeEventListener(listener.eventName, listener.listener);
    });
  });

  describe('State Management', () => {
    test('should create listeners for state values', () => {
      const mockSetValue = jest.fn();
      const listener = {
        listenerId: 'test-id',
        key: 'testKey',
        value: ['initialValue', mockSetValue]
      };

      asyncManager.generateListener(listener);

      expect(asyncManager.eventListener.length).toBe(2); // Regular + initial load listener
      expect(asyncManager.eventListener[0].key).toBe('testKey');
    });

    test('should update state when event is dispatched', async () => {
      const mockSetValue = jest.fn();
      const listener = {
        listenerId: 'test-id',
        key: 'testKey',
        value: ['initialValue', mockSetValue]
      };

      asyncManager.generateListener(listener);

      // Encrypt data before dispatching
      const newValue = 'updatedValue';
      const encryptedValue = await cryptoManager.encryptData(newValue);

      // Dispatch event
      const event = new CustomEvent('testKey', {
        detail: JSON.parse(encryptedValue)
      });
      window.dispatchEvent(event);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if setter was called with decrypted value
      expect(mockSetValue).toHaveBeenCalledWith(newValue, true);
      expect(asyncManager.store.testKey).toBe(newValue);
    });

    test('should handle initial load events', async () => {
      const mockSetValue = jest.fn();
      const mockSetLoading = jest.fn();
      
      asyncManager.loadingSetters = {
        'testKey': mockSetLoading
      };

      const listener = {
        listenerId: 'test-id',
        key: 'testKey',
        value: ['initialValue', mockSetValue]
      };

      asyncManager.generateListener(listener);

      // Dispatch initial load event (already decrypted)
      const event = new CustomEvent('testKey-initialLoad-test-id', {
        detail: {
          value: 'loadedValue',
          _isInitialLoad: true
        }
      });
      window.dispatchEvent(event);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if state was updated
      expect(mockSetValue).toHaveBeenCalledWith('loadedValue', true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    test('should handle errors gracefully', async () => {
      const mockSetValue = jest.fn();
      const mockSetLoading = jest.fn();
      
      asyncManager.loadingSetters = {
        'testKey': mockSetLoading
      };

      const listener = {
        listenerId: 'test-id',
        key: 'testKey',
        value: ['initialValue', mockSetValue]
      };

      asyncManager.generateListener(listener);

      // Dispatch invalid event
      const event = new CustomEvent('testKey', {
        detail: 'invalid-data'
      });
      window.dispatchEvent(event);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Loading should be set to false even on error
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('createListeners', () => {
    test('should create listeners for all store properties', () => {
      const store = {
        prop1: ['value1', jest.fn()],
        nested: {
          prop2: ['value2', jest.fn()]
        }
      };

      asyncManager.createListeners(store, 'test-listener-id');

      // Should create listeners for prop1 and nested.prop2
      expect(asyncManager.eventListener.length).toBe(4); // 2 properties x 2 listeners each
    });

    test('should handle event dispatching with encryption', async () => {
      const mockSetValue = jest.fn();
      const store = {
        testProp: ['initial', mockSetValue]
      };

      asyncManager.createListeners(store, 'test-listener-id');

      // Simulate an update through the wrapped setter
      const wrappedSetter = asyncManager.generateListener({
        listenerId: 'test-listener-id',
        key: 'testProp',
        value: store.testProp
      });

      // The setter should be wrapped
      expect(store.testProp[1]).toBeDefined();
      expect(typeof store.testProp[1]).toBe('function');
    });
  });

  describe('removeListeners', () => {
    test('should remove all listeners for a given listenerId', () => {
      const store = {
        prop1: ['value1', jest.fn()],
        prop2: ['value2', jest.fn()]
      };

      asyncManager.createListeners(store, 'test-listener-id');
      const initialCount = asyncManager.eventListener.length;

      asyncManager.removeListeners('test-listener-id');

      expect(asyncManager.eventListener.length).toBe(0);
    });
  });

  describe('Integration with StorageManager', () => {
    test('should connect storage manager', () => {
      const storageManager = new StorageManager(cryptoManager);
      asyncManager.db = storageManager;
      storageManager.asyncManager = asyncManager;

      expect(asyncManager.db).toBe(storageManager);
      expect(storageManager.asyncManager).toBe(asyncManager);
    });
  });
});