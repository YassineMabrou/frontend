import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import PredictionForm from "../components/PredictionForm"; // 👈 Import here

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="home-container">
        <h2>Loading user data...</h2>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: "url('/horse.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/horses">Horses</Link></li>
          <li><Link to="/actions">Actions</Link></li>
          <li><Link to="/mouvements">Mouvements</Link></li>
          <li><Link to="/categories">Categories</Link></li>
          <li><Link to="/locations">Location</Link></li>
          <li><Link to="/qualifications">Qualifications</Link></li>
          <li><Link to="/contacts">Contact</Link></li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="content">
        <h1>Welcome, {user.role}</h1>
        <p>You are logged in as <strong>{user.role}</strong>.</p>

        {/* Prediction Form Integration */}
        <div style={{ marginTop: "30px" }}>
          <PredictionForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
