import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './Context/UserContest.jsx'
import axios from 'axios'

// Set the default base URL for Axios using the environment variable
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <App />
  </UserProvider>
);
