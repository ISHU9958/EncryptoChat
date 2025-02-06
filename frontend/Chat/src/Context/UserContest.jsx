import React, { createContext, useState, useContext } from 'react';

// Create the UserContext
const UserContext = createContext();

// Create a Provider Component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({}); 

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access to the context
export const useUser = () => {
    return useContext(UserContext);
};
