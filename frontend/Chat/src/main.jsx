import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './Context/UserContest.jsx'
// import { UserProvider } from 

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>,
  // </StrictMode>,
)
