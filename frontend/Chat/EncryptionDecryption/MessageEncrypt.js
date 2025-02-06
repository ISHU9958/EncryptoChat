export async function encryptMessage(message, recipientPublicKeyBase64) {
  function toBase64(array) {
    return btoa(String.fromCharCode(...array));
  }

  async function importPublicKey(publicKeyBase64) {
    const binaryDer = atob(publicKeyBase64);  // Decode the Base64 string into binary
    const binaryArray = new Uint8Array(binaryDer.length);

    for (let i = 0; i < binaryDer.length; i++) {
      binaryArray[i] = binaryDer.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
      "spki",
      binaryArray.buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
  }

  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const recipientPublicKey = await importPublicKey(recipientPublicKeyBase64);

  const encryptedMessage = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    messageBytes
  );

  return toBase64(new Uint8Array(encryptedMessage));
}
