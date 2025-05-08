import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import PredictionForm from "../components/PredictionForm";
import PermissionEditor from "../components/PermissionEditor";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_API;

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingPermissionsUserId, setEditingPermissionsUserId] = useState(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (user?.role === "admin") {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${API_URL}/Userr`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(res.data);
        } catch (err) {
          console.error("❌ Error fetching users:", err);
        }
      }
    };

    fetchAllUsers();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEdit = (userToEdit) => {
    const displayName = userToEdit.name || userToEdit.username || userToEdit.email || "Unknown";
    alert(`Editing user: ${displayName}`);
  };

  const handleEditPermissions = (userId) => {
    setEditingPermissionsUserId(userId);
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/Userr/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  if (!user) {
    return (
      <div className="home-container">
        <h2>Loading user data...</h2>
      </div>
    );
  }

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
        <h1 style={{ color: "black" }}>
          Welcome, {user.name || user.username || user.email}
        </h1>
        <p style={{ color: "black" }}>
          You are logged in as <strong>{user.role}</strong>.
        </p>

        {/* Admin User Table */}
        {user.role === "admin" && (
          <div className="user-list" style={styles.userList}>
            <h2 style={{ color: "black" }}>All Users</h2>
            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ccc" }}>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td>{u.name || u.username || "Unnamed"}</td>
                      <td>{u.email}</td>
                      <td>{u.role || "user"}</td>
                      <td>
                        <button onClick={() => handleEdit(u)} style={buttonStyle()}>Edit</button>
                        <button onClick={() => handleDelete(u._id)} style={buttonStyle()}>Delete</button>
                        <button onClick={() => handleEditPermissions(u._id)} style={buttonStyle()}>Edit Permissions</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Permissions Editor */}
            {editingPermissionsUserId && (
              <div style={{ marginTop: "20px" }}>
                <PermissionEditor
                  userId={editingPermissionsUserId}
                  onClose={() => setEditingPermissionsUserId(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* Prediction Form */}
        <div style={{ marginTop: "30px" }}>
          <PredictionForm />
        </div>
      </div>
    </div>
  );
};

const buttonStyle = () => ({
  marginRight: "8px",
  padding: "5px 10px",
  backgroundColor: "#a56d43",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
});

const styles = {
  userList: {
    marginTop: "40px",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  }
};

export default Home;
