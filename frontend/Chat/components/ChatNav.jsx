import React, { useEffect, useState } from 'react';
import styles from '../styles/ChatNav.module.css'; // Import CSS Module
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../src/Context/UserContest';

const ChatNav = ({ search, chats, setChats, setIsMenuOpen }) => {
  const navigate = useNavigate();
  const { user, SetUser } = useUser();


  const handleOnClick=(chat)=>{
    setIsMenuOpen(false);

    navigate(`/user/${chat.username}`)
  }

  const getAllChats = async () => {
    try {
      const res = await axios.get('/api/v1/user/chats', {
        headers: {
          authorization: `Bearer ${localStorage.getItem('chat-token')}`,
        },
      });

      if (res.data.success) {
        setChats(res.data.chats);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  useEffect(() => {
    const fetchChatsAndImages = async () => {
      await getAllChats();
    };

    fetchChatsAndImages();
  }, []);

  return (
    <div className={styles.chatnavContainerWrapper}>
      {search
        ? search.map((chat) => (
            <div
              className={styles.chatnavContainer}
              key={chat.username}
              onClick={() => handleOnClick(chat)}
            >
              <img
                src={
                  chat.image
                    ? chat.image
                    : 'https://wallpapers.com/images/hd/whatsapp-dp-cartoon-boy-0cpuu9bby26fdy52.jpg'
                }
                alt="no"
                className={styles.chatImg}
              />
              <div className={styles.chatName}>
                {chat?.username === user.username ? 'Me(You)' : chat.username}
              </div>
            </div>
          ))
        : chats.map((chat) => (
            <div
              className={styles.chatnavContainer}
              key={chat.username}
            onClick={() => handleOnClick(chat)}
            >
              <img
                src={
                  chat.image
                    ? chat.image
                    : 'https://wallpapers.com/images/hd/whatsapp-dp-cartoon-boy-0cpuu9bby26fdy52.jpg'
                }
                alt="User"
                className={styles.chatImg}
              />
              <div className={styles.chatName}>
                {chat?.username === user.username ? 'Me(You)' : chat.username}
              </div>
              {chat.unseenMessages > 0 && (
                <span
                  className={`${styles.chatBadge} ${styles[`len${chat.unseenMessages}`]}`}
                >
                  {chat.unseenMessages}
                </span>
              )}
            </div>
          ))}
    </div>
  );
};

export default ChatNav;
