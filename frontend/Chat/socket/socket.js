import { io } from 'socket.io-client';

const getServerURL = () => {
    // Add all possible URLs here
    const urls = [
        'http://localhost:3000',
        'https://44r39gpn-3000.inc1.devtunnels.ms',
    ];

    // Select based on current environment
    const isLocal = window.location.hostname === 'localhost';
    return isLocal ? urls[0] : urls[1];
};

const socket = io(getServerURL(),{transports: ['websocket']}); // Dynamically pick the URL
export default socket;
