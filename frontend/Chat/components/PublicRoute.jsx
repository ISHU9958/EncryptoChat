import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const navigate = useNavigate();


    if(!localStorage.getItem('chat-token')){
        return children;
    }
    else{
        return <Navigate to={'/'}></Navigate>
    }
};

export default PublicRoute;
