import React, { useEffect } from 'react'
import Layout from '../components/Layout'
import socket from '../socket/socket';
import { useUser } from '../src/Context/UserContest';


const Home = ({ takeuser }) => {
  const { user, SetUser } = useUser();
 

  useEffect(()=>{
    socket.emit('register',user?.username)
  },[user]);



  return (
    <>
      <Layout takeuser={takeuser}/>
    </>
  )
}

export default Home;