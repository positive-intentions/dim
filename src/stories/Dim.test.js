import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const crypto = require('crypto');

// Define global crypto object with both getRandomValues and subtle
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    subtle: {
      digest: async (algorithm, data) => {
        // Ensure the algorithm is compatible with Node.js crypto module
        let nodeAlgorithm;
        switch (algorithm) {
          case 'SHA-256':
            nodeAlgorithm = 'sha256';
            break;
          case 'SHA-1':
            nodeAlgorithm = 'sha1';
            break;
          // Add cases for other algorithms as needed
          default:
            throw new Error('Unsupported algorithm');
        }
        const hash = crypto.createHash(nodeAlgorithm);
        hash.update(data);
        return new Uint8Array(hash.digest());
      },
    },
  }
});

// Add polyfill for window.alert()
global.alert = jest.fn();

describe('Dim Framework Tests', () => {
  it('should run the individual module tests', () => {
    // This test file serves as an entry point
    // The actual tests are in separate files:
    // - mini-lit.test.js
    // - async-manager.test.js
    // - storage-manager.test.js
    // - dim.test.js (to be created)
    
    expect(true).toBe(true);
  });

  it('should have proper test coverage across all modules', () => {
    // This is a placeholder to ensure jest runs
    // Real tests are in module-specific test files
    expect(1 + 1).toBe(2);
  });
});