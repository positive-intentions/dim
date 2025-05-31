import { useState } from './useState.js';
import { useEffect } from './useEffect.js';
import AsyncronousStateManager from '../async-manager.js';
import StorageManager from '../storage-manager.js';

const asyncronousStateManager = new AsyncronousStateManager();
const storageManager = new StorageManager();

export const useStore = (store) => {
  const [randomId] = useState(crypto.getRandomValues(new Uint8Array(8)));

  asyncronousStateManager.createListeners(store, randomId);

  useEffect(() => {
    storageManager.loadFromDatabase(store);
    return () => {
      asyncronousStateManager.removeListeners(randomId);
    };
  }, []);

  return store;
};