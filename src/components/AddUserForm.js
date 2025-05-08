import React, { useState } from "react";
import authService from "../api/auth";

const AddUserForm = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
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
      // Always assign role "user"
      const payload = { ...formData, role: "user" };

      await authService.register(payload);
      setSuccess("User added successfully.");
      setFormData({ username: "", email: "", password: "" });
      onUserCreated(); // Refresh user list
    } catch (err) {
      setError(err?.message || "Error adding user.");
    }
  };

  return (
    <div style={{ marginTop: "20px", background: "#fff", padding: "15px", borderRadius: "10px" }}>
      <h3>Add New User</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        {/* Role input removed – always "user" */}
        <button type="submit" style={{ marginTop: "10px" }}>Create User</button>
      </form>
    </div>
  );
};

export default AddUserForm;
