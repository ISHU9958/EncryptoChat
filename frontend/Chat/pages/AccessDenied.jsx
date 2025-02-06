import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AccessDenied.css';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div className="access-denied-container">
            <div className="access-denied-card">
                <div className="lock-icon">🔒</div>
                <h1>Access Denied</h1>
                <p>You don’t have permission to access this page.</p>
                <button onClick={() => navigate("/")}>Go Home</button>
            </div>
        </div>
    );
};

export default AccessDenied;
