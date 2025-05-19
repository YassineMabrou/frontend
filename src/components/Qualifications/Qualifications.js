import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import "./Qualification.css";

const API_URL = `${process.env.REACT_APP_BACKEND_API}/qualifications`;
const HORSES_API = `${process.env.REACT_APP_BACKEND_API}/horses`;

const Qualifications = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [qualifications, setQualifications] = useState([]);
  const [horses, setHorses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    horseId: "",
    competitionName: "",
    date: "",
    location: "",
    result: "",
    score: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [manageQualificationPermission, setManageQualificationPermission] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (user?.id) fetchUserPermissions(user.id);
    fetchQualifications();
    fetchHorses();
  }, [user]);

  const fetchUserPermissions = async (userId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users/${userId}`);
      if (res.data?.permissions) {
        setManageQualificationPermission(res.data.permissions.manage_qualification);
      } else {
        setError("Permissions data not available.");
      }
      setLoadingUser(false);
    } catch (err) {
      console.error("Error fetching user permissions:", err);
      setError("Failed to fetch user permissions.");
      setLoadingUser(false);
    }
  };

  const fetchQualifications = async () => {
    try {
      const res = await axios.get(API_URL);
      setQualifications(res.data);
    } catch (err) {
      setError("Failed to load qualifications.");
    }
  };

  const fetchHorses = async () => {
    try {
      const res = await axios.get(HORSES_API);
      setHorses(res.data);
    } catch (err) {
      setError("Failed to load horses.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form);
      } else {
        await axios.post(API_URL, form);
      }
      setForm({ horseId: "", competitionName: "", date: "", location: "", result: "", score: "" });
      setEditId(null);
      setShowForm(false);
      fetchQualifications();
    } catch (err) {
      setError("Failed to save qualification.");
    }
  };

  const handleEdit = (qualification) => {
    setForm({
      horseId: qualification.horseId?._id || qualification.horseId,
      competitionName: qualification.competitionName,
      date: qualification.date.slice(0, 10),
      location: qualification.location,
      result: qualification.result,
      score: qualification.score || "",
    });
    setEditId(qualification._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchQualifications();
    } catch (err) {
      setError("Failed to delete qualification.");
    }
  };

  // ✅ Safe version to prevent null/undefined errors
  const getHorseName = (horseId) => {
    if (!horseId) return "Unknown Horse";
    const id = typeof horseId === "object" ? horseId._id : horseId;
    if (!id) return "Unknown Horse";
    const found = horses.find((h) => h._id === id);
    return found ? found.name : "Unknown Horse";
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
  };

  if (loadingUser) return <div className="home-container">Loading user data...</div>;

  if (user.role !== "admin" && !manageQualificationPermission) {
    return (
      <div className="home-container" style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/qualification.png)`,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'top center',
        backgroundAttachment: 'scroll',
        minHeight: '200vh',
        width: '100%',
      }}>
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
            <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Log out</button></li>
          </ul>
        </nav>

        <div className="access-denied-container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this content.</p>
        </div>

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
      </div>
    );
  }

  return (
    <div className="home-container" style={{
      backgroundImage: `url(${process.env.PUBLIC_URL}/qualification.png)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      width: "100%",
    }}>
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
          <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Log out</button></li>
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

      <div className="page-container">
        <button className="sidebar-toggle" onClick={() => setShowForm(!showForm)}>
          <FontAwesomeIcon icon={showForm ? faTimes : faPlus} size="lg" />
        </button>

        {showForm && (
          <div className="add-form-container">
            <h3>New Qualification Form</h3>
            {["horseId", "competitionName", "date", "location", "result", "score"].map((field) => (
              <input
                key={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
            <button onClick={handleSubmit}>Save Qualification</button>
          </div>
        )}

        {!showForm && (
          <div>
            <h2>Qualifications List</h2>
            <table>
              <thead>
                <tr>
                  <th>Horse</th>
                  <th>Competition Name</th>
                  <th>Location</th>
                  <th>Result</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {qualifications.map((qualification) => (
                  <tr key={qualification._id}>
                    <td>{getHorseName(qualification.horseId)}</td>
                    <td>{qualification.competitionName}</td>
                    <td>{qualification.location}</td>
                    <td>{qualification.result}</td>
                    <td>
                      <button onClick={() => handleEdit(qualification)}>Edit</button>
                      <button onClick={() => handleDelete(qualification._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Qualifications;
