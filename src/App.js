import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FaHorse } from 'react-icons/fa'; // Importing the Horse icon from react-icons

import Login from "./components/Login";
import Register from "./components/Register";
import Admin from "./components/Admin";
import Home from "./components/Home";
import Horses from "./components/Horses/Horses";
import Locations from "./components/Locations/Location";
import Contacts from "./components/Contact/Contact";
import Actions from "./components/Actions/Actions";
import Mouvements from "./components/Mouvement/Mouvement";
import Categories from "./components/Categories/Categories";
import Qualifications from "./components/Qualifications/Qualifications";

import './App.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/home" replace />;
  return children;
};

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {  // You can adjust the threshold as needed
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Router>
      <div>
        {!user && (
          <header>
            <h1>Horsemanagement</h1>
            <ul className="nav-links">
              <li>
                <button onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                }} className="auth-button">
                  Log In
                </button>
              </li>
              <li>
                <button onClick={() => {
                  setShowRegister(true);
                  setShowLogin(false);
                }} className="auth-button">
                  Sign Up
                </button>
              </li>
            </ul>
          </header>
        )}

        {!user && (
          <section className="hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <h2>Welcome to Professional Horse Management</h2>
              <p>Efficiently manage your horses with our intuitive platform</p>
              <FaHorse className="hero-icon" />
            </div>
          </section>
        )}

        {!user && (
          <section className="main-content upgraded-text">
            <h2>Why Choose Our Stable Management System?</h2>
            <p>
              Our platform helps you easily manage your horses’ details, including records of procedures, locations,
              and movement tracking. Whether you're managing a small stable or a large equestrian center, our intuitive
              and secure system enables you to streamline your workflow, maintain accurate documentation, and keep your team
              in sync — all from one central dashboard.
            </p>
          </section>
        )}

        {showLogin && (
          <div className="auth-form">
            <Login />
            <button onClick={() => setShowLogin(false)}>Close</button>
          </div>
        )}
        {showRegister && (
          <div className="auth-form">
            <Register />
            <button onClick={() => setShowRegister(false)}>Close</button>
          </div>
        )}

        <Routes>
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/horses" element={<ProtectedRoute><Horses /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
          <Route path="/actions/*" element={<ProtectedRoute><Actions /></ProtectedRoute>} />
          <Route path="/mouvements" element={<ProtectedRoute><Mouvements /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute><Locations /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/qualifications" element={<ProtectedRoute><Qualifications /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showFooter && (
          <footer>
            <p>&copy; 2025 Vnext Consulting | All rights reserved.</p>
          </footer>
        )}
      </div>
    </Router>
  );
};

// ✅ Named export to fix ESLint warning in CI builds
const AppWithProvider = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithProvider;
