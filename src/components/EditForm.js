// src/components/EditForm.js

import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_API;

const EditForm = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "user",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/users/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSave(); // Refresh user list or reload data
      onClose(); // Close the form
    } catch (err) {
      console.error("❌ Error updating user:", err);
      alert("Failed to update user.");
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        marginTop: "20px",
        color: "black", // Ensure all text inside is black
      }}
    >
      <h3 style={{ color: "black" }}>Edit User</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", color: "black" }}>Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              color: "black",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", color: "black" }}>Email:</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              color: "black",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", color: "black" }}>Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              color: "black",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ marginTop: "10px" }}>
          <button
            type="submit"
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              backgroundColor: "#8d6e63", // <== updated to #8d6e63
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#8d6e63", // <== updated to #8d6e63
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditForm;
