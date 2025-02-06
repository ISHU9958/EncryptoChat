 // Function to derive the encryption key from the user's password using PBKDF2
  async function deriveEncryptionKey(password, salt) {
    const encoder = new TextEncoder();
    try {

      // Derive the encryption key using PBKDF2 with SHA-256
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
          hash: "SHA-256"
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );

      return encryptionKey; // Return the derived encryption key
    } catch (error) {
      console.error("Error in deriveEncryptionKey: ", error);
      throw new Error("Failed to derive encryption key");
    }
  }

  // Function to decrypt the private key using AES-GCM and the password-derived encryption key
  async function decryptPrivateKey(encryptedPrivateKey, password, iv, salt) {
    try {

      // Derive the encryption key from the user's password and salt
      const encryptionKey = await deriveEncryptionKey(password, salt);

      // Decrypt the private key using AES-GCM
      const decryptedPrivateKey = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        encryptionKey,
        encryptedPrivateKey
      );

      // Convert the decrypted private key back to string format
      const decoder = new TextDecoder();
      const privateKey = decoder.decode(decryptedPrivateKey);

      return privateKey; // Return the decrypted private key
    } catch (error) {
      console.error("Error in decryptPrivateKey: ", error);
      throw new Error("Failed to decrypt private key");
    }
  }

  // Function to convert Base64 string to Uint8Array
  function base64ToUint8Array(base64) {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const array = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        array[i] = binaryString.charCodeAt(i);
      }

      return array;
    } catch (error) {
      console.error("Error in base64ToUint8Array: ", error);
      throw new Error("Failed to convert Base64 to Uint8Array");
    }
  }

  // Function to handle the decryption of the private key
  export async function handlePrivateKeyDecryption(password, encryptedPrivateKeyInput, ivInput, saltInput) {
    try {


      // Decode Base64 strings into Uint8Arrays
      const encryptedPrivateKey = base64ToUint8Array(encryptedPrivateKeyInput);
      const iv = base64ToUint8Array(ivInput);
      const salt = base64ToUint8Array(saltInput);


      // Decrypt the private key
      const privateKey = await decryptPrivateKey(encryptedPrivateKey, password, iv, salt);

      return privateKey;
    } catch (error) {
      console.error("Error in handlePrivateKeyDecryption: ", error);
      throw new Error("Failed to handle private key decryption");
    }
  }
