export const deleteMessage2 = (socket, setMessages) => {
    socket.on("delete-msg-2", ({ _id, from }) => {
      setMessages((prevMessages) => {
        let userChat = prevMessages[from];
        let tempChat = [];
        userChat.forEach((chat) => {
          if (chat._id !== _id) {
            tempChat.push(chat);
          }
        });

        let chatsofall = { ...prevMessages };
        chatsofall[from] = tempChat;

        return chatsofall;
      });
    });
};
