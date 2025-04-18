import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Qualification.css"; // Import the CSS file

const QualificationManager = () => {
  const [qualifications, setQualifications] = useState([]);
  const [stats, setStats] = useState([]);
  const [qualificationError, setQualificationError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  // Fetch all qualifications
  const fetchQualifications = async () => {
    try {
      const response = await axios.get("http://localhost:7002/api/qualifications");
      setQualifications(response.data);
    } catch (error) {
      setQualificationError("Error fetching qualifications.");
      console.error("Error fetching qualifications:", error);
    }
  };

  // Fetch performance statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:7002/api/qualifications/stats");
      setStats(response.data);
    } catch (error) {
      setStatsError("Error fetching statistics.");
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchQualifications();
    fetchStats();
  }, []);

  return (
    <div className="qualification-manager">
      <h1>Qualification Manager</h1>

      {/* Error handling */}
      {qualificationError && <p>{qualificationError}</p>}
      {statsError && <p>{statsError}</p>}

      {/* Qualification and Statistics Tables */}
      <div className="tables-container">
        {/* Qualifications List */}
        <div className="table-container">
          <h2>Qualifications List</h2>
          <table>
            <thead>
              <tr>
                <th>Horse Name</th>
                <th>Competition</th>
                <th>Date</th>
                <th>Location</th>
                <th>Result</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {qualifications.length === 0 ? (
                <tr>
                  <td colSpan="6">No qualifications available.</td>
                </tr>
              ) : (
                qualifications.map((qualification) => (
                  <tr key={qualification._id}>
                    <td>{qualification.horseId ? qualification.horseId.name : "N/A"}</td>
                    <td>{qualification.competitionName}</td>
                    <td>{new Date(qualification.date).toLocaleDateString()}</td>
                    <td>{qualification.location}</td>
                    <td>{qualification.result}</td>
                    <td>{qualification.score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Performance Statistics */}
        <div className="table-container">
          <h2>Performance Statistics</h2>
          <table>
            <thead>
              <tr>
                <th>Horse Name</th>
                <th>Average Score</th>
                <th>Number of Qualifications</th>
                <th>Best Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr>
                  <td colSpan="4">No statistics available.</td>
                </tr>
              ) : (
                stats.map((stat, index) => (
                  <tr key={index}>
                    <td>{stat.horseName || "N/A"}</td>
                    <td>{stat.avgScore}</td>
                    <td>{stat.count}</td>
                    <td>{stat.bestScore}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QualificationManager;
