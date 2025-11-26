class CryptoManager {
    constructor(password) {
        this.password = password;
        this.key = null;
        this.keyPromise = this.generateKey(password);
    }

    async generateKey(password) {
        const encoder = new TextEncoder();
      
        const passwordSha256Hash = await crypto.subtle.digest(
          "SHA-256",
          encoder.encode(password)
        );
        // Use the SHA-256 hash as the salt      
        const salt = passwordSha256Hash;
      
        // Encode the password into binary format
        const passwordKey = await crypto.subtle.importKey(
          "raw",
          encoder.encode(password),
          "PBKDF2",
          false,
          ["deriveKey"]
        );
      
        // Derive a key using PBKDF2 with the provided or generated salt
        const derivedKey = await crypto.subtle.deriveKey(
          {
            name: "PBKDF2",
            salt: salt,
            iterations: 1000000,
            hash: "SHA-256",
          },
          passwordKey,
          {
            name: "AES-GCM",
            length: 256,
          },
          true,
          ["encrypt", "decrypt"]
        );
      
        this.key = derivedKey;
        return derivedKey;
      }
      
      arrayBufferToString(buffer) {
        const bytes = new Uint8Array(buffer);
        let binaryString = '';
        const chunkSize = 8192; // Process in chunks to avoid stack overflow
        
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, chunk);
        }
        
        return btoa(binaryString);
      }
      
      stringToArrayBuffer(str) {
        const binaryString = atob(str);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      }

      async encryptData(data) {
        // Wait for key to be ready
        if (!this.key) {
            await this.keyPromise;
        }
        
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const encryptedData = await crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv: iv,
          },
          this.key,
          enc.encode(dataString)
        );
    
        // Return as a single serialized string
        return JSON.stringify({ 
            encryptedData: this.arrayBufferToString(encryptedData), 
            iv: this.arrayBufferToString(iv) 
        });
      }
    
      async decryptData(encryptedPayload) {
        // Handle both string and object inputs
        let payload;
        if (typeof encryptedPayload === 'string') {
            try {
                payload = JSON.parse(encryptedPayload);
            } catch {
                throw new Error('Invalid encrypted payload format');
            }
        } else {
            payload = encryptedPayload;
        }
        
        // Validate payload structure
        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid encrypted payload format');
        }
        
        const { encryptedData, iv, crypto: cryptoManager } = payload;
        
        // Validate required fields
        if (!encryptedData || !iv) {
            throw new Error('Invalid encrypted payload: missing encryptedData or iv');
        }
        
        // Ensure we don't accidentally return the encrypted payload structure
        // If the payload looks like it might be the encrypted structure itself, reject it
        if (typeof encryptedData === 'object' || typeof iv === 'object') {
            throw new Error('Invalid encrypted payload: encryptedData and iv must be strings');
        }
        
        const key = cryptoManager || this;
        
        // Wait for key to be ready
        if (!key.key) {
            await key.keyPromise;
        }
        
        try {
            const decryptedData = await crypto.subtle.decrypt(
              {
                name: "AES-GCM",
                iv: this.stringToArrayBuffer(iv),
              },
              key.key,
              this.stringToArrayBuffer(encryptedData)
            );
    
            const dec = new TextDecoder();
            const decryptedString = dec.decode(decryptedData);
            
            // Validate that we got actual decrypted data, not the encrypted structure
            // If decrypted string looks like JSON with encryptedData/iv, something went wrong
            try {
                const parsed = JSON.parse(decryptedString);
                // Check if this looks like an encrypted payload structure (shouldn't happen)
                if (parsed && typeof parsed === 'object' && parsed.encryptedData && parsed.iv) {
                    throw new Error('Decryption returned encrypted payload structure - possible password mismatch or corruption');
                }
                return parsed;
            } catch (parseError) {
                // Not JSON, return as string
                // But verify it's not the encrypted payload structure
                if (decryptedString.includes('encryptedData') && decryptedString.includes('iv')) {
                    throw new Error('Decryption returned encrypted payload structure - possible password mismatch');
                }
                return decryptedString;
            }
        } catch (error) {
            // Check if this is a password mismatch error
            const errorMessage = error.message || String(error);
            if (errorMessage.includes('OperationError') || 
                errorMessage.includes('decrypt') ||
                errorMessage.includes('AES-GCM')) {
                throw new Error('Decryption failed: Incorrect password or corrupted data');
            }
            console.error('Decryption failed:', error);
            throw new Error('Decryption failed: ' + errorMessage);
        }
      }
}

export default CryptoManager;