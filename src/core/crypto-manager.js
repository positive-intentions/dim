const DEFAULT_ITERATIONS = 1000000;

class CryptoManager {
    constructor(password, options = {}) {
        this.password = password;
        this.iterations = options.iterations || DEFAULT_ITERATIONS;
        // Cache derived keys by `${password}::${saltBase64}` so we only run the
        // (expensive) PBKDF2 derivation once per unique salt.
        this._keyCache = new Map();
        // Legacy: some callers read `this.key`/`this.keyPromise`. Kept for
        // backwards compatibility, derived with the deterministic fallback salt.
        this.key = null;
        this.keyPromise = this.generateKey(password).then((key) => {
            this.key = key;
            return key;
        });
    }

    arrayBufferToString(buffer) {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
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

    // Derive the deterministic fallback salt for a password (legacy behaviour).
    // Only used when no explicit salt is supplied. Real encryption always uses
    // a random per-record salt embedded in the payload.
    async _fallbackSalt(password) {
        const encoder = new TextEncoder();
        const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
        return new Uint8Array(hash);
    }

    /**
     * Derive an AES-GCM key from a password and salt using PBKDF2.
     * @param {string} password
     * @param {Uint8Array|ArrayBuffer} [salt] - random salt; falls back to a
     *   deterministic salt derived from the password when omitted.
     * @returns {Promise<CryptoKey>}
     */
    async getKeyFromPassword(password, salt) {
        const encoder = new TextEncoder();

        let saltBytes;
        if (salt === undefined || salt === null) {
            saltBytes = await this._fallbackSalt(password);
        } else {
            saltBytes = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
        }

        const cacheKey = `${password}::${this.arrayBufferToString(saltBytes)}`;
        if (this._keyCache.has(cacheKey)) {
            return this._keyCache.get(cacheKey);
        }

        const keyPromise = (async () => {
            const passwordKey = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                'PBKDF2',
                false,
                ['deriveKey']
            );

            return crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltBytes,
                    iterations: this.iterations,
                    hash: 'SHA-256',
                },
                passwordKey,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt', 'decrypt']
            );
        })();

        this._keyCache.set(cacheKey, keyPromise);
        return keyPromise;
    }

    // Legacy wrapper retained for backwards compatibility.
    async generateKey(password) {
        const key = await this.getKeyFromPassword(password);
        this.key = key;
        return key;
    }

    async encryptData(data) {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await this.getKeyFromPassword(this.password, salt);

        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            enc.encode(dataString)
        );

        // Return as a single serialized string, embedding the random salt so it
        // can be used to re-derive the key on decryption.
        return JSON.stringify({
            encryptedData: this.arrayBufferToString(encryptedData),
            iv: this.arrayBufferToString(iv),
            salt: this.arrayBufferToString(salt),
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

        const { encryptedData, iv, salt } = payload;

        // Validate required fields
        if (!encryptedData || !iv) {
            throw new Error('Invalid encrypted payload: missing encryptedData or iv');
        }

        // Ensure we don't accidentally treat the encrypted payload structure as
        // the ciphertext (which would indicate a malformed/double-wrapped value).
        if (typeof encryptedData === 'object' || typeof iv === 'object') {
            throw new Error('Invalid encrypted payload: encryptedData and iv must be strings');
        }

        // Derive the key from the embedded salt (new format). When no salt is
        // present we fall back to the deterministic salt for the password.
        const saltBytes = salt ? new Uint8Array(this.stringToArrayBuffer(salt)) : undefined;
        const key = await this.getKeyFromPassword(this.password, saltBytes);

        try {
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: this.stringToArrayBuffer(iv),
                },
                key,
                this.stringToArrayBuffer(encryptedData)
            );

            const dec = new TextDecoder();
            const decryptedString = dec.decode(decryptedData);

            // Validate that we got actual decrypted data, not the encrypted structure
            try {
                const parsed = JSON.parse(decryptedString);
                if (parsed && typeof parsed === 'object' && parsed.encryptedData && parsed.iv) {
                    throw new Error('Decryption returned encrypted payload structure - possible password mismatch or corruption');
                }
                return parsed;
            } catch (parseError) {
                // Not JSON, return as string
                if (decryptedString.includes('encryptedData') && decryptedString.includes('iv')) {
                    throw new Error('Decryption returned encrypted payload structure - possible password mismatch');
                }
                return decryptedString;
            }
        } catch (error) {
            const errorMessage = error.message || String(error);
            if (errorMessage.includes('OperationError') ||
                errorMessage.includes('decrypt') ||
                errorMessage.includes('AES-GCM')) {
                throw new Error('Decryption failed: Incorrect password or corrupted data');
            }
            throw new Error('Decryption failed: ' + errorMessage);
        }
    }
}

export default CryptoManager;
