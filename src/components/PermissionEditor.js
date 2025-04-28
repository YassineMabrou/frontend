import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_API ;

// Updated permissions list to include 'manage_categories'
const allowedPermissions = [
  "manage_horse",
  "manage_action",
  "manage_movement",
  "manage_location",
  "manage_qualification",
  "manage_contact",
  "manage_categories", // Added this permission
];

const PermissionEditor = ({ userId, onClose }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userPermissions = res.data.permissions || {};
        const filteredPermissions = {};
        allowedPermissions.forEach((key) => {
          filteredPermissions[key] = userPermissions[key] || false;
        });
        setPermissions(filteredPermissions);
      } catch (err) {
        console.error("Error fetching user permissions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleCheckboxChange = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/users/${userId}`, { permissions }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Permissions updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating permissions:", err);
      alert("❌ Failed to update permissions.");
    }
  };

  if (loading) return <p>Loading permissions...</p>;
  if (!permissions) return <p>No permissions found.</p>;

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Edit Permissions</h3>
      <div style={styles.permissionsBox}>
        {allowedPermissions.map((key) => (
          <label key={key} style={styles.checkbox}>
            <input
              type="checkbox"
              checked={permissions[key]}
              onChange={() => handleCheckboxChange(key)}
            />
            <span style={styles.permissionText}>{formatPermissionName(key)}</span>
          </label>
        ))}
      </div>
      <div style={styles.buttons}>
        <button onClick={handleSave} style={styles.saveBtn}>Save</button>
        <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
      </div>
    </div>
  );
};

const formatPermissionName = (key) => {
  return key.replace("manage_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const styles = {
  container: {
    background: "#ffffff", // White background
    border: "1px solid #ccc",
    padding: "20px",
    borderRadius: "8px",
    marginTop: "20px",
  },
  header: {
    color: "#212529", // Black title
    marginBottom: "20px",
  },
  permissionsBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
    marginBottom: "15px",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#212529", // Black text
  },
  permissionText: {
    color: "#212529", // Black text for permission names
    fontWeight: "500",
  },
  buttons: {
    display: "flex",
    gap: "10px",
  },
  saveBtn: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default PermissionEditor;
