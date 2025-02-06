function toBase64(uint8Array) {
    return btoa(String.fromCharCode(...uint8Array));
}

// Function to derive an encryption key from the user's password using PBKDF2
async function deriveEncryptionKey(password) {
    const encoder = new TextEncoder();

    // Generate a salt (you should store this salt in the database as well)
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive an encryption key using PBKDF2 with SHA-256
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const encryptionKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    return { encryptionKey, salt }; // Return encryption key and salt for later use
}

// Function to encrypt the private key using AES-GCM and the password-derived encryption key
async function encryptPrivateKey(privateKey, password) {
    // Derive the encryption key and salt from the password
    const { encryptionKey, salt } = await deriveEncryptionKey(password);

    // Convert the private key to an ArrayBuffer
    const encoder = new TextEncoder();
    const privateKeyBytes = encoder.encode(privateKey);

    // Generate a random Initialization Vector (IV) for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the private key using AES-GCM
    const encryptedPrivateKey = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        encryptionKey,
        privateKeyBytes
    );

    // Return the encrypted private key and the IV (you need to store both)
    return { encryptedPrivateKey, iv, salt };
}

// Example usage:
export async function handlePrivateKeyEncryption(password, privateKey) {
    // privatekey to encrypt
    //user password

    // Encrypt the private key
    const { encryptedPrivateKey, iv, salt } = await encryptPrivateKey(
        privateKey,
        password
    );

    // You should store encryptedPrivateKey, iv, and salt in your database
    const encryptedPrivateKeyBase64 = toBase64(
        new Uint8Array(encryptedPrivateKey)
    );
    const ivBase64 = toBase64(new Uint8Array(iv));
    const saltBase64 = toBase64(new Uint8Array(salt));

    return {
        privateKey: encryptedPrivateKeyBase64,
        salt: saltBase64,
        iv: ivBase64,
    };
}