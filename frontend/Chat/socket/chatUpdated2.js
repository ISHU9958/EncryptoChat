export const chatUpdated2 = (socket, setChats) => {
    socket.on("chat-updated-2", ({ from, image, unseenMessages }) => {
        setChats((prevChats) => {
            const updatedChats = [{ username: from, image, unseenMessages }];
            prevChats.forEach((chat) => {
                if (chat.username !== from) {
                    updatedChats.push(chat);
                }
            });
            return updatedChats;
        });
    });
};
