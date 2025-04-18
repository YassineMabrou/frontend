import React, { createContext, useState, useContext } from "react";

// Create context
const AuthContext = createContext();

// Create AuthProvider to manage the state and provide it to children
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initially, no user is logged in

  // Method to log in the user
  const login = (userData) => setUser(userData);  // You will call this method after a successful login
  
  // Method to log out the user
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the AuthContext
const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthContext, AuthProvider, useAuth };
