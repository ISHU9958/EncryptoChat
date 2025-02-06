export const messagesRead = (socket,setMessages, decryptMessage) => {
    socket.on("messages-read", async ({ to, msg, isGrp }) => {
        if (!isGrp) {
            // normal chat

            try {
                // Decrypt the messages or take them as is if myside is true
                const newmsg = await Promise.all(
                    msg.map(async (ms) => {
                        try {
                            if (ms.myside === true) {
                                ms.fromcontent = await decryptMessage(
                                    ms.fromcontent,
                                    localStorage.getItem("privateKey")
                                );
                            } else {
                                ms.tocontent = await decryptMessage(
                                    ms.tocontent,
                                    localStorage.getItem("privateKey")
                                );
                            }
                            return ms; // Return the message if decryption succeeds
                        } catch (error) {
                            return null; // Mark this message as skipped
                        }
                    })
                ).then((decryptedMessages) =>
                    decryptedMessages.filter((message) => message !== null)
                ); // Remove skipped messages

                // Update the state with the decrypted messages
                setMessages((prevMessages) => {
                    let updatedMessages = { ...prevMessages };

                    if (!updatedMessages[to]) {
                        updatedMessages[to] = [];
                    }

                    updatedMessages[to] = newmsg;
                    return updatedMessages;
                });
            } catch (error) {
                console.error("Error decrypting messages:", error);
            }
        } else {
            setMessages((prevMessages) => {
                let updatedMessages = { ...prevMessages };

                let tempmsg = updatedMessages[to];
                let returnmsg = [];
                tempmsg.forEach((tmsg) => {
                    if (tmsg._id === msg._id) {
                        returnmsg.push(msg);
                    } else {
                        returnmsg.push(tmsg);
                    }
                });

                updatedMessages[to] = returnmsg;
                return updatedMessages;
            });
        }
    });
};
