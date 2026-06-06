// structuredClone is used by fake-indexeddb but is not present on the jsdom
// global. Polyfill it before importing fake-indexeddb. Our stored values are
// JSON-serializable, so a JSON-based clone is sufficient for tests.
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (value) =>
    value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

// Provide a real (fake) IndexedDB implementation for tests
import 'fake-indexeddb/auto';

// Add TextEncoder/TextDecoder for the jsdom environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Provide the Web Crypto API (subtle + getRandomValues) backed by Node.
// `globalThis.crypto` is a read-only accessor in modern Node, so a plain
// assignment is silently ignored; use defineProperty to force it.
const { webcrypto } = require('crypto');

if (!globalThis.crypto || !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}
