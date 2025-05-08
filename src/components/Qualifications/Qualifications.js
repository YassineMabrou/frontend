import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // ✅ Import useAuth
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'; // ✅ Import icons
import "./Qualification.css";

// ✅ Use environment variables correctly
const API_URL = `${process.env.REACT_APP_BACKEND_API}/qualifications`;
const HORSES_API = `${process.env.REACT_APP_BACKEND_API}/horses`;

const Qualifications = () => {
  const { user, logout } = useAuth(); // ✅ Access user from context
  const navigate = useNavigate(); // ✅ For redirection after logout
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
  const [manageQualificationPermission, setManageQualificationPermission] = useState(false); // To track user permission
  const [loadingUser, setLoadingUser] = useState(true); // To show loading state

  useEffect(() => {
    if (user?.id) {
      fetchUserPermissions(user.id); // Use user.id from context
    }
    fetchQualifications();
    fetchHorses();
  }, [user]);

  // Fetch user permissions
  const fetchUserPermissions = async (userId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users/${userId}`);
      if (res.data?.permissions) {
        setManageQualificationPermission(res.data.permissions.manage_qualification); // Set permission based on user data
      } else {
        setError("Permissions data not available.");
      }
      setLoadingUser(false); // Set loading to false when permissions are fetched
    } catch (err) {
      console.error("Error fetching user permissions:", err);
      setError("Failed to fetch user permissions.");
      setLoadingUser(false); // In case of error, set loading to false
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
      setForm({
        horseId: "",
        competitionName: "",
        date: "",
        location: "",
        result: "",
        score: "",
      });
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

  const getHorseName = (horseId) => {
    const found = horses.find((h) => h._id === horseId || h._id === horseId?._id);
    return found ? found.name : "Unknown Horse";
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to home page
  };

  // Ensure the user is logged in and has the correct permission
  if (loadingUser) {
    return <div className="home-container">Loading user data...</div>;
  }

  // If the user is not an admin and doesn't have the required permission
  if (user.role !== "admin" && !manageQualificationPermission) {
    return (
      <div
        className="home-container"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/qualification.png)`,
          backgroundSize: 'contain',             // ✅ Ensure the full image fits
          backgroundRepeat: 'repeat-y',          // ✅ Repeat the image vertically
          backgroundPosition: 'top center',      // ✅ Start from the top center
          backgroundAttachment: 'scroll',        // ✅ Scrolls with content
          minHeight: '200vh',                    // ✅ Make the container 2x the height of the screen
          width: '100%',
        }}
      >
        {/* Navbar for user */}
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

        {/* Access Denied Message */}
        <div className="access-denied-container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this content.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/qualification.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Navbar for admin */}
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
          <li><Link to="/logout">Log out</Link></li>
        </ul>
      </nav>

      {/* Page Content */}
      <div className="page-container">
        <button className="sidebar-toggle" onClick={() => setShowForm(!showForm)}>
          <FontAwesomeIcon icon={showForm ? faTimes : faPlus} size="lg" /> {/* Toggle between plus and times icon */}
        </button>

        {/* Add Qualification Form */}
        {showForm && (
          <div className="add-form-container">
            <h3>New Qualification Form</h3>
            {['horseId', 'competitionName', 'date', 'location', 'result', 'score'].map((field) => (
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

        {/* Qualifications List */}
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
