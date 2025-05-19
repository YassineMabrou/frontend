import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Analysis.css";

const API_BASE_URL = process.env.REACT_APP_BACKEND_API;

const AnalysisManager = () => {
  const [analyses, setAnalyses] = useState([]);
  const [horses, setHorses] = useState([]);
  const [acts, setActs] = useState([]);
  const [formData, setFormData] = useState({
    horse: "",
    act: "",
    testType: "",
    result: "",
    file: null,
  });
  const [filters, setFilters] = useState({ horse: "", act: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHorses();
    fetchActs();
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.horse) {
        const matchedHorse = horses.find((h) =>
          h.name.toLowerCase().includes(filters.horse.toLowerCase())
        );
        if (matchedHorse) params.horse = matchedHorse._id;
      }
      if (filters.act) {
        const matchedAct = acts.find((a) =>
          a.type.toLowerCase().includes(filters.act.toLowerCase())
        );
        if (matchedAct) params.act = matchedAct._id;
      }
      const res = await axios.get(`${API_BASE_URL}/analyses`, { params });
      setAnalyses(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("❌ Error while retrieving analyses.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHorses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/horses`);
      setHorses(res.data);
    } catch (err) {
      console.error("Error loading horses:", err);
    }
  };

  const fetchActs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/acts`);
      setActs(res.data);
    } catch (err) {
      console.error("Error loading acts:", err);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = "";

      if (formData.file instanceof File) {
        const uploadData = new FormData();
        uploadData.append("file", formData.file);
        const uploadRes = await axios.post(`${API_BASE_URL}/analyses/upload`, uploadData);
        fileUrl = uploadRes.data.fileUrl;
      } else {
        fileUrl = formData.file; // reuse existing file
      }

      const payload = {
        horse: formData.horse,
        act: formData.act,
        testType: formData.testType,
        result: formData.result,
        file: fileUrl,
      };

      if (editingId) {
        await axios.put(`${API_BASE_URL}/analyses/${editingId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/analyses`, payload);
      }

      resetForm();
      await fetchAnalyses();
    } catch (err) {
      console.error(err);
      setError("❌ Error while submitting the analysis.");
    }
  };

  const resetForm = () => {
    setFormData({ horse: "", act: "", testType: "", result: "", file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditingId(null);
  };

  const handleEdit = (analysis) => {
    setFormData({
      horse: analysis.horse?._id || analysis.horse,
      act: analysis.act?._id || analysis.act,
      testType: analysis.testType,
      result: analysis.result,
      file: analysis.file,
    });
    setEditingId(analysis._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/analyses/${id}`);
      await fetchAnalyses();
    } catch (err) {
      console.error("❌ Error deleting analysis:", err);
      setError("❌ Failed to delete analysis.");
    }
  };

  const getHorseName = (horse) => {
    if (!horse) return "Unknown";
    if (typeof horse === "object" && horse.name) return horse.name;
    const found = horses.find((h) => h._id === horse);
    return found?.name || "Unknown";
  };

  const getActType = (act) => {
    if (!act) return "Unknown";
    if (typeof act === "object" && act.type) return act.type;
    const found = acts.find((a) => a._id === act);
    return found?.type || "Unknown";
  };

  return (
    <div className="analysis-container">
      <h2>📊 Health Analysis List</h2>
      {error && <div className="analysis-error">{error}</div>}

      <div className="analysis-filters">
        <input
          type="text"
          placeholder="🔍 Horse name"
          value={filters.horse}
          onChange={(e) => setFilters({ ...filters, horse: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && fetchAnalyses()}
        />
        <input
          type="text"
          placeholder="🔍 Act type"
          value={filters.act}
          onChange={(e) => setFilters({ ...filters, act: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && fetchAnalyses()}
        />
        <button onClick={fetchAnalyses}>Filter</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
<h3>
  {editingId ? (
    "✏️ Edit Analysis"
  ) : (
    <span style={{ color: "black" }}> New Analysis</span>
  )}
</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}
          title={showForm ? "Hide form" : "Show form"}
        >
          {showForm ? "🙈" : "👁️"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="analysis-form">
          <select
            value={formData.horse}
            onChange={(e) => setFormData({ ...formData, horse: e.target.value })}
            required
          >
            <option value="">Select a horse</option>
            {horses.map((horse) => (
              <option key={horse._id} value={horse._id}>
                {horse.name}
              </option>
            ))}
          </select>

          <select
            value={formData.act}
            onChange={(e) => setFormData({ ...formData, act: e.target.value })}
            required
          >
            <option value="">Select an act</option>
            {acts.map((act) => (
              <option key={act._id} value={act._id}>
                {act.type}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Test type"
            value={formData.testType}
            onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Result"
            value={formData.result}
            onChange={(e) => setFormData({ ...formData, result: e.target.value })}
            required
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
          />
          <button type="submit">{editingId ? "Update" : "Add"}</button>
        </form>
      )}

      {loading ? (
        <p>⏳ Loading analyses...</p>
      ) : (
        <table className="analysis-table">
          <thead>
            <tr>
              <th>Horse</th>
              <th>Act</th>
              <th>Test Type</th>
              <th>Result</th>
              <th>Date</th>
              <th>PDF</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {analyses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>No analyses found.</td>
              </tr>
            ) : (
              analyses.map((a) => {
                const pdfLink = a.file?.startsWith("http") ? a.file : `${API_BASE_URL}${a.file}`;
                return (
                  <tr key={a._id}>
                    <td>{getHorseName(a.horse)}</td>
                    <td>{getActType(a.act)}</td>
                    <td>{a.testType}</td>
                    <td>{a.result}</td>
                    <td>{a.date ? new Date(a.date).toLocaleDateString() : "—"}</td>
                    <td>
                      {a.file ? (
                        <a href={pdfLink} target="_blank" rel="noopener noreferrer">📄 View PDF</a>
                      ) : "None"}
                    </td>
                    <td>
                      <button
  onClick={() => handleEdit(a)}
  style={{
    marginRight: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#1976d2",
    fontWeight: "bold",
    
                      
                        
  }}
  title="Edit"
>
  Edit
</button>

                      <button
                        onClick={() => handleDelete(a._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#8d6e63",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                        title="Delete"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnalysisManager;
