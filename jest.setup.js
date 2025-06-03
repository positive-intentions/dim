// Add TextEncoder/TextDecoder for Jest environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add crypto API for Jest
const { webcrypto } = require('crypto');
global.crypto = webcrypto;

// Mock IndexedDB for tests
global.indexedDB = {
  open: jest.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: null
  }))
};