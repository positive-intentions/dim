export default CryptoManager;
declare class CryptoManager {
    /**
     * @param {string} password
     * @param {{ iterations?: number }} [options]
     */
    constructor(password: string, options?: {
        iterations?: number;
    });
    password: string;
    iterations: number;
    _keyCache: Map<any, any>;
    key: CryptoKey;
    keyPromise: Promise<CryptoKey>;
    arrayBufferToString(buffer: any): string;
    stringToArrayBuffer(str: any): Uint8Array<ArrayBuffer>;
    _fallbackSalt(password: any): Promise<Uint8Array<ArrayBuffer>>;
    /**
     * Derive an AES-GCM key from a password and salt using PBKDF2.
     * Keys are non-extractable.
     * @param {string} password
     * @param {Uint8Array|ArrayBuffer} [salt]
     * @param {number} [iterations]
     * @returns {Promise<CryptoKey>}
     */
    getKeyFromPassword(password: string, salt?: Uint8Array | ArrayBuffer, iterations?: number): Promise<CryptoKey>;
    generateKey(password: any): Promise<CryptoKey>;
    encryptData(data: any): Promise<string>;
    decryptData(encryptedPayload: any): Promise<any>;
}
//# sourceMappingURL=crypto-manager.d.ts.map