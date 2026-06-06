import CryptoManager from './crypto-manager.js';

// Use a low PBKDF2 iteration count to keep tests fast.
const makeManager = (password) => new CryptoManager(password, { iterations: 1000 });

describe('CryptoManager', () => {
  let cryptoManager;
  const testPassword = 'test-password-123';

  beforeEach(() => {
    cryptoManager = makeManager(testPassword);
  });

  describe('Key Generation', () => {
    test('should derive an AES-GCM key from password and salt', async () => {
      const salt = new Uint8Array(16).fill(7);
      const key = await cryptoManager.getKeyFromPassword(testPassword, salt);
      expect(key).toBeDefined();
      expect(key.constructor.name).toBe('CryptoKey');
      expect(key.algorithm.name).toBe('AES-GCM');
    });

    test('should derive the same key for the same password and salt', async () => {
      const salt = new Uint8Array(16).fill(9);
      const key1 = await cryptoManager.getKeyFromPassword(testPassword, salt);
      const key2 = await cryptoManager.getKeyFromPassword(testPassword, salt);

      const exported1 = await crypto.subtle.exportKey('raw', key1);
      const exported2 = await crypto.subtle.exportKey('raw', key2);

      expect(new Uint8Array(exported1)).toEqual(new Uint8Array(exported2));
    });

    test('should derive different keys for different salts', async () => {
      const saltA = new Uint8Array(16).fill(1);
      const saltB = new Uint8Array(16).fill(2);
      const keyA = await cryptoManager.getKeyFromPassword(testPassword, saltA);
      const keyB = await cryptoManager.getKeyFromPassword(testPassword, saltB);

      const exportedA = await crypto.subtle.exportKey('raw', keyA);
      const exportedB = await crypto.subtle.exportKey('raw', keyB);

      expect(new Uint8Array(exportedA)).not.toEqual(new Uint8Array(exportedB));
    });

    test('generateKey wrapper still returns a usable AES-GCM key', async () => {
      const key = await cryptoManager.generateKey(testPassword);
      expect(key.algorithm.name).toBe('AES-GCM');
    });
  });

  describe('Encryption/Decryption', () => {
    test('payload embeds encryptedData, iv and salt', async () => {
      const encrypted = await cryptoManager.encryptData('hello');
      const parsed = JSON.parse(encrypted);
      expect(parsed.encryptedData).toBeDefined();
      expect(parsed.iv).toBeDefined();
      expect(parsed.salt).toBeDefined();
    });

    test('should encrypt and decrypt string data', async () => {
      const originalData = 'Hello, World!';
      const encrypted = await cryptoManager.encryptData(originalData);
      const decrypted = await cryptoManager.decryptData(encrypted);
      expect(decrypted).toBe(originalData);
    });

    test('should encrypt and decrypt object data', async () => {
      const originalData = { name: 'test', value: 123, nested: { foo: 'bar' } };
      const encrypted = await cryptoManager.encryptData(originalData);
      const decrypted = await cryptoManager.decryptData(encrypted);
      expect(decrypted).toEqual(originalData);
    });

    test('should encrypt and decrypt array data', async () => {
      const originalData = [1, 2, 3, 'test', { foo: 'bar' }];
      const encrypted = await cryptoManager.encryptData(originalData);
      const decrypted = await cryptoManager.decryptData(encrypted);
      expect(decrypted).toEqual(originalData);
    });

    test('should handle null', async () => {
      const encrypted = await cryptoManager.encryptData(null);
      const decrypted = await cryptoManager.decryptData(encrypted);
      expect(decrypted).toBe(null);
    });

    test('should handle empty strings', async () => {
      const encrypted = await cryptoManager.encryptData('');
      const decrypted = await cryptoManager.decryptData(encrypted);
      expect(decrypted).toBe('');
    });

    test('uses a different random salt for each encryption of the same plaintext', async () => {
      const originalData = 'Same data';
      const encrypted1 = await cryptoManager.encryptData(originalData);
      const encrypted2 = await cryptoManager.encryptData(originalData);

      const parsed1 = JSON.parse(encrypted1);
      const parsed2 = JSON.parse(encrypted2);

      // Random per-record salt => different salt and different ciphertext
      expect(parsed1.salt).not.toBe(parsed2.salt);
      expect(encrypted1).not.toBe(encrypted2);

      // Both still decrypt to the same value
      expect(await cryptoManager.decryptData(encrypted1)).toBe(originalData);
      expect(await cryptoManager.decryptData(encrypted2)).toBe(originalData);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid encrypted data', async () => {
      await expect(cryptoManager.decryptData('invalid data')).rejects.toThrow();
    });

    test('should throw error for corrupted encrypted data', async () => {
      const encrypted = await cryptoManager.encryptData('test');
      const parsed = JSON.parse(encrypted);
      parsed.encryptedData = 'corrupted';
      await expect(cryptoManager.decryptData(JSON.stringify(parsed))).rejects.toThrow();
    });

    test('should reject decryption with wrong password', async () => {
      const encrypted = await cryptoManager.encryptData('test data');
      const wrongCryptoManager = makeManager('wrong-password');
      await expect(wrongCryptoManager.decryptData(encrypted)).rejects.toThrow();
    });

    test('should return decrypted value, not encrypted payload structure', async () => {
      const originalData = 'test string';
      const encrypted = await cryptoManager.encryptData(originalData);
      const decrypted = await cryptoManager.decryptData(encrypted);

      expect(decrypted).toBe(originalData);
      expect(typeof decrypted).toBe('string');
      expect(decrypted).not.toHaveProperty('encryptedData');
      expect(decrypted).not.toHaveProperty('iv');
    });

    test('should throw specific error message for password mismatch', async () => {
      const encrypted = await cryptoManager.encryptData('sensitive data');
      const wrongCryptoManager = makeManager('different-password');

      await expect(wrongCryptoManager.decryptData(encrypted)).rejects.toThrow(
        /Decryption failed/
      );
    });

    test('should reject when iv is invalid', async () => {
      const encrypted = await cryptoManager.encryptData('test');
      const parsed = JSON.parse(encrypted);
      parsed.iv = 'invalid-iv-data';
      await expect(cryptoManager.decryptData(JSON.stringify(parsed))).rejects.toThrow();
    });
  });

  describe('Integration with Event Details', () => {
    test('should decrypt from event-detail object that includes a crypto reference', async () => {
      const encrypted = await cryptoManager.encryptData('testData');
      const eventDetail = { ...JSON.parse(encrypted), crypto: cryptoManager };
      const decrypted = await cryptoManager.decryptData(eventDetail);
      expect(decrypted).toBe('testData');
    });
  });
});
