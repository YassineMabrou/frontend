import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
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

  useEffect(() => {
    if (user?.id) {
      fetchUserPermissions(user.id);
    }
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
    navigate("/");
  };

  if (loadingUser) {
    return <div className="home-container">Loading user data...</div>;
  }

  if (user.role !== "admin" && !manageQualificationPermission) {
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
        {/* Navbar */}
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
            <li><button onClick={handleLogout} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>Log out</button></li>
          </ul>
        </nav>

        {/* Access Denied */}
        <div className="access-denied-container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this content.</p>
        </div>
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
      {/* Navbar */}
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
          <li><button onClick={handleLogout} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>Log out</button></li>
        </ul>
      </nav>

      {/* Page Content */}
      <div className="page-container">

        {/* Show Form */}
        {showForm ? (
          <div className="add-form-container">
            <h3>{editId ? "Edit Qualification" : "New Qualification Form"}</h3>
            <form onSubmit={handleSubmit}>
              {['horseId', 'competitionName', 'date', 'location', 'result', 'score'].map((field) => (
                <input
                  key={field}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    margin: "8px 0",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    color: "black"
                  }}
                />
              ))}
              <button type="submit" className="add-qualification-btn" style={{ marginTop: "15px" }}>
                Save Qualification
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2>Qualifications List</h2>

            {/* Add Qualification Button BELOW the Title */}
            <div style={{ margin: "20px 0" }}>
              <button className="add-qualification-btn" onClick={() => setShowForm(true)}>
                Add Qualification
              </button>
            </div>

            {/* Qualification Table */}
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
                      <button onClick={() => handleEdit(qualification)} className="edit-btn" style={{ marginRight: "5px" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(qualification._id)} className="delete-btn">
                        Delete
                      </button>
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
