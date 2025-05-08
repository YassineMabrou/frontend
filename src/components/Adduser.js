// src/components/AddUser.js
import React, { useState } from "react";
import auth from "../api/auth"; // Adjust path to your API service

const AddUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user", // Only admin creates users
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await auth.register(formData); // You can rename to `createUser` if preferred
      setSuccess("User created successfully!");
      setFormData({ username: "", email: "", password: "", role: "user" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create user.";
      setError(msg);
    }
  };

  return (
    <div className="add-user-container">
      <h2>Add New User</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default AddUser;
