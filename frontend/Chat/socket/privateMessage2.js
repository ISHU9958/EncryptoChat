export const privateMessage2 = (socket, setMessages, decryptMessage) => {
    const handleMessage = async ({
        _id,
        to,
        from,
        tocontent,
        fromcontent,
        isForward,
        image,
        isRead,
        memberSeen,
    }) => {
        const decryptMsg = await decryptMessage(
            tocontent,
            localStorage.getItem("privateKey")
        );

        setMessages((prevMessages) => {
            const updatedMessages = { ...prevMessages };

            if (!updatedMessages[from]) {
                updatedMessages[from] = [];
            }

            updatedMessages[from].push({
                _id,
                to,
                from,
                myside: false,
                tocontent: decryptMsg,
                fromcontent,
                isForward,
                image,
                isRead,
                memberSeen,
            });

            return updatedMessages;
        });
    };

    socket.on("private_message2", handleMessage);
};
