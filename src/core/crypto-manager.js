class CryptoManager {
    constructor(password) {
        this.password = password;
        this.key = null;
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

    async getKey() {
        if (!this.key) {
            return await this.generateKey(this.password);
        } else {
            return this.key;
        }
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
        const key = await this.getKey();
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            enc.encode(data)
        );

        return { encryptedData, iv };
    }

    async decryptData({ encryptedData, iv }) {
        return new Promise((resolve, reject) => {
            const decryptData = async () => {
                const key = await this.getKey();
                const decryptedData = await crypto.subtle.decrypt(
                    {
                        name: "AES-GCM",
                        iv: iv,
                    },
                    key,
                    encryptedData
                );

                if (!decryptedData) {
                    reject("Decryption failed");
                } else {
                    const dec = new TextDecoder();
                    return resolve(dec.decode(decryptedData));
                }
            };

            decryptData().catch(reject);
        });
    }

    async encryptDataPromise(data) {
        const { encryptedData, iv } = await this.encryptData(
            this.key,
            JSON.stringify(data)
        );
        return {
            encryptedData: this.arrayBufferToString(encryptedData),
            iv: this.arrayBufferToString(iv),
        };
    }

    async decryptDataPromise(encryptedData, iv) {
        const deserializedEncryptedData = this.stringToArrayBuffer(encryptedData);
        const deserializeIv = this.stringToArrayBuffer(iv);
        const decryptedData = await this.decryptData({
            encryptedData: deserializedEncryptedData,
            iv: deserializeIv
        });

        return JSON.parse(decryptedData);
    }
}

export default CryptoManager;