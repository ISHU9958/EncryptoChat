export const getMsgIdPrivateMsg1 = (socket, setMessages, decryptMessage) => {
  socket.on(
    "get-msg-id-private-msg-1",
    async ({
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


      try {

        const decryptMsg = await decryptMessage(
          fromcontent,
          localStorage.getItem("privateKey")
        );

        setMessages((prevMessages) => {
          const updatedMessages = { ...prevMessages };

          if (!updatedMessages[to]) {
            updatedMessages[to] = [];
          }

          updatedMessages[to].push({
            _id,
            to,
            from,
            myside: true,
            tocontent,
            fromcontent: decryptMsg,
            isForward,
            image,
            isRead,
            memberSeen,
          });

          return updatedMessages;
        });

      } catch (error) {
        console.log(error);
      }
    }
  );
};
