import React, { useState, useEffect, useRef } from "react";
import "../styles/Layout.css";
import ChatNav from "./ChatNav";
import ChattingNav from "./ChattingNav";
import { useUser } from "../src/Context/UserContest";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import socket from "../socket/socket";
import { encryptMessage } from "../EncryptionDecryption/MessageEncrypt";
import { decryptMessage } from "../EncryptionDecryption/MessageDecrypt";
import { v4 as uuidv4 } from "uuid";
import { privateMessage2 } from "../socket/privateMessage2";
import { chatUpdated2 } from "../socket/chatUpdated2";
import { deleteMessage2 } from "../socket/deleteMessage2";
import { getMsgIdPrivateMsg1 } from "../socket/getMsgIdPrivateMsg1";
import { chatUpdated1 } from "../socket/chatUpdated1";
import { messagesRead } from "../socket/messagesRead";
import { handlePrivateKeyEncryption } from "../EncryptionDecryption/BackupKeyPrivateKeyEncrypt";

const Layout = ({ takeuser }) => {
  const { user, SetUser } = useUser();
  const [searchbar, setSearchBar] = useState("");
  const [sendInput, setSendInput] = useState("");
  const navigate = useNavigate();
  const { username } = useParams();
  const [userChatName, setUserChatName] = useState(username || "");
  const [messages, setMessages] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [chats, setChats] = useState([]);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
  });
  const [forwardMessage, setForwardMessage] = useState(null); // Holds the message being forwarded
  const [forwardToUser, setForwardToUser] = useState(""); // Holds the target user

  const [forwardSuggestions, setForwardSuggestions] = useState([]);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupSuggestions, setGroupSuggestions] = useState([]);

  const [leftClickTab, setLeftClickTab] = useState({
    visible: false,
    msg: null,
  });
  const [logoutBackuptab, setLogoutBackuptab] = useState(false);


  const handleCancel = () => {
    setLogoutBackuptab(false);
  };

  const handleBackup = async () => {
    // generating
    const numericCode = Math.abs(
      parseInt(uuidv4().replace(/-/g, ""), 16) % 1000000
    )
      .toString()
      .padStart(6, "0");

    const { privateKey, salt, iv } = await handlePrivateKeyEncryption(
      `${numericCode}`,
      localStorage.getItem("privateKey")
    );

    try {
      const res = await axios.post(
        "/api/v1/user/handle-backup",
        { privateKey, salt, iv },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          },
        }
      );

      if (res.data.success) {
        // message.success(res.data.message);
        navigate("/thanks", { state: { backupKey: `${numericCode}` } });
      }
    } catch (error) {
      console.error(error);
      message.error("no backup");
    }
  };

  const handleLeftClick = async (e, msg) => {
    e.preventDefault();
    const menuWidth = 300; // Approximate width of the context menu
    const menuHeight = 150; // Approximate height of the context menu

    // Calculate the desired position
    let x = e.clientX;
    let y = e.clientY;

    // Adjust position if the menu would overflow the viewport
    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 50; // Add some padding
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 50; // Add some padding
    }

    if (msg.memberSeen.length > 0) {
      setLeftClickTab({
        visible: true,
        x,
        y,
        msg,
      });
    }
  };

  const handleGroupMemberSuggestion = async (input) => {
    try {
      const res = await axios.get("/api/v1/user/search-user-suggestion", {
        headers: {
          authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          query: input,
        },
      });
      if (res.data.success) {
        setGroupSuggestions(res.data.users);
      } else {
        setGroupSuggestions([]);
      }
    } catch (error) {
      message.error("Something went wrong while fetching suggestions");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      message.error("Group name is required");
      return;
    }
    if (groupMembers.length === 0) {
      message.error("Add at least one member to the group");
      return;
    }
    try {
      const res = await axios.post(
        "/api/v1/user/group-create",
        { name: groupName, members: groupMembers },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success("Group created successfully");

        setChats((prevchatnames) => {
          const updatedchatnames = [
            { username: groupName, image: res.data.image, unseenMessages: 0 },
          ];
          prevchatnames.forEach((chatname) => {
            updatedchatnames.push(chatname);
          });
          return updatedchatnames;
        });

        setShowCreateGroupModal(false);
        setGroupName("");
        setGroupMembers([]);
      } else {
        message.error("Failed to create group");
      }
    } catch (error) {
      message.error("Something went wrong");
    }
  };

  const handleRightClick = (e, messageId) => {
    e.preventDefault();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    setContextMenu({
      visible: true,
      x: centerX,
      y: centerY,
      messageId,
    });
  };

  const handleClickOutside = (e) => {
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });

    if (leftClickTab.visible) {
      setLeftClickTab({
        visible: false,
        x: 0,
        y: 0,
        msg: null,
      });
    }
  };

  const handleCopy = async () => {
    if (contextMenu.messageId !== null) {
      const messageToCopy = messages[userChatName]?.find(
        (msg) => msg._id === contextMenu.messageId
      );

      if (messageToCopy) {
        try {
          if (messageToCopy.myside === true) {
            await navigator.clipboard.writeText(messageToCopy.fromcontent);
          } else {
            await navigator.clipboard.writeText(messageToCopy.tocontent);
          }
          message.success("Message copied to clipboard!");
        } catch (error) {
          message.error("Failed to copy message.");
        }
      }

      setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    }
  };

  const handleForward = () => {
    if (contextMenu.messageId !== null) {
      const messageToForward = messages[userChatName]?.find(
        (msg) => msg._id === contextMenu.messageId
      );

      if (messageToForward) {
        setForwardMessage(messageToForward);
      }

      setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    }
  };

  const forwardMessageToUser = () => {
    if (forwardMessage && forwardToUser) {
      let isGrp = false;

      const grps = user.groups ? user.groups : [];
      grps.forEach((grp) => {
        if (grp === forwardToUser) {
          isGrp = true;
        }
      });

      const messageData = {
        to: forwardToUser,
        from: user.username,
        tocontent: forwardMessage.tocontent,
        fromcontent: forwardMessage.fromcontent,
        isForward: true,
        isGroup: isGrp,
        isRead: false,
      };

      // Emit a socket event to send the forwarded message
      socket.emit("private_message1", messageData);

      // Clear the forward message state
      setForwardMessage(null);
      setForwardToUser("");
      message.success("Message forwarded successfully!");
    } else {
      message.error("Please select a user to forward the message.");
    }
  };

  const handleDelete = async () => {
    if (contextMenu.messageId !== null) {
      let deleteMsg = {};
      deleteMsg["isGrp"] = false;
      const setMsg = async () => {
        setMessages((prevMessages) => {
          let userChat = prevMessages[userChatName];
          let tempChat = [];
          userChat.forEach((chat) => {
            if (chat._id !== contextMenu.messageId) {
              tempChat.push(chat);
            } else {
              deleteMsg = chat;
              const grps = user.groups;
              grps.forEach((grp) => {
                if (grp === chat.to) {
                  deleteMsg["isGrp"] = true;
                }
              });
            }
          });

          let chatsofall = { ...prevMessages };
          chatsofall[userChatName] = tempChat;

          return chatsofall;
        });
      };

      await setMsg();

      socket.emit("delete-msg-1", deleteMsg);

      setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearchSuggestion = async () => {
    try {
      const res = await axios.get("/api/v1/user/search-user-suggestion", {
        headers: {
          authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          query: searchbar,
        },
      });

      if (res.data.success) {
        setSuggestions(res.data.users);
      }
    } catch (error) {
      message.error("Something went wrong");
    }
  };

  const handleForwardSuggestion = async (input) => {
    try {
      const res = await axios.get("/api/v1/user/search-user-suggestion", {
        headers: {
          authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          query: input,
        },
      });

      if (res.data.success) {
        setForwardSuggestions(res.data.users);
      } else {
        setForwardSuggestions([]);
      }
    } catch (error) {
      message.error("Something went wrong while fetching suggestions");
    }
  };

  const handleSearch = async () => {
    if (searchbar) {
      try {
        const res = await axios.post(
          "/api/v1/user/search",
          { username: searchbar },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("chat-token")}`,
            },
          }
        );

        if (res.data.success) {
          navigate(`/user/${res.data.user.username}`);
          setUserChatName(res.data.user.username);
        } else {
          message.error(`${searchbar} does not exist`);
        }
      } catch (error) {
        message.error("Something went wrong");
        navigate(`/user/${user.username}`);
      }
    }
  };

  const handleSend = async () => {
    let isGrp = false;

    const grps = user.groups ? user.groups : [];
    grps.forEach((grp) => {
      if (grp === username) {
        isGrp = true;
      }
    });

    try {
      const res1 = await axios.post(
        "/api/v1/user/getting-public-key",
        { username },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          },
        }
      );
      const res2 = await axios.post(
        "/api/v1/user/getting-public-key",
        { username: user.username },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          },
        }
      );

      const encryptmsg1 = await encryptMessage(sendInput, res1.data.publicKey);
      const encryptmsg2 = await encryptMessage(sendInput, res2.data.publicKey);

      const messageData = {
        to: username,
        from: user.username,
        tocontent: encryptmsg1,
        fromcontent: encryptmsg2,
        isGroup: isGrp,
        isRead: false,
      };

      socket.emit("private_message1", messageData);

      setSendInput("");
      if (inputRef.current) inputRef.current.focus();
    } catch (error) {
      console.log("Message could not be encrypted");
      console.log(error);
    }
  };

  const getChats = async () => {
    try {
      const res = await axios.get("/api/v1/user/get-chat-messages", {
        headers: {
          authorization: `Bearer ${localStorage.getItem("chat-token")}`,
        },
      });

      if (res.data.success) {
        const allChats = res.data.chat;

        const decryptedChats = {};

        for (const [user, messages] of Object.entries(allChats)) {
          decryptedChats[user] = await Promise.all(
            messages.map(async (message) => {
              try {
                if (message.myside === true) {
                  const decryptedContent = await decryptMessage(
                    message.fromcontent,
                    localStorage.getItem("privateKey")
                  );
                  return { ...message, fromcontent: decryptedContent };
                }
                const decryptedContent = await decryptMessage(
                  message.tocontent,
                  localStorage.getItem("privateKey")
                );
                return { ...message, tocontent: decryptedContent };
              } catch (error) {
                return null; // Mark this message as skipped
              }
            })
          ).then((decryptedMessages) =>
            decryptedMessages.filter((msg) => msg !== null)
          ); // Remove skipped messages
        }

        setMessages(decryptedChats);
      } else {
        message.error("Cannot fetch chats");
      }
    } catch (error) {
      console.log(error);
      message.error("Something went wrong");
    }
  };

  useEffect(() => {
    setUserChatName(username);
    if (username && user.username) {
      setChats((prevchats) => {
        let allchats = [...prevchats];
        allchats.forEach((chat) => {
          if (chat.username === username) {
            chat.unseenMessages = 0;
          }
        });

        return allchats;
      });
      socket.emit("read-msg-for-particular-chat", {
        username,
        mainuser: user.username,
      });
    }
  }, [username]);

  useEffect(() => {
    getChats();

    privateMessage2(socket,setMessages,decryptMessage);

    chatUpdated2(socket,setChats);

    deleteMessage2(socket,setMessages);

    getMsgIdPrivateMsg1(socket,setMessages,decryptMessage);

    chatUpdated1(socket,setChats);

    messagesRead(socket,setMessages,decryptMessage);


  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="layout-container" onClick={handleClickOutside}>
      <div
        className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className={`chats ${isMenuOpen ? "open" : ""}`}>
        <div className="search-enter-container">
          <div className="search-container">
            <input
              type="text"
              className="search"
              value={searchbar}
              onChange={(e) => setSearchBar(e.target.value)}
              onKeyUp={handleSearchSuggestion}
              placeholder="Search users..."
            />
          </div>
          <div className="enter-btn-container" onClick={handleSearch}>
            <i
              className="fas fa-search"
              style={{ fontSize: "20px", cursor: "pointer" }}
            ></i>
          </div>
        </div>
        <ChatNav
          search={searchbar ? suggestions : null}
          chats={chats}
          setChats={setChats}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>

      <div className="chatting-main-container ">
        <div className="chatting ">
          <ChattingNav
            chatuser={takeuser ? user.username : userChatName}
            setShowCreateGroupModal={setShowCreateGroupModal}
            setLogoutBackuptab={setLogoutBackuptab}
          />
          <div className="chatting-msg" ref={chatContainerRef}>
            {logoutBackuptab && (
              <div className="backup-container">
                <p>Please choose an action:</p>

                <div className="button-group">
                  <button className="backup-btn" onClick={handleBackup}>
                    Backup
                  </button>

                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            
              {messages[userChatName]?.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.myside ? "my-side" : "other-side"}`}
                  onContextMenu={(e) => handleRightClick(e, msg._id)}
                  onClick={(e) => {
                    if (msg.myside) {
                      handleLeftClick(e, msg);
                    }
                  }}
                >
                  {!msg.myside && (
                    <img
                      src={
                        msg.image ||
                        "https://wallpapers.com/images/hd/whatsapp-dp-cartoon-boy-0cpuu9bby26fdy52.jpg"
                      }
                      alt="User Avatar"
                      className="chatting-img"
                    />
                  )}
                  <div className="msg-content">
                    {msg.isForward && (
                      <span className="forwarded-flag">Forwarded</span>
                    )}
                    <p>{msg.myside ? msg.fromcontent : msg.tocontent}</p>
                    {msg.myside && (
                      <span className="read-status">
                        {msg.isRead ? (
                          <i className="tick-icon green-tick">
                            &#10004;&#10004;
                          </i> // Green double tick
                        ) : (
                          <i className="tick-icon gray-tick">&#10004;</i> // Gray single tick
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            

            {leftClickTab.visible && (
              <div
                className="left-click-menu"
                style={{
                  top: `${leftClickTab.y}px`,
                  left: `${leftClickTab.x}px`,
                }}
              >
                <div className="message-seen-box">
                  <div className="message-seen-header">
                    <span>Seen By</span>
                  </div>
                  <ul className="seen-members-list">
                    {leftClickTab.msg.memberSeen?.map((member, index) => (
                      <li key={index} className="seen-member-item">
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {contextMenu.visible && (
              <ul
                className="context-menu"
                style={{ top: contextMenu.y, left: contextMenu.x }}
              >
                {/* Check if the message is from "myside" */}
                {messages[userChatName]?.find(
                  (msg) => msg._id === contextMenu.messageId
                )?.myside && <li onClick={handleDelete}>Delete</li>}
                <li onClick={handleCopy}>Copy</li>
                <li onClick={handleForward}>Forward</li>
              </ul>
            )}

            {forwardMessage && (
              <div className="forward-modal">
                <h3>Forward Message</h3>
                <div className="message-content-scroll">
                  <p>
                    Message:{" "}
                    {forwardMessage.myside
                      ? forwardMessage.fromcontent
                      : forwardMessage.tocontent}
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Enter username to forward"
                  value={forwardToUser}
                  onChange={(e) => {
                    setForwardToUser(e.target.value);
                    handleForwardSuggestion(e.target.value); // Fetch suggestions
                  }}
                />
                <ul className="suggestions-list">
                  {forwardSuggestions.map((user, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        setForwardToUser(user.username); // Select user
                        setForwardSuggestions([]); // Clear suggestions
                      }}
                    >
                      {user.username}
                    </li>
                  ))}
                </ul>
                <button onClick={forwardMessageToUser}>Send</button>
                <button onClick={() => setForwardMessage(null)}>Cancel</button>
              </div>
            )}

            {showCreateGroupModal && (
              <div className="create-group-modal">
                <h3>Create Group</h3>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Add members by username"
                  onChange={(e) => handleGroupMemberSuggestion(e.target.value)}
                />
                <ul className="group-suggestions-list">
                  {groupSuggestions.map((user, index) => (
                    <li
                      key={index}
                      onClick={() => {
                        if (!groupMembers.includes(user.username)) {
                          setGroupMembers((prev) => [...prev, user.username]);
                        }
                      }}
                    >
                      {user.username}
                    </li>
                  ))}
                </ul>
                <div className="group-members">
                  {groupMembers.map((member, index) => (
                    <span key={index} className="group-member">
                      {member}
                      <i
                        className="fas fa-times"
                        onClick={() =>
                          setGroupMembers((prev) =>
                            prev.filter((m) => m !== member)
                          )
                        }
                      ></i>
                    </span>
                  ))}
                </div>
                <button onClick={handleCreateGroup}>Create Group</button>
                <button onClick={() => setShowCreateGroupModal(false)}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

          <div className="input-send-btn-container">
            <div className="input-send-btn">
              <div className="input-container">
                <input
                  type="text"
                  className="input"
                  value={sendInput}
                  onChange={(e) => setSendInput(e.target.value)}
                  ref={inputRef}
                />
              </div>
              <div className="send-btn-container">
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!sendInput.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        
      </div>
    </div>
  );
};

export default Layout;
