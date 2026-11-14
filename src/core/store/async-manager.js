import StorageManager from "./storage-manager";
import { debouncedDispatcher } from "./events.js";

const PERSIST_DEBOUNCE_MS = 300;

class AsyncronousStateManager {
  constructor(crypto = null) {
    this.store = {};
    // Per-key list of { id, setIsLoading }. Legacy tests may assign a
    // single function; clearLoading() accepts both shapes.
    this.loadingSetters = {};
    // Per-key list of { id, setIsSaving } for persistence status.
    this.savingSetters = {};
    this.eventListener = [];
    // Monotonic write generation per key. User setters bump this so stale
    // async encrypt/decrypt echoes cannot overwrite a newer local write.
    this.writeGen = {};
    // Last generation successfully written to IndexedDB (+ broadcast).
    this.persistedGen = {};
    // Debounced persist timers per key.
    this.persistTimers = {};
    this.crypto = crypto;
    this.db = new StorageManager(crypto);
    this.db.asyncManager = this; // Connect storage manager back to this
  }

  /**
   * Notify every loading subscriber for `key` (or a legacy single function).
   */
  clearLoading(key) {
    const entry = this.loadingSetters?.[key];
    if (!entry) return;
    if (typeof entry === "function") {
      entry(false);
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach((item) => {
        const setter = typeof item === "function" ? item : item?.setIsLoading;
        if (typeof setter === "function") setter(false);
      });
    }
  }

  /**
   * Notify every saving subscriber for `key`.
   */
  setSaving(key, isSaving) {
    const entry = this.savingSetters?.[key];
    if (!entry) return;
    if (Array.isArray(entry)) {
      entry.forEach((item) => {
        if (typeof item?.setIsSaving === "function") {
          item.setIsSaving(isSaving);
        }
      });
    }
  }

  /**
   * Register (or replace) a loading setter for a subscriber id on `key`.
   */
  addLoadingSetter(key, id, setIsLoading) {
    this.loadingSetters = this.loadingSetters || {};
    const existing = this.loadingSetters[key];
    if (typeof existing === "function") {
      // Promote legacy single-function shape to a list.
      this.loadingSetters[key] = [{ id: "__legacy", setIsLoading: existing }];
    } else if (!Array.isArray(this.loadingSetters[key])) {
      this.loadingSetters[key] = [];
    }
    this.loadingSetters[key] = this.loadingSetters[key].filter(
      (item) => item?.id !== id,
    );
    this.loadingSetters[key].push({ id, setIsLoading });
  }

  /**
   * Register (or replace) a saving setter for a subscriber id on `key`.
   */
  addSavingSetter(key, id, setIsSaving) {
    this.savingSetters = this.savingSetters || {};
    if (!Array.isArray(this.savingSetters[key])) {
      this.savingSetters[key] = [];
    }
    this.savingSetters[key] = this.savingSetters[key].filter(
      (item) => item?.id !== id,
    );
    this.savingSetters[key].push({ id, setIsSaving });
    // Reflect current pending state for late subscribers.
    const pending = (this.writeGen[key] || 0) > (this.persistedGen[key] || 0);
    setIsSaving(pending);
  }

  /**
   * Drop loading setters registered under `listenerId`.
   */
  removeLoadingSetters(listenerId) {
    if (!this.loadingSetters) return;
    Object.keys(this.loadingSetters).forEach((key) => {
      const entry = this.loadingSetters[key];
      if (!Array.isArray(entry)) return;
      this.loadingSetters[key] = entry.filter(
        (item) => item?.id !== listenerId,
      );
      if (this.loadingSetters[key].length === 0) {
        delete this.loadingSetters[key];
      }
    });
  }

  /**
   * Drop saving setters registered under `listenerId`.
   */
  removeSavingSetters(listenerId) {
    if (!this.savingSetters) return;
    Object.keys(this.savingSetters).forEach((key) => {
      const entry = this.savingSetters[key];
      if (!Array.isArray(entry)) return;
      this.savingSetters[key] = entry.filter((item) => item?.id !== listenerId);
      if (this.savingSetters[key].length === 0) {
        delete this.savingSetters[key];
      }
    });
  }

  /**
   * Persist the latest value for `key` (encrypt once, write DB, broadcast).
   */
  async flushPersist(key, eventName) {
    const gen = this.writeGen[key] || 0;
    const value = this.store[key];

    try {
      let dispatchDetail;
      if (this.crypto) {
        const encryptedValue = await this.crypto.encryptData(value);
        // A newer write landed while we were encrypting — abort this flush.
        if (this.writeGen[key] !== gen) return;
        await this.db.writeValue(key, encryptedValue);
        if (this.writeGen[key] !== gen) return;
        const encryptedObject = JSON.parse(encryptedValue);
        dispatchDetail = {
          ...encryptedObject,
          _dimWriteGen: gen,
        };
      } else {
        if (this.writeGen[key] !== gen) return;
        await this.db.writeValue(key, value);
        if (this.writeGen[key] !== gen) return;
        dispatchDetail = {
          _dimValue: value,
          _dimWriteGen: gen,
        };
      }

      this.persistedGen[key] = gen;
      debouncedDispatcher(eventName, dispatchDetail);

      // Only clear saving if nothing newer is pending.
      if (this.writeGen[key] === gen) {
        this.setSaving(key, false);
      }
    } catch (error) {
      console.error("Failed to persist value:", error);
      // Keep isSaving true so the UI does not claim "Saved" after a failure.
    }
  }

  schedulePersist(key, eventName) {
    if (this.persistTimers[key] !== undefined) {
      clearTimeout(this.persistTimers[key]);
    }
    this.persistTimers[key] = setTimeout(() => {
      this.persistTimers[key] = undefined;
      this.flushPersist(key, eventName);
    }, PERSIST_DEBOUNCE_MS);
  }

  generateListener(listener) {
    const { listenerId, key, value } = listener;

    // Capture the real useState setter BEFORE we wrap the slot.
    // (value may already be a length-4/5 enhanced tuple.)
    const originalSetter = value[1];

    // Remove existing event listeners if they exist
    const existingListeners = this.eventListener.filter(
      (listener) => listener.listenerId === listenerId && listener.key === key,
    );

    existingListeners.forEach((existingListener) => {
      window.removeEventListener(
        existingListener.eventName,
        existingListener.listener,
      );
    });

    this.eventListener = this.eventListener.filter(
      (listener) =>
        !(listener.listenerId === listenerId && listener.key === key),
    );

    // Create listeners for both regular updates and initial loads
    const listenerName = `${key}`;
    const initialLoadListenerName = `${key}-initialLoad-${listenerId}`;

    // Shared listener logic
    const createListener = (isInitialLoadEvent) => async (event) => {
      try {
        // Check if this is an initial load event (has _isInitialLoad flag)
        const isInitialLoad =
          isInitialLoadEvent || event.detail?._isInitialLoad;

        const eventGen =
          event.detail && typeof event.detail === "object"
            ? event.detail._dimWriteGen
            : undefined;

        let finalValue;
        if (isInitialLoad) {
          // For initial load, the value is already decrypted by storage manager
          finalValue = event.detail.value;
        } else if (this.crypto) {
          // For user updates, decrypt the value
          finalValue = await this.crypto.decryptData({
            ...event.detail,
            crypto: this.crypto,
          });
        } else if (
          event.detail &&
          typeof event.detail === "object" &&
          Object.prototype.hasOwnProperty.call(event.detail, "_dimValue")
        ) {
          // Plaintext dispatch wraps value so _dimWriteGen can ride along
          finalValue = event.detail._dimValue;
        } else {
          // No encryption: the dispatched detail is the plaintext value
          finalValue = event.detail;
        }

        // Re-check after await: a newer local write may have landed mid-decrypt.
        if (
          !isInitialLoad &&
          eventGen != null &&
          eventGen < (this.writeGen[key] || 0)
        ) {
          this.clearLoading(key);
          return;
        }

        // Update the store
        this.store = {
          ...this.store,
          [key]: finalValue,
        };

        if (eventGen != null) {
          this.writeGen[key] = Math.max(this.writeGen[key] || 0, eventGen);
          // Remote/echo apply that is current also counts as persisted.
          this.persistedGen[key] = Math.max(
            this.persistedGen[key] || 0,
            eventGen,
          );
          if ((this.writeGen[key] || 0) === (this.persistedGen[key] || 0)) {
            this.setSaving(key, false);
          }
        }

        // Update the component state directly without triggering another event
        const currentState = value[0];
        if (JSON.stringify(currentState) !== JSON.stringify(finalValue)) {
          originalSetter(finalValue);
        }

        this.clearLoading(key);
      } catch (error) {
        console.error("Failed to process event data:", error);
        this.clearLoading(key);
      }
    };

    // Create regular listener for global updates
    const regularListener = createListener(false);
    window.addEventListener(listenerName, regularListener);

    this.eventListener.push({
      listenerId,
      key,
      eventName: listenerName,
      listener: regularListener,
    });

    // Create initial load listener specific to this component
    const initialLoadListener = createListener(true);
    window.addEventListener(initialLoadListenerName, initialLoadListener);

    this.eventListener.push({
      listenerId,
      key,
      eventName: initialLoadListenerName,
      listener: initialLoadListener,
    });

    const newSetter = (newValue, isInternalUpdate = false) => {
      // Internal updates from our own event listener: only touch local state.
      if (isInternalUpdate) {
        originalSetter(newValue);
        return;
      }

      this.writeGen[key] = (this.writeGen[key] || 0) + 1;

      // Keep the manager cache in sync before re-render. Otherwise the next
      // generateListener() overwrites value[0] with a stale this.store[key]
      // (truthy empty/restored arrays beat the fresh useState value via ||).
      this.store = {
        ...this.store,
        [key]: newValue,
      };

      // User updates: update UI immediately, then debounce persist + broadcast.
      originalSetter(newValue);
      this.setSaving(key, true);
      this.schedulePersist(key, listenerName);
    };

    // Prefer cache when present — including empty arrays (do not use ||).
    const newState = this.store[key] !== undefined ? this.store[key] : value[0];

    return [newState, newSetter];
  }

  removeListeners(listenerId) {
    const existingListeners = this.eventListener.filter(
      (listener) => listener.listenerId === listenerId,
    );

    existingListeners.forEach((existingListener) => {
      window.removeEventListener(
        existingListener.eventName,
        existingListener.listener,
      );
    });

    this.eventListener = this.eventListener.filter(
      (listener) => listener.listenerId !== listenerId,
    );

    this.removeLoadingSetters(listenerId);
    this.removeSavingSetters(listenerId);
  }

  createListeners = (store, listenerId) => {
    const traverse = (obj, path) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key].length === undefined) {
          traverse(obj[key], `${path}${key}.`);
        } else {
          const fullKey = `${path}${key}`;

          const [asyncState, asyncSetState] = this.generateListener({
            listenerId,
            key: fullKey,
            value: obj[key],
          });

          // Preserve the loading/saving state info (indices 2+)
          obj[key][0] = asyncState;
          obj[key][1] = asyncSetState;
        }
      });
    };

    traverse(store, "");
  };
}

export default AsyncronousStateManager;
export { PERSIST_DEBOUNCE_MS };
