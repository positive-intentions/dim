const DEFAULT_ITERATIONS = 1000000;
const PAYLOAD_VERSION = 2;

class CryptoManager {
  /**
   * @param {string} password
   * @param {{ iterations?: number }} [options]
   */
  constructor(password, options = {}) {
    this.password = password;
    this.iterations = options.iterations || DEFAULT_ITERATIONS;
    // Cache derived keys by salt base64 only (password is fixed per instance).
    this._keyCache = new Map();
    // Legacy: some callers read `this.key`/`this.keyPromise`. Lazy — no eager
    // derivation with the deterministic fallback salt.
    this.key = null;
    this.keyPromise = null;
  }

  arrayBufferToString(buffer) {
    const bytes =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binaryString = "";
    const chunkSize = 8192;

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
    return bytes;
  }

  // Derive the deterministic fallback salt for a password (legacy decrypt only).
  async _fallbackSalt(password) {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(password),
    );
    return new Uint8Array(hash);
  }

  /**
   * Derive an AES-GCM key from a password and salt using PBKDF2.
   * Keys are non-extractable.
   * @param {string} password
   * @param {Uint8Array|ArrayBuffer} [salt]
   * @param {number} [iterations]
   * @returns {Promise<CryptoKey>}
   */
  async getKeyFromPassword(password, salt, iterations) {
    const encoder = new TextEncoder();
    const iter = iterations || this.iterations;

    let saltBytes;
    if (salt === undefined || salt === null) {
      saltBytes = await this._fallbackSalt(password);
    } else {
      saltBytes = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
    }

    const cacheKey = `${iter}::${this.arrayBufferToString(saltBytes)}`;
    if (this._keyCache.has(cacheKey)) {
      return this._keyCache.get(cacheKey);
    }

    const keyPromise = (async () => {
      const passwordKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"],
      );

      return crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltBytes,
          iterations: iter,
          hash: "SHA-256",
        },
        passwordKey,
        {
          name: "AES-GCM",
          length: 256,
        },
        false, // non-extractable
        ["encrypt", "decrypt"],
      );
    })();

    this._keyCache.set(cacheKey, keyPromise);
    return keyPromise;
  }

  // Legacy wrapper — still derives with fallback salt (decrypt/compat only).
  async generateKey(password) {
    const key = await this.getKeyFromPassword(password);
    this.key = key;
    this.keyPromise = Promise.resolve(key);
    return key;
  }

  async encryptData(data) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.getKeyFromPassword(this.password, salt, this.iterations);

    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      enc.encode(dataString),
    );

    return JSON.stringify({
      v: PAYLOAD_VERSION,
      iter: this.iterations,
      salt: this.arrayBufferToString(salt),
      iv: this.arrayBufferToString(iv),
      encryptedData: this.arrayBufferToString(encryptedData),
    });
  }

  async decryptData(encryptedPayload) {
    let payload;
    if (typeof encryptedPayload === "string") {
      try {
        payload = JSON.parse(encryptedPayload);
      } catch {
        throw new Error("Invalid encrypted payload format");
      }
    } else {
      payload = encryptedPayload;
    }

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid encrypted payload format");
    }

    const encryptedData = payload.encryptedData || payload.data;
    const { iv, salt, iter } = payload;

    if (!encryptedData || !iv) {
      throw new Error("Invalid encrypted payload: missing encryptedData or iv");
    }

    if (typeof encryptedData === "object" || typeof iv === "object") {
      throw new Error(
        "Invalid encrypted payload: encryptedData and iv must be strings",
      );
    }

    const saltBytes = salt
      ? new Uint8Array(this.stringToArrayBuffer(salt))
      : undefined;
    const iterations = typeof iter === "number" && iter > 0 ? iter : this.iterations;
    const key = await this.getKeyFromPassword(
      this.password,
      saltBytes,
      iterations,
    );

    try {
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: this.stringToArrayBuffer(iv),
        },
        key,
        this.stringToArrayBuffer(encryptedData),
      );

      const dec = new TextDecoder();
      const decryptedString = dec.decode(decryptedData);

      try {
        const parsed = JSON.parse(decryptedString);
        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.encryptedData &&
          parsed.iv
        ) {
          throw new Error(
            "Decryption returned encrypted payload structure - possible password mismatch or corruption",
          );
        }
        return parsed;
      } catch (parseError) {
        if (
          decryptedString.includes("encryptedData") &&
          decryptedString.includes("iv")
        ) {
          throw new Error(
            "Decryption returned encrypted payload structure - possible password mismatch",
          );
        }
        // Re-throw our structural error; otherwise return plain string
        if (
          parseError instanceof Error &&
          parseError.message.includes("encrypted payload structure")
        ) {
          throw parseError;
        }
        return decryptedString;
      }
    } catch (error) {
      const errorMessage = error.message || String(error);
      if (
        errorMessage.includes("OperationError") ||
        errorMessage.includes("decrypt") ||
        errorMessage.includes("AES-GCM")
      ) {
        throw new Error(
          "Decryption failed: Incorrect password or corrupted data",
        );
      }
      throw new Error("Decryption failed: " + errorMessage);
    }
  }
}

export default CryptoManager;
