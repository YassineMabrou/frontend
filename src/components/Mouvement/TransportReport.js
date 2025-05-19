import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transport.css';

const TransportReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/transports/report`);
      setReport(res.data.report);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="transport-report-wrapper">
      <h2>📋 Transport Report</h2>

      <div className="report-actions">
        <button onClick={fetchReport}>🔄 Refresh Report</button>

        {/* CSV Download Link */}
        <a
          href={`${process.env.REACT_APP_BACKEND_API}/transports/report?export=csv`}
          target="_blank"
          rel="noopener noreferrer"
          className="download-link"
        >
          📥 Download as CSV
        </a>
      </div>

      {loading && <p>Loading report...</p>}

      {report.length > 0 ? (
        <table className="transport-report-table">
          <thead>
            <tr>
              <th>Horse</th>
              <th>Transporter</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Departure Location</th>
              <th>Arrival Location</th>
              <th>Conditions</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {report.map((t, idx) => (
              <tr key={idx}>
                <td>{t.horse?.name}</td>
                <td>{t.transporter}</td>
                <td>{new Date(t.departureTime).toLocaleString()}</td>
                <td>{new Date(t.arrivalTime).toLocaleString()}</td>
                <td>{t.departureLocation}</td>
                <td>{t.arrivalLocation}</td>
                <td>{t.conditions}</td>
                <td>{t.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No transport records found.</p>
      )}
    </div>
  );
};

export default TransportReport;
