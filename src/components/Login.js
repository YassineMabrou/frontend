import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Assuming your context is set up properly
import authService from "../api/auth"; // Correct import of authService

const Login = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!credentials.username || !credentials.password) {
      setError("Both username and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.userLogin(credentials);
      const { token, user } = response;

      setUser(user);
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);

      navigate("/home"); // ✅ Always go to /home
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.response?.data?.message || err?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={credentials.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="input-container">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
