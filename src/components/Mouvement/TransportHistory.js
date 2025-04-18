import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransportHistory.css';

const TransportHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch transport history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:7002/api/transports/history');
        setHistory(res.data);
      } catch (error) {
        console.error('❌ Error fetching transport history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="transport-history-wrapper">

      {loading && <p>Loading...</p>}

      {history.length > 0 ? (
        <table className="transport-history-table">
          <thead>
            <tr>
              <th>Horse</th>
              <th>Breed</th>
              <th>Owner</th>
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
            {history.map((entry, idx) => (
              <tr key={idx}>
                <td>{entry.horse?.name}</td>
                <td>{entry.horse?.breed}</td>
                <td>{entry.horse?.owner}</td>
                <td>{entry.transporter}</td>
                <td>{new Date(entry.departureTime).toLocaleString()}</td>
                <td>{new Date(entry.arrivalTime).toLocaleString()}</td>
                <td>{entry.departureLocation}</td>
                <td>{entry.arrivalLocation}</td>
                <td>{entry.conditions}</td>
                <td>{entry.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No transport history found.</p>
      )}
    </div>
  );
};

export default TransportHistory;
