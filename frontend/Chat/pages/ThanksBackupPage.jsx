import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/ThanksBackupPage.css";
import AccessDenied from "./AccessDenied";

const ThanksBackupPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const backupKey = location.state?.backupKey;

    useEffect(() => {
        if(backupKey){
            localStorage.clear();
        }
    }, []);

    if (backupKey) {
        // console.log(backupKey);
        return (
            <div className="thanks-container">
                <div className="thanks-card">
                    <h1>Thank You for Using EncryptoChat!</h1>
                    <p>
                        We appreciate you choosing EncryptoChat for secure communication. Please find your backup key below:
                    </p>
                    <div className="backup-key">
                        <strong>{backupKey}</strong>
                    </div>
                    <p className="note">
                        <em>Make sure to save this key securely! You will need it the next time you log in.</em>
                    </p>
                    <div className="button-group">
                        <button
                            className="copy-btn"
                            onClick={() => navigator.clipboard.writeText(backupKey)}
                        >
                            Copy Backup Key
                        </button>
                        <button
                            className="login-btn"
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    } else {
        return <AccessDenied />; // Render the Access Denied page if there's no backup key
    }
};

export default ThanksBackupPage;
