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
      let resolvedHorseId = horseId;

      if (horseNameSearch.trim()) {
        const match = horses.find((h) =>
          h.name.toLowerCase().includes(horseNameSearch.trim().toLowerCase())
        );
        if (match) {
          resolvedHorseId = match._id;
          setHorseId(match._id);
        } else {
          setActs([]);
          return;
        }
      }

      if (!resolvedHorseId) return;

      const params = {
        horseId: resolvedHorseId,
        ...(type && { type }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        sortBy,
        order,
      };

      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/acts`, { params });
      setActs(res.data);
    } catch (err) {
      console.error("Failed to fetch filtered acts:", err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/acts`, {
        params: {
          horseId,
          exportFormat: "csv",
        },
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

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Act History</h2>

      {/* Filters */}
      <div style={filterBoxStyle}>
        <input
          type="text"
          placeholder="Search horse by name"
          value={horseNameSearch}
          onChange={(e) => setHorseNameSearch(e.target.value)}
          style={inputStyle}
        />

        <select
          value={horseId}
          onChange={(e) => setHorseId(e.target.value)}
          style={inputStyle}
        >
          {horses.map((horse) => (
            <option key={horse._id} value={horse._id}>
              {horse.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Type (e.g. vet)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={inputStyle}
        />

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

      {/* Table */}
      <table style={tableStyle}>
        <thead style={{ backgroundColor: "#f1f5f9" }}>
          <tr>
            {["Type", "Date", "Planned", "Observations", "Results", "Reminder"].map((header) => (
              <th key={header} style={thTdStyle}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {acts.length === 0 ? (
            <tr>
              <td colSpan="6" style={noDataStyle}>No acts found for this horse.</td>
            </tr>
          ) : (
            acts.map((act) => (
              <tr key={act._id} style={{ backgroundColor: "#ffffff" }}>
                <td style={thTdStyle}>{act.type}</td>
                <td style={thTdStyle}>{act.date?.split("T")[0]}</td>
                <td style={thTdStyle}>{act.plannedDate?.split("T")[0] || "—"}</td>
                <td style={thTdStyle}>{act.observations || "—"}</td>
                <td style={thTdStyle}>{act.results || "—"}</td>
                <td style={{
                  ...thTdStyle,
                  fontWeight: "600",
                  color: act.reminders ? "#22c55e" : "#ef4444",
                }}>
                  {act.reminders ? "Yes" : "No"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// 🔧 Styles
const containerStyle = {
  padding: "2rem",
  fontFamily: "Segoe UI, sans-serif",
  background: "#f9fafb",
  minHeight: "100vh",
};

const headerStyle = {
  fontSize: "1.75rem",
  fontWeight: "700",
  color: "#1f2937",
  borderLeft: "5px solid #a56d43",
  paddingLeft: "1rem",
  marginBottom: "1.5rem",
};

const filterBoxStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "2rem",
  background: "#ffffff",
  padding: "1.5rem",
  borderRadius: "0.75rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};

const inputStyle = {
  padding: "0.6rem 0.9rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.5rem",
  backgroundColor: "#f9fafb",
  minWidth: "160px",
  fontSize: "0.95rem",
};

const applyBtn = {
  padding: "0.6rem 1rem",
  backgroundColor: "#a56d43",
  color: "#fff",
  border: "none",
  borderRadius: "0.5rem",
  fontWeight: "600",
  cursor: "pointer",
};

const exportBtn = {
  ...applyBtn,
  backgroundColor: "#a56d43",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  borderRadius: "0.75rem",
  overflow: "hidden",
  background: "#ffffff",
  boxShadow: "0 6px 14px rgba(0, 0, 0, 0.04)",
};

const thTdStyle = {
  padding: "1rem",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
  fontSize: "0.95rem",
  color: "#000",
};

const noDataStyle = {
  textAlign: "center",
  padding: "2rem",
  color: "#6b7280",
  fontStyle: "italic",
};

export default ActHistory;
