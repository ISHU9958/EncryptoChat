import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../src/Context/UserContest';
import axios from 'axios';
import { message } from 'antd';

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const {user,setUser}=useUser();
    
    const getUser=async()=>{

        try {
            const res =await  axios.get('/api/v1/user/getUser',{
                headers:{
                    'authorization':`Bearer ${localStorage.getItem('chat-token')}`
                }
            });
            if(res.data.success){
                setUser(res.data.user);
            }else{
                message.error(res.data.message);
                localStorage.clear();
                navigate('/login');
            }
            
        } catch (error) {

            localStorage.clear();
            navigate('/login');
        }
    }



    useEffect(()=>{
        getUser();
    },[]);

    if(localStorage.getItem('chat-token')){
        return children;
    }else{
        return <Navigate to={'/login'}></Navigate>
    }
};

export default PrivateRoute;
