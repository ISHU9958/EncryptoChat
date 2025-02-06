export const chatUpdated1 = (socket, setChats) => {
    socket.on("chat-updated-1", ({ to, image, unseenMessages }) => {
      setChats((prevchatnames) => {
        const updatedchatnames = [{ username: to, image, unseenMessages }];
        prevchatnames.forEach((chatname) => {
          if (chatname.username !== to) {
            updatedchatnames.push(chatname);
          }
        });
        return updatedchatnames;
      });
    });
};
