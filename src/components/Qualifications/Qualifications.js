import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { useAuth } from "../../context/AuthContext"; // ✅ Import useAuth
import axios from "axios";
import "./Qualification.css";

// ✅ Use environment variables
const API_URL = `${process.env.REACT_APP_BACKEND_API}/qualifications`;
const HORSES_API = `${process.env.REACT_APP_BACKEND_API}/horses`;

const Qualifications = () => {
  const { logout } = useAuth(); // ✅ Access logout function from context
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

  useEffect(() => {
    fetchQualifications();
    fetchHorses();
  }, []);

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
      <nav className="navbar">
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/horses">Horses</Link></li>
          <li><Link to="/actions">Actions</Link></li>
          <li><Link to="/mouvements">Mouvements</Link></li>
          <li><Link to="/categories">Categories</Link></li>
          <li><Link to="/locations">Location</Link></li>
          <li><Link to="/qualification">Qualifications</Link></li>
          <li><Link to="/contacts">Contact</Link></li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer"
              }}
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>

      <div className="content no-bg" style={{ maxWidth: "1100px", margin: "2rem auto" }}>
        <h1 className="text-2xl font-bold mb-4 text-white">Qualifications</h1>
        <p className="mb-4 text-white">Manage qualifications related to horses or trainers.</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm({
              horseId: "",
              competitionName: "",
              date: "",
              location: "",
              result: "",
              score: "",
            });
          }}
          className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showForm ? "Cancel" : "Add Qualification"}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mb-6">
            <select
              name="horseId"
              value={form.horseId}
              onChange={handleChange}
              className="border p-2 w-[60%] rounded"
              required
            >
              <option value="">Select Horse</option>
              {horses.map((horse) => (
                <option key={horse._id} value={horse._id}>
                  {horse.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="competitionName"
              placeholder="Competition Name"
              value={form.competitionName}
              onChange={handleChange}
              className="border p-2 w-[60%] rounded"
              required
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="border p-2 w-[60%] rounded"
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="border p-2 w-[60%] rounded"
              required
            />
            <input
              type="text"
              name="result"
              placeholder="Result"
              value={form.result}
              onChange={handleChange}
              className="border p-2 w-[60%] rounded"
              required
            />
            <input
              type="number"
              name="score"
              placeholder="Score (optional)"
              value={form.score}
              onChange={handleChange}
              className="border p-2 w-[60%] rounded"
            />
            <button
              type="submit"
              className="bg-[#8d6e63] text-white font-bold py-2 px-6 rounded w-[60%] hover:bg-[#6d4c41]"
            >
              {editId ? "Update Qualification" : "Save Qualification"}
            </button>
          </form>
        )}

        <table className="w-full border border-gray-300 text-sm bg-transparent">
          <thead className="bg-[#8d6e63]/90 text-white">
            <tr>
              <th className="border px-3 py-2">Horse</th>
              <th className="border px-3 py-2">Competition</th>
              <th className="border px-3 py-2">Date</th>
              <th className="border px-3 py-2">Location</th>
              <th className="border px-3 py-2">Result</th>
              <th className="border px-3 py-2">Score</th>
              <th className="border px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {qualifications.map((q) => (
              <tr key={q._id}>
                <td className="border px-3 py-1 bg-transparent">{getHorseName(q.horseId)}</td>
                <td className="border px-3 py-1 bg-transparent">{q.competitionName}</td>
                <td className="border px-3 py-1 bg-transparent">{new Date(q.date).toLocaleDateString()}</td>
                <td className="border px-3 py-1 bg-transparent">{q.location}</td>
                <td className="border px-3 py-1 bg-transparent">{q.result}</td>
                <td className="border px-3 py-1 bg-transparent">{q.score ?? "—"}</td>
                <td className="border px-3 py-1 text-center space-x-2 bg-transparent">
                  <button
                    onClick={() => handleEdit(q)}
                    className="bg-[#6d4c41] text-white px-3 py-1 rounded hover:bg-[#5d4037]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="bg-[#6d4c41] text-white px-3 py-1 rounded hover:bg-[#5d4037]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Qualifications;
