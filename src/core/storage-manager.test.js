import StorageManager from './storage-manager.js';
import CryptoManager from './crypto-manager.js';

// Mock debouncedDispatcher so we can assert dispatched initial-load events.
jest.mock('./mini-lit.js', () => ({
  debouncedDispatcher: jest.fn()
}));

import { debouncedDispatcher } from './mini-lit.js';

// Low iteration count keeps PBKDF2 fast in tests.
const makeCrypto = (password) => new CryptoManager(password, { iterations: 1000 });

// Unique key generator so tests do not collide in the shared fake IndexedDB.
let keyCounter = 0;
const uniqueKey = (prefix = 'k') => `${prefix}-${Date.now()}-${keyCounter++}`;

describe('StorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Plaintext storage (no crypto)', () => {
    test('writes and reads back a value', async () => {
      const sm = new StorageManager(null);
      const id = uniqueKey('plain');

      await sm.writeValue(id, 'hello world');
      const result = await sm.readValue(id, null);

      expect(result).toEqual({ value: 'hello world', newState: null });
    });

    test('returns null for a non-existent key', async () => {
      const sm = new StorageManager(null);
      const result = await sm.readValue(uniqueKey('missing'), null);
      expect(result).toBe(null);
    });

    test('passes through newState', async () => {
      const sm = new StorageManager(null);
      const id = uniqueKey('plain');
      const newState = ['state', jest.fn()];

      await sm.writeValue(id, 'value');
      const result = await sm.readValue(id, newState);

      expect(result.value).toBe('value');
      expect(result.newState).toBe(newState);
    });
  });

  describe('Encrypted storage', () => {
    test('round-trips an encrypted value with the correct password', async () => {
      const crypto = makeCrypto('correct-password');
      const sm = new StorageManager(crypto);
      const id = uniqueKey('enc');
      const original = 'secret value';

      const encrypted = await crypto.encryptData(original);
      await sm.writeValue(id, encrypted);

      const result = await sm.readValue(id, null);
      expect(result.value).toBe(original);
    });

    test('rejects when reading with the wrong password', async () => {
      const writeCrypto = makeCrypto('correct-password');
      const writeSm = new StorageManager(writeCrypto);
      const id = uniqueKey('enc');

      const encrypted = await writeCrypto.encryptData('secret');
      await writeSm.writeValue(id, encrypted);

      const wrongCrypto = makeCrypto('wrong-password');
      const wrongSm = new StorageManager(wrongCrypto);

      await expect(wrongSm.readValue(id, null)).rejects.toThrow();
    });
  });

  describe('Instance scoping', () => {
    test('two managers share the underlying database', async () => {
      const writer = new StorageManager(null);
      const reader = new StorageManager(null);
      const id = uniqueKey('shared');

      await writer.writeValue(id, 'shared-value');
      const result = await reader.readValue(id, null);

      expect(result.value).toBe('shared-value');
    });
  });

  describe('loadFromDatabase', () => {
    test('dispatches initial-load events for stored values', async () => {
      const sm = new StorageManager(null);
      const prop1Key = uniqueKey('p1');
      const prop2Key = uniqueKey('p2');

      sm.asyncManager = { loadingSetters: {} };

      const store = {
        [prop1Key]: ['v1', jest.fn()],
        nested: {
          [prop2Key]: ['v2', jest.fn()]
        }
      };

      // Bypass real IndexedDB reads to focus on dispatch behaviour.
      sm.readValue = jest.fn()
        .mockResolvedValueOnce({ value: 'loaded1' })
        .mockResolvedValueOnce({ value: 'loaded2' });

      sm.loadFromDatabase(store, 'listener-id');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(debouncedDispatcher).toHaveBeenCalledWith(
        `${prop1Key}-initialLoad-listener-id`,
        { value: 'loaded1', _isInitialLoad: true }
      );
      expect(debouncedDispatcher).toHaveBeenCalledWith(
        `nested.${prop2Key}-initialLoad-listener-id`,
        { value: 'loaded2', _isInitialLoad: true }
      );
    });

    test('sets loading to false when no value exists', async () => {
      const sm = new StorageManager(null);
      const setLoading = jest.fn();
      const propKey = uniqueKey('p');

      sm.asyncManager = { loadingSetters: { [propKey]: setLoading } };

      const store = { [propKey]: ['v1', jest.fn()] };
      sm.readValue = jest.fn().mockResolvedValue(null);

      sm.loadFromDatabase(store, 'listener-id');

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(setLoading).toHaveBeenCalledWith(false);
    });
  });
});
