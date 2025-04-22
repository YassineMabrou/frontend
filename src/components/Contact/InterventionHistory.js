import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './InterventionHistory.css';

const InterventionHistory = () => {
  const [contactId, setContactId] = useState('');
  const [contacts, setContacts] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts`)
      .then(res => setContacts(res.data))
      .catch(() => setError('Failed to load contacts.'));
  }, []);

  const fetchInterventions = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts/${contactId}/interventions`);
      setInterventions(res.data.interventions);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load interventions.');
      setInterventions([]);
    }
  };

  return (
    <div className="intervention-container">
      <h2>📜 Intervention History</h2>
      {error && <p className="error-msg">{error}</p>}

      <div className="form-group">
        <select value={contactId} onChange={(e) => setContactId(e.target.value)}>
          <option value="">Select Contact</option>
          {contacts.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <button onClick={fetchInterventions}>🔍 Load History</button>
      </div>

      {interventions.length > 0 ? (
        <table className="intervention-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Horse</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {interventions.map((iv, idx) => (
              <tr key={idx}>
                <td>{iv.date?.slice(0, 10)}</td>
                <td>{iv.horseName}</td>
                <td>{iv.type}</td>
                <td>{iv.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : contactId && (
        <p className="no-data-msg">No interventions found for this contact.</p>
      )}
    </div>
  );
};

export default InterventionHistory;
