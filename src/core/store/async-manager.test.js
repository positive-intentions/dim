import AsyncronousStateManager, {
  PERSIST_DEBOUNCE_MS,
} from "./async-manager.js";
import CryptoManager from "./crypto-manager.js";
import StorageManager from "./storage-manager.js";

const flushPersist = () =>
  new Promise((resolve) => setTimeout(resolve, PERSIST_DEBOUNCE_MS + 50));

// Mock debouncedDispatcher (factory may only reference allowed globals like
// `globalThis`, not `window`).
jest.mock("./events.js", () => ({
  debouncedDispatcher: jest.fn((eventName, detail) => {
    globalThis.dispatchEvent(new CustomEvent(eventName, { detail }));
  }),
}));

describe("AsyncronousStateManager", () => {
  let asyncManager;
  let cryptoManager;
  const testPassword = "test-password";

  beforeEach(() => {
    // Low iteration count keeps PBKDF2 fast in tests.
    cryptoManager = new CryptoManager(testPassword, { iterations: 1000 });
    asyncManager = new AsyncronousStateManager(cryptoManager);

    // Clear any existing event listeners
    asyncManager.eventListener = [];
  });

  afterEach(() => {
    // Clean up event listeners
    asyncManager.eventListener.forEach((listener) => {
      window.removeEventListener(listener.eventName, listener.listener);
    });
  });

  describe("State Management", () => {
    test("should create listeners for state values", () => {
      const mockSetValue = jest.fn();
      const listener = {
        listenerId: "test-id",
        key: "testKey",
        value: ["initialValue", mockSetValue],
      };

      asyncManager.generateListener(listener);

      expect(asyncManager.eventListener.length).toBe(2); // Regular + initial load listener
      expect(asyncManager.eventListener[0].key).toBe("testKey");
    });

    test("should update state when event is dispatched", async () => {
      const mockSetValue = jest.fn();
      const listener = {
        listenerId: "test-id",
        key: "testKey",
        value: ["initialValue", mockSetValue],
      };

      asyncManager.generateListener(listener);

      // Encrypt data before dispatching
      const newValue = "updatedValue";
      const encryptedValue = await cryptoManager.encryptData(newValue);

      // Dispatch event
      const event = new CustomEvent("testKey", {
        detail: JSON.parse(encryptedValue),
      });
      window.dispatchEvent(event);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if setter was called with decrypted value
      expect(mockSetValue).toHaveBeenCalledWith(newValue);
      expect(asyncManager.store.testKey).toBe(newValue);
    });

    test("should handle initial load events", async () => {
      const mockSetValue = jest.fn();
      const mockSetLoading = jest.fn();

      asyncManager.loadingSetters = {
        testKey: mockSetLoading,
      };

      const listener = {
        listenerId: "test-id",
        key: "testKey",
        value: ["initialValue", mockSetValue],
      };

      asyncManager.generateListener(listener);

      // Dispatch initial load event (already decrypted)
      const event = new CustomEvent("testKey-initialLoad-test-id", {
        detail: {
          value: "loadedValue",
          _isInitialLoad: true,
        },
      });
      window.dispatchEvent(event);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if state was updated
      expect(mockSetValue).toHaveBeenCalledWith("loadedValue");
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    test("should handle errors gracefully", async () => {
      const mockSetValue = jest.fn();
      const mockSetLoading = jest.fn();

      asyncManager.loadingSetters = {
        testKey: mockSetLoading,
      };

      const listener = {
        listenerId: "test-id",
        key: "testKey",
        value: ["initialValue", mockSetValue],
      };

      asyncManager.generateListener(listener);

      // Dispatch invalid event
      const event = new CustomEvent("testKey", {
        detail: "invalid-data",
      });
      window.dispatchEvent(event);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Loading should be set to false even on error
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  describe("createListeners", () => {
    test("should create listeners for all store properties", () => {
      const store = {
        prop1: ["value1", jest.fn()],
        nested: {
          prop2: ["value2", jest.fn()],
        },
      };

      asyncManager.createListeners(store, "test-listener-id");

      // Should create listeners for prop1 and nested.prop2
      expect(asyncManager.eventListener.length).toBe(4); // 2 properties x 2 listeners each
    });

    test("should handle event dispatching with encryption", async () => {
      const mockSetValue = jest.fn();
      const store = {
        testProp: ["initial", mockSetValue],
      };

      asyncManager.createListeners(store, "test-listener-id");

      // Simulate an update through the wrapped setter
      const wrappedSetter = asyncManager.generateListener({
        listenerId: "test-listener-id",
        key: "testProp",
        value: store.testProp,
      });

      // The setter should be wrapped
      expect(store.testProp[1]).toBeDefined();
      expect(typeof store.testProp[1]).toBe("function");
    });
  });

  describe("removeListeners", () => {
    test("should remove all listeners for a given listenerId", () => {
      const store = {
        prop1: ["value1", jest.fn()],
        prop2: ["value2", jest.fn()],
      };

      asyncManager.createListeners(store, "test-listener-id");
      const initialCount = asyncManager.eventListener.length;

      asyncManager.removeListeners("test-listener-id");

      expect(asyncManager.eventListener.length).toBe(0);
    });
  });

  describe("write generation (stale echo guard)", () => {
    test("rapid successive sets leave state at the latest value", async () => {
      const mockSetValue = jest.fn();
      const mockSetSaving = jest.fn();
      const writeValue = jest.fn(async () => {});

      const manager = new AsyncronousStateManager(cryptoManager);
      manager.db.writeValue = writeValue;
      manager.addSavingSetter("raceKey", "race-sub", mockSetSaving);

      const [, setter] = manager.generateListener({
        listenerId: "race-id",
        key: "raceKey",
        value: ["", mockSetValue],
      });

      setter("a");
      setter("ab");

      expect(manager.store.raceKey).toBe("ab");
      expect(mockSetValue).toHaveBeenLastCalledWith("ab");
      expect(manager.writeGen.raceKey).toBe(2);
      expect(mockSetSaving).toHaveBeenCalledWith(true);

      await flushPersist();

      // One debounced flush of the latest value only.
      expect(writeValue).toHaveBeenCalledTimes(1);
      const persisted = writeValue.mock.calls[0][1];
      const decrypted = await cryptoManager.decryptData(persisted);
      expect(decrypted).toBe("ab");
      expect(manager.persistedGen.raceKey).toBe(2);
      expect(mockSetSaving).toHaveBeenCalledWith(false);

      manager.eventListener.forEach((listener) => {
        window.removeEventListener(listener.eventName, listener.listener);
      });
    });

    test("isSaving stays true until persist completes", async () => {
      const mockSetSaving = jest.fn();
      let resolveEncrypt;
      const encryptGate = new Promise((resolve) => {
        resolveEncrypt = resolve;
      });

      const gatedCrypto = {
        encryptData: jest.fn(async (value) => {
          await encryptGate;
          return cryptoManager.encryptData(value);
        }),
        decryptData: (payload) => cryptoManager.decryptData(payload),
      };

      const manager = new AsyncronousStateManager(gatedCrypto);
      manager.db.writeValue = jest.fn(async () => {});
      manager.addSavingSetter("saveKey", "save-sub", mockSetSaving);

      const [, setter] = manager.generateListener({
        listenerId: "save-id",
        key: "saveKey",
        value: ["", jest.fn()],
      });

      setter("draft");
      expect(mockSetSaving).toHaveBeenCalledWith(true);

      await flushPersist();
      // Still encrypting — not saved yet.
      expect(manager.persistedGen.saveKey).toBeUndefined();

      resolveEncrypt();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(manager.persistedGen.saveKey).toBe(1);
      expect(mockSetSaving).toHaveBeenCalledWith(false);

      manager.eventListener.forEach((listener) => {
        window.removeEventListener(listener.eventName, listener.listener);
      });
    });

    test("listener ignores encrypted events with a stale _dimWriteGen", async () => {
      const mockSetValue = jest.fn();
      asyncManager.generateListener({
        listenerId: "stale-echo-id",
        key: "echoKey",
        value: ["initial", mockSetValue],
      });

      // Simulate a newer local write already applied.
      asyncManager.writeGen.echoKey = 2;
      asyncManager.store.echoKey = "ab";
      mockSetValue.mockClear();

      const staleEncrypted = JSON.parse(await cryptoManager.encryptData("a"));
      window.dispatchEvent(
        new CustomEvent("echoKey", {
          detail: { ...staleEncrypted, _dimWriteGen: 1 },
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSetValue).not.toHaveBeenCalled();
      expect(asyncManager.store.echoKey).toBe("ab");
    });

    test("listener still applies events with a current _dimWriteGen", async () => {
      const mockSetValue = jest.fn();
      asyncManager.generateListener({
        listenerId: "fresh-echo-id",
        key: "freshKey",
        value: ["initial", mockSetValue],
      });
      asyncManager.writeGen.freshKey = 1;
      mockSetValue.mockClear();

      const encrypted = JSON.parse(await cryptoManager.encryptData("latest"));
      window.dispatchEvent(
        new CustomEvent("freshKey", {
          detail: { ...encrypted, _dimWriteGen: 2 },
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSetValue).toHaveBeenCalledWith("latest");
      expect(asyncManager.store.freshKey).toBe("latest");
      expect(asyncManager.writeGen.freshKey).toBe(2);
    });
  });

  describe("Integration with StorageManager", () => {
    test("should connect storage manager", () => {
      const storageManager = new StorageManager(cryptoManager);
      asyncManager.db = storageManager;
      storageManager.asyncManager = asyncManager;

      expect(asyncManager.db).toBe(storageManager);
      expect(storageManager.asyncManager).toBe(asyncManager);
    });
  });

  describe("Plaintext mode (no encryption)", () => {
    let plainManager;

    beforeEach(() => {
      plainManager = new AsyncronousStateManager(null);
      plainManager.eventListener = [];
    });

    afterEach(() => {
      plainManager.eventListener.forEach((listener) => {
        window.removeEventListener(listener.eventName, listener.listener);
      });
    });

    test("updates state from a plaintext dispatched event", async () => {
      const mockSetValue = jest.fn();
      plainManager.generateListener({
        listenerId: "plain-id",
        key: "plainKey",
        value: ["initial", mockSetValue],
      });

      // No encryption: the dispatched detail is the plaintext value directly.
      window.dispatchEvent(new CustomEvent("plainKey", { detail: "updated" }));

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockSetValue).toHaveBeenCalledWith("updated");
      expect(plainManager.store.plainKey).toBe("updated");
    });

    test("setter dispatches plaintext (not an encrypted payload)", async () => {
      const { debouncedDispatcher } = require("./events.js");
      debouncedDispatcher.mockClear();

      plainManager.db.writeValue = jest.fn(async () => {});

      const [, setter] = plainManager.generateListener({
        listenerId: "plain-id-2",
        key: "plainKey2",
        value: ["initial", jest.fn()],
      });

      setter("newValue");
      await flushPersist();

      expect(debouncedDispatcher).toHaveBeenCalledWith("plainKey2", {
        _dimValue: "newValue",
        _dimWriteGen: 1,
      });
    });

    test("wrapped setter updates original useState immediately", () => {
      const mockSetValue = jest.fn();
      const [, setter] = plainManager.generateListener({
        listenerId: "immediate-id",
        key: "immediateKey",
        value: ["initial", mockSetValue],
      });

      setter("right-away");

      // Must not wait on the debounced CustomEvent — first call is synchronous.
      expect(mockSetValue).toHaveBeenCalled();
      expect(mockSetValue.mock.calls[0]).toEqual(["right-away"]);
    });

    test("user setter syncs manager cache so re-generateListener is not stale", () => {
      const oldList = [{ id: "old" }];
      const newList = [{ id: "new" }, { id: "old" }];
      plainManager.store.staleKey = oldList;

      const mockSetValue = jest.fn();
      const [, setter] = plainManager.generateListener({
        listenerId: "stale-id",
        key: "staleKey",
        value: [oldList, mockSetValue],
      });

      setter(newList);
      expect(plainManager.store.staleKey).toBe(newList);

      // Next render path: generateListener again with the useState tuple still
      // holding oldList at value[0] — cache must win with the new list.
      const [state] = plainManager.generateListener({
        listenerId: "stale-id",
        key: "staleKey",
        value: [oldList, mockSetValue],
      });
      expect(state).toBe(newList);
      expect(state).not.toBe(oldList);
    });

    test("clearLoading notifies every multicast subscriber", () => {
      const a = jest.fn();
      const b = jest.fn();
      plainManager.addLoadingSetter("sharedKey", "sub-a", a);
      plainManager.addLoadingSetter("sharedKey", "sub-b", b);

      plainManager.clearLoading("sharedKey");

      expect(a).toHaveBeenCalledWith(false);
      expect(b).toHaveBeenCalledWith(false);
    });

    test("clearLoading still supports a legacy single-function setter", () => {
      const setLoading = jest.fn();
      plainManager.loadingSetters.legacyKey = setLoading;
      plainManager.clearLoading("legacyKey");
      expect(setLoading).toHaveBeenCalledWith(false);
    });

    test("removeListeners drops that subscriber loading setters only", () => {
      const a = jest.fn();
      const b = jest.fn();
      plainManager.addLoadingSetter("sharedKey", "sub-a", a);
      plainManager.addLoadingSetter("sharedKey", "sub-b", b);

      plainManager.removeListeners("sub-a");
      plainManager.clearLoading("sharedKey");

      expect(a).not.toHaveBeenCalled();
      expect(b).toHaveBeenCalledWith(false);
    });
  });
});
