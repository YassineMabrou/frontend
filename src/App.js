import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [user]);

  return (
    <Router>
      <div>
        {/* Header */}
        {!user && (
          <header>
            <h1>Horsemanagement</h1>
            <ul className="nav-links">
              <li>
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setShowRegister(false);
                  }}
                  className="auth-button"
                >
                  Log In
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setShowRegister(true);
                    setShowLogin(false);
                  }}
                  className="auth-button"
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </header>
        )}

        {/* Hero Section */}
        {!user && (
          <section className="hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <h2>Easy Horse Management</h2>
              <p>A Stable Place for Your Horse Records!</p>
            </div>
          </section>
        )}

        {/* Main Content */}
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

        {/* Login/Register Forms */}
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

        {/* Routes */}
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

        {/* Footer */}
        <footer>
          <p>&copy; 2025 Vnext Consulting | All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);
