import React, { useEffect, useState } from "react";
import axios from "axios";

const ActHistory = () => {
  const [horseId, setHorseId] = useState("");
  const [horses, setHorses] = useState([]);
  const [horseNameSearch, setHorseNameSearch] = useState("");
  const [acts, setActs] = useState([]);
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");

  const [editResultId, setEditResultId] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [resultForm, setResultForm] = useState({ results: "", observations: "" });
  const [commentForm, setCommentForm] = useState({ comments: "" });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_API}/horses`)
      .then((res) => {
        setHorses(res.data);
        if (res.data.length > 0) {
          setHorseId(res.data[0]._id);
        }
      })
      .catch((err) => console.error("Failed to fetch horses:", err));
  }, []);

  const handleApplyFilters = async () => {
    try {
      const params = {
        ...(horseId && { horseId }),
        ...(horseNameSearch.trim() && { name: horseNameSearch.trim() }),
        ...(type && { type }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        sortBy,
        order,
      };

      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/acts/history`, { params });
      setActs(res.data);
    } catch (err) {
      console.error("Failed to fetch filtered acts:", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        horseId,
        ...(horseNameSearch.trim() && { name: horseNameSearch.trim() }),
        exportFormat: "csv",
      };

      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/acts/history`, {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "act_history.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("CSV download failed:", err);
    }
  };

  const handleEditResult = (act) => {
    setEditResultId(act._id);
    setResultForm({
      results: act.results || "",
      observations: act.observations || "",
    });
  };

  const handleSaveResult = async (actId) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/acts/${actId}`, resultForm);
      setEditResultId(null);
      handleApplyFilters();
    } catch (err) {
      console.error("Error updating result/observation:", err);
    }
  };

  const handleEditComment = (act) => {
    setEditCommentId(act._id);
    setCommentForm({ comments: act.comments || "" });
  };

  const handleSaveComment = async (actId) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/acts/${actId}/comment`, {
        comments: commentForm.comments,
      });

      setEditCommentId(null);
      setCommentForm({ comments: "" });
      handleApplyFilters();
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Act History</h2>

      <div style={filterBoxStyle}>
        <input type="text" placeholder="Search horse by name" value={horseNameSearch} onChange={(e) => setHorseNameSearch(e.target.value)} style={inputStyle} />
        <select value={horseId} onChange={(e) => setHorseId(e.target.value)} style={inputStyle}>
          {horses.map((horse) => (
            <option key={horse._id} value={horse._id}>{horse.name}</option>
          ))}
        </select>
        <input type="text" placeholder="Type" value={type} onChange={(e) => setType(e.target.value)} style={inputStyle} />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyle}>
          <option value="date">Date</option>
          <option value="type">Type</option>
          <option value="plannedDate">Planned Date</option>
        </select>
        <select value={order} onChange={(e) => setOrder(e.target.value)} style={inputStyle}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <button onClick={handleApplyFilters} style={applyBtn}>Apply Filters</button>
        <button onClick={handleExportCSV} style={exportBtn} disabled={acts.length === 0}>Export CSV</button>
      </div>

      <table style={tableStyle}>
        <thead style={{ backgroundColor: "#f1f5f9" }}>
          <tr>
            <th style={thTdStyle}>Type</th>
            <th style={thTdStyle}>Date</th>
            <th style={thTdStyle}>Planned</th>
            <th style={thTdStyle}>Observations</th>
            <th style={thTdStyle}>Results</th>
            <th style={thTdStyle}>Reminder</th>
            <th style={thTdStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {acts.length === 0 ? (
            <tr><td colSpan="7" style={noDataStyle}>No acts found for this horse.</td></tr>
          ) : (
            acts.map((act) => (
              <React.Fragment key={act._id}>
                <tr>
                  <td style={thTdStyle}>{act.type}</td>
                  <td style={thTdStyle}>{act.date?.split("T")[0]}</td>
                  <td style={thTdStyle}>{act.plannedDate?.split("T")[0] || "—"}</td>
                  <td style={thTdStyle}>{act.observations || "—"}</td>
                  <td style={thTdStyle}>{act.results || "—"}</td>
                  <td style={{ ...thTdStyle, fontWeight: "600", color: act.reminders ? "#22c55e" : "#ef4444" }}>{act.reminders ? "Yes" : "No"}</td>
                  <td style={thTdStyle}>
                    <button onClick={() => handleEditResult(act)} style={{ ...applyBtn, padding: "4px 8px" }}>📝</button>
                    <button onClick={() => handleEditComment(act)} style={{ ...applyBtn, padding: "4px 8px", marginLeft: "5px" }}>💬</button>
                  </td>
                </tr>
                {editResultId === act._id && (
                  <tr>
                    <td colSpan="7" style={editRowStyle}>
                      <input type="text" placeholder="Results" value={resultForm.results} onChange={(e) => setResultForm({ ...resultForm, results: e.target.value })} style={inputStyle} />
                      <textarea placeholder="Observations" value={resultForm.observations} onChange={(e) => setResultForm({ ...resultForm, observations: e.target.value })} style={{ ...inputStyle, height: "80px" }} />
                      <div style={{ marginTop: "0.5rem" }}>
                        <button onClick={() => handleSaveResult(act._id)} style={applyBtn}>💾 Save</button>
                        <button onClick={() => setEditResultId(null)} style={exportBtn}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
                {editCommentId === act._id && (
                  <tr>
                    <td colSpan="7" style={editRowStyle}>
                      <textarea placeholder="Comment" value={commentForm.comments} onChange={(e) => setCommentForm({ ...commentForm, comments: e.target.value })} style={{ ...inputStyle, height: "80px" }} />
                      <div style={{ marginTop: "0.5rem" }}>
                        <button onClick={() => handleSaveComment(act._id)} style={applyBtn}>💾 Save</button>
                        <button onClick={() => setEditCommentId(null)} style={exportBtn}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan="7" style={{ backgroundColor: "#f3f4f6", padding: "1rem", color: "#000" }}>
                    <strong style={{ color: "#000" }}>Comment:</strong> {act.comments || "—"}
                  </td>
                </tr>
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const containerStyle = { padding: "2rem", fontFamily: "Segoe UI, sans-serif", background: "#f9fafb", minHeight: "100vh" };
const headerStyle = { fontSize: "1.75rem", fontWeight: "700", color: "#1f2937", borderLeft: "5px solid #a56d43", paddingLeft: "1rem", marginBottom: "1.5rem" };
const filterBoxStyle = { display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem", background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };
const inputStyle = { padding: "0.6rem 0.9rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", backgroundColor: "#f9fafb", minWidth: "160px", fontSize: "0.95rem" };
const applyBtn = { padding: "0.5rem 0.8rem", backgroundColor: "#a56d43", color: "#fff", border: "none", borderRadius: "0.5rem", fontWeight: "600", cursor: "pointer" };
const exportBtn = { ...applyBtn, backgroundColor: "#6b7280" };
const tableStyle = { width: "100%", borderCollapse: "collapse", borderRadius: "0.75rem", overflow: "hidden", background: "#ffffff", boxShadow: "0 6px 14px rgba(0, 0, 0, 0.04)" };
const thTdStyle = { padding: "1rem", borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "0.95rem", color: "#000" };
const noDataStyle = { textAlign: "center", padding: "2rem", color: "#6b7280", fontStyle: "italic" };
const editRowStyle = { padding: "1rem", background: "#eef2f7", display: "flex", flexDirection: "column", gap: "0.75rem" };

export default ActHistory;
