/**
 * Persists the user-granted native root FileSystemDirectoryHandle in
 * IndexedDB (structured clone). Auto-restore runs in useFS (FSA mode).
 *
 * Uses the same db/store/key as ui/src/utils/nativeFsHandlePersistence.ts
 * so handles saved from either package are compatible.
 */

const DB_NAME = 'pi-files-native-fs';
const DB_VERSION = 1;
const STORE_NAME = 'root';
const KEY_ROOT = 'root';

function idbAvailable() {
  return typeof indexedDB !== 'undefined' && typeof indexedDB.open === 'function';
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

/** Saves the root directory handle for native (FSA) file storage. */
export async function saveRootDirectoryHandle(handle) {
  if (!idbAvailable()) return;
  let db;
  try {
    db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(handle, KEY_ROOT);
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB write failed'));
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB write aborted'));
    });
  } catch (e) {
    console.warn('[pi-files] Could not persist directory handle:', e);
  } finally {
    db?.close();
  }
}

/** Loads a previously saved root handle, or null if none / unsupported / error. */
export async function loadRootDirectoryHandle() {
  if (!idbAvailable()) return null;
  let db;
  try {
    db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const handle = await reqToPromise(store.get(KEY_ROOT));
    return handle ?? null;
  } catch (e) {
    console.warn('[pi-files] Could not load directory handle:', e);
    return null;
  } finally {
    db?.close();
  }
}

/** Removes the saved root handle (e.g. when switching back to OPFS). */
export async function clearRootDirectoryHandle() {
  if (!idbAvailable()) return;
  let db;
  try {
    db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(KEY_ROOT);
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'));
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB delete aborted'));
    });
  } catch (e) {
    console.warn('[pi-files] Could not clear directory handle:', e);
  } finally {
    db?.close();
  }
}
