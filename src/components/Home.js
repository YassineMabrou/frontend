import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./home.css";
import PredictionForm from "../components/PredictionForm";
import PermissionEditor from "../components/PermissionEditor";
import AddUserForm from "../components/AddUserForm";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_API;

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editingPermissionsUserId, setEditingPermissionsUserId] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // 🔁 New state

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

  useEffect(() => {
    fetchAllUsers();
  }, [user]);

  const handleLogout = () => {
    setShowLogoutConfirm(true); // 🔁 Show modal
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
  };

  const handleEdit = (userToEdit) => {
    setEditingUserId(userToEdit._id);
    setEditFormData({
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      role: userToEdit.role || 'user',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/users/${editingUserId}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingUserId(null);
      setEditFormData({});
      fetchAllUsers();
    } catch (err) {
      console.error("❌ Error saving user:", err);
      alert("Failed to save user.");
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const handleEditPermissions = (userId) => {
    setEditingPermissionsUserId(userId);
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/users/${userId}`, {
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
        backgroundRepeat: "repeat-y",
        backgroundSize: "contain",
        backgroundPosition: "top center",
        backgroundAttachment: "scroll",
        minHeight: "200vh",
        width: "100%",
      }}
    >
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
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Are you sure you want to log out?</h3>
            <div className="modal-buttons">
              <button className="confirm" onClick={confirmLogout}>Yes</button>
              <button className="cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        <h1 style={{ color: "black" }}>
          Welcome, {user.name || user.username || user.email}
        </h1>
        <p style={{ color: "black" }}>
          You are logged in as <strong>{user.role}</strong>.
        </p>

        {user.role === "admin" && (
          <div className="user-list" style={styles.userList}>
            <h2 style={{ color: "black" }}>All Users</h2>
            <button onClick={() => setShowAddUserForm((prev) => !prev)} style={{ ...buttonStyle(), marginBottom: "10px" }}>
              {showAddUserForm ? "Cancel" : "Add New User"}
            </button>

            {showAddUserForm && (
              <AddUserForm
                onUserCreated={() => {
                  setShowAddUserForm(false);
                  fetchAllUsers();
                }}
              />
            )}

            {users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #ccc" }}>
                    <th style={{ color: "black" }}>Name</th>
                    <th style={{ color: "black" }}>Email</th>
                    <th style={{ color: "black" }}>Role</th>
                    <th style={{ color: "black" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ color: "black" }}>
                        {editingUserId === u._id ? (
                          <input type="text" name="name" value={editFormData.name} onChange={handleInputChange} />
                        ) : (
                          u.name || u.username || "Unnamed"
                        )}
                      </td>
                      <td style={{ color: "black" }}>
                        {editingUserId === u._id ? (
                          <input type="email" name="email" value={editFormData.email} onChange={handleInputChange} />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td style={{ color: "black" }}>
                        {editingUserId === u._id ? (
                          <select name="role" value={editFormData.role} onChange={handleInputChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          u.role || "user"
                        )}
                      </td>
                      <td>
                        {editingUserId === u._id ? (
                          <>
                            <button onClick={handleSave} style={buttonStyle()}>Save</button>
                            <button onClick={handleCancelEdit} style={buttonStyle()}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(u)} style={buttonStyle()}>Edit</button>
                            <button onClick={() => handleDelete(u._id)} style={buttonStyle()}>Delete</button>
                            <button onClick={() => handleEditPermissions(u._id)} style={buttonStyle()}>Edit Permissions</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

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
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default Home;
