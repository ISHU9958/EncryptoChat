import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../src/Context/UserContest";
import axios from "axios";
import styles from "../styles/ChattingNav.module.css"; // Import CSS Module

const ChattingNav = ({ chatuser, setShowCreateGroupModal, setLogoutBackuptab }) => {
  const { user } = useUser();
  const [chatterimage, setChatterimage] = useState(
    "https://wallpapers.com/images/hd/whatsapp-dp-cartoon-boy-0cpuu9bby26fdy52.jpg"
  );

  const navigate = useNavigate();

  const handleLogout = async () => {
    setLogoutBackuptab(true);
  };

  const getImage = async () => {
    try {
      const res = await axios.post(
        "/api/v1/user/get-chat-user-image",
        { chatuser },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("chat-token")}`,
          },
        }
      );

      if (res.data.success) {
        setChatterimage(res.data.image || chatterimage);
      }
    } catch (error) {
      setChatterimage(chatterimage);
    }
  };

  useEffect(() => {
    if (chatuser) {
      getImage();
    }
  }, [chatuser]);

  return (
    <div className={styles.chatnavContainer}>
      <div className={styles.chatInfo}>
        <img src={chatterimage} alt="user" className={styles.chatImg} />
        <div className={styles.chatName}>
          {chatuser === user.username ? "Me (You)" : chatuser}
        </div>
      </div>

      <div className={styles.chatActions}>
        <button className={styles.createGroupBtn} onClick={() => setShowCreateGroupModal(true)}>
          <i className="fas fa-users"></i> 
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i></button>
      </div>
    </div>
  );
};

export default ChattingNav;
