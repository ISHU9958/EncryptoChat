export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey({
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    }, true, ["encrypt", "decrypt"]);

    // Export keys
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    // Convert keys to Base64 for storage
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)));
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKey)));

    // console.log("Public Key:", publicKeyBase64);
    // console.log("Private Key:", privateKeyBase64);

    return { publicKey: publicKeyBase64, privateKey: privateKeyBase64 };
  }
