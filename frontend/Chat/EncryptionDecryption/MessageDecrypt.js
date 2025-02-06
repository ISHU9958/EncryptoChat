export async function decryptMessage(encryptedMessage, recipientPrivateKeyBase64) {
  function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const uintArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uintArray[i] = binaryString.charCodeAt(i);
    }
    return uintArray;
  }

  async function importPrivateKey(privateKeyBase64) {
    const binaryDer = base64ToUint8Array(privateKeyBase64);

    return await window.crypto.subtle.importKey(
      "pkcs8",
      binaryDer.buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"]
    );
  }

  const encryptedMessageBytes = base64ToUint8Array(encryptedMessage);
  const recipientPrivateKey = await importPrivateKey(recipientPrivateKeyBase64);

  const decryptedMessage = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    recipientPrivateKey,
    encryptedMessageBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedMessage);
}
