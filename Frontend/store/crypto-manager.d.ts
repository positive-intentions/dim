export default CryptoManager;
declare class CryptoManager {
    constructor(password: any, options?: {});
    password: any;
    iterations: any;
    _keyCache: Map<any, any>;
    key: CryptoKey;
    keyPromise: Promise<CryptoKey>;
    arrayBufferToString(buffer: any): string;
    stringToArrayBuffer(str: any): Uint8Array<ArrayBuffer>;
    _fallbackSalt(password: any): Promise<Uint8Array<ArrayBuffer>>;
    /**
     * Derive an AES-GCM key from a password and salt using PBKDF2.
     * @param {string} password
     * @param {Uint8Array|ArrayBuffer} [salt] - random salt; falls back to a
     *   deterministic salt derived from the password when omitted.
     * @returns {Promise<CryptoKey>}
     */
    getKeyFromPassword(password: string, salt?: Uint8Array | ArrayBuffer): Promise<CryptoKey>;
    generateKey(password: any): Promise<CryptoKey>;
    encryptData(data: any): Promise<string>;
    decryptData(encryptedPayload: any): Promise<any>;
}
//# sourceMappingURL=crypto-manager.d.ts.map