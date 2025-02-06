import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WantedBackUpOrNot.css';
import { generateKeyPair } from '../EncryptionDecryption/GenerateKeys.js';
import axios from 'axios';
import { useUser } from '../src/Context/UserContest.jsx';
import { handlePrivateKeyDecryption } from '../EncryptionDecryption/BackupKeyDecrypt.js';

const WantedBackUpOrNot = () => {
    const [recover, setRecover] = useState(true);
    const [recoveryKey, setRecoveryKey] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // New state for error message
    const navigate = useNavigate();
    const { user } = useUser();

    const handleRecovery = async () => {
        try {
            const privateKey = await handlePrivateKeyDecryption(
                recoveryKey,
                user.privateKey, // mongodb vale privateKey ( encrypted)
                user.iv,
                user.salt
            ); // it will return my original private key which i will store on local storage to maintain it
            
            localStorage.setItem('privateKey', privateKey);
            navigate(`/user/${user.username}`);
        } catch (err) {
            setErrorMessage('Invalid backup key. Please check and try again.'); // Set error message
        }
    };

    const handleProceed = async (e) => {
        e.preventDefault();

        if (recover) {
            setErrorMessage(''); // Clear previous error
            handleRecovery();
        } else {
            try {
                const key = await generateKeyPair();

                const res = await axios.post(
                    '/api/v1/user/save-public-key',
                    { publicKey: key.publicKey },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('chat-token')}`,
                        },
                    }
                );

                if (res.data.success) {
                    localStorage.setItem('privateKey', key.privateKey);
                    navigate(`/user/${user.username}`);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const isButtonDisabled = recover && !recoveryKey.trim(); // Disable button if recovery key is empty

    return (
        <div className="wanted-backup-container">
            <div className="wanted-backup-card">
                <h1>Recover Previous Chats</h1>
                <p>Would you like to recover your previous chats?</p>
                <form onSubmit={handleProceed}>
                    <div className="toggle-group">
                        <label>
                            <input
                                type="radio"
                                name="recover"
                                value="yes"
                                checked={recover}
                                onChange={() => setRecover(true)}
                            />
                            Yes, I want to recover
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="recover"
                                value="no"
                                checked={!recover}
                                onChange={() => setRecover(false)}
                            />
                            No, I don't want to recover
                        </label>
                    </div>

                    {recover && (
                        <div className="recovery-input">
                            <label htmlFor="recovery-key">Enter your recovery key:</label>
                            <input
                                type="text"
                                id="recovery-key"
                                value={recoveryKey}
                                onChange={(e) => {
                                    setRecoveryKey(e.target.value);
                                    setErrorMessage(''); // Clear error message on input change
                                }}
                                placeholder="Enter your recovery key"
                                required={recover}
                            />
                            {/* {errorMessage && console.log(errorMessage)} */}
                            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Show error message */}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="proceed-btn"
                        disabled={isButtonDisabled}
                    >
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WantedBackUpOrNot;
