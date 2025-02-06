import { io } from 'socket.io-client';

const getServerURL = () => {
  // Get the backend URL from the environment variable
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  // If the environment variable is not set, use the local URL
  return backendURL || 'http://localhost:3000';
};

const socket = io(getServerURL(), { transports: ['websocket'] }); // Dynamically pick the URL
export default socket;
