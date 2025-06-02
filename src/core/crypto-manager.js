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
      
        console.log("password", password, this.arrayBufferToString(passwordSha256Hash));
      
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
        return btoa(String.fromCharCode(...new Uint8Array(buffer)));
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
        
        const { encryptedData, iv, crypto: cryptoManager } = payload;
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
            
            // Try to parse as JSON, otherwise return as string
            try {
                return JSON.parse(decryptedString);
            } catch {
                return decryptedString;
            }
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Decryption failed: ' + error.message);
        }
      }
}

export default CryptoManager;