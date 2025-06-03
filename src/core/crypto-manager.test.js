import CryptoManager from './crypto-manager.js';

describe('CryptoManager', () => {
  let cryptoManager;
  const testPassword = 'test-password-123';

  beforeEach(() => {
    cryptoManager = new CryptoManager(testPassword);
  });

  describe('Key Generation', () => {
    test('should generate a key from password', async () => {
      const key = await cryptoManager.getKeyFromPassword(testPassword);
      expect(key).toBeDefined();
      expect(key.constructor.name).toBe('CryptoKey');
      expect(key.algorithm.name).toBe('AES-GCM');
    });

    test('should generate same key for same password', async () => {
      const key1 = await cryptoManager.getKeyFromPassword(testPassword);
      const key2 = await cryptoManager.getKeyFromPassword(testPassword);
      
      // Export keys to compare
      const exported1 = await crypto.subtle.exportKey('raw', key1);
      const exported2 = await crypto.subtle.exportKey('raw', key2);
      
      expect(new Uint8Array(exported1)).toEqual(new Uint8Array(exported2));
    });
  });

  describe('Encryption/Decryption', () => {
    test('should encrypt and decrypt string data', async () => {
      const originalData = 'Hello, World!';
      
      const encrypted = await cryptoManager.encryptData(originalData);
      console.log('Encrypted:', encrypted);
      
      // Encrypted should be a JSON string with encryptedData and iv
      const parsed = JSON.parse(encrypted);
      expect(parsed.encryptedData).toBeDefined();
      expect(parsed.iv).toBeDefined();
      
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

    test('should handle null and undefined', async () => {
      const encrypted1 = await cryptoManager.encryptData(null);
      const decrypted1 = await cryptoManager.decryptData(encrypted1);
      expect(decrypted1).toBe(null);
      
      const encrypted2 = await cryptoManager.encryptData(undefined);
      const decrypted2 = await cryptoManager.decryptData(encrypted2);
      expect(decrypted2).toBe(undefined);
    });

    test('should handle empty strings', async () => {
      const originalData = '';
      
      const encrypted = await cryptoManager.encryptData(originalData);
      const decrypted = await cryptoManager.decryptData(encrypted);
      
      expect(decrypted).toBe(originalData);
    });

    test('should produce different ciphertext for same plaintext (due to random IV)', async () => {
      const originalData = 'Same data';
      
      const encrypted1 = await cryptoManager.encryptData(originalData);
      const encrypted2 = await cryptoManager.encryptData(originalData);
      
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to same value
      const decrypted1 = await cryptoManager.decryptData(encrypted1);
      const decrypted2 = await cryptoManager.decryptData(encrypted2);
      
      expect(decrypted1).toBe(originalData);
      expect(decrypted2).toBe(originalData);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid encrypted data', async () => {
      await expect(cryptoManager.decryptData('invalid data')).rejects.toThrow();
    });

    test('should throw error for corrupted encrypted data', async () => {
      const originalData = 'test';
      const encrypted = await cryptoManager.encryptData(originalData);
      const parsed = JSON.parse(encrypted);
      
      // Corrupt the encrypted data
      parsed.encryptedData = 'corrupted';
      const corrupted = JSON.stringify(parsed);
      
      await expect(cryptoManager.decryptData(corrupted)).rejects.toThrow();
    });
  });

  describe('Integration with Event Details', () => {
    test('should handle event detail format', async () => {
      const eventDetail = {
        key: 'testKey',
        value: 'testValue',
        crypto: cryptoManager
      };
      
      // Test decrypting from event detail format
      const encrypted = await cryptoManager.encryptData('testData');
      const eventWithEncrypted = {
        ...eventDetail,
        value: encrypted
      };
      
      const decrypted = await cryptoManager.decryptData(eventWithEncrypted);
      expect(decrypted).toBe('testData');
    });
  });
});