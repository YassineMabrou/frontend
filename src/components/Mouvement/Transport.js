import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transport.css';

const Transport = () => {
  const [horses, setHorses] = useState([]);
  const [locations, setLocations] = useState([]); // Added state for locations
  const [form, setForm] = useState({
    horse: '',
    transporter: '',
    departureTime: '',
    arrivalTime: '',
    departureLocation: '',
    arrivalLocation: '',
    conditions: '',
    notes: '',
  });

  const [report, setReport] = useState([]);

  useEffect(() => {
    // Fetch horses data
    axios.get(`${process.env.REACT_APP_BACKEND_API}/horses`)
      .then((res) => setHorses(res.data))
      .catch((err) => console.error('❌ Error fetching horses:', err));

    // Fetch locations data (from the new API endpoint)
    axios.get(`${process.env.REACT_APP_BACKEND_API}/lieux`)
      .then((res) => setLocations(res.data))
      .catch((err) => console.error('❌ Error fetching locations:', err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      horse: '',
      transporter: '',
      departureTime: '',
      arrivalTime: '',
      departureLocation: '',
      arrivalLocation: '',
      conditions: '',
      notes: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_API}/transports`, form);
      alert(res.data.message || 'Transport registered successfully');
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || '🚫 Failed to register transport');
    }
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/transports/report`);
      setReport(res.data.report);
    } catch (err) {
      console.error('❌ Failed to load report:', err);
    }
  };

  return (
    <div className="transport-component">
      <h2 className="transport-title" style={{ color: 'black' }}>🚛 Register Transport</h2>

      <form onSubmit={handleSubmit} className="transport-form">
        <select name="horse" value={form.horse} onChange={handleChange} required>
          <option value="">Select Horse</option>
          {horses.map((h) => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>

        <input type="text" name="transporter" placeholder="Transporter" value={form.transporter} onChange={handleChange} required />
        <input type="datetime-local" name="departureTime" value={form.departureTime} onChange={handleChange} required />
        <input type="datetime-local" name="arrivalTime" value={form.arrivalTime} onChange={handleChange} required />

        {/* Departure Location Dropdown */}
        <select name="departureLocation" value={form.departureLocation} onChange={handleChange} required>
          <option value="">Select Departure Location</option>
          {locations.map((location) => (
            <option key={location._id} value={location._id}>{location.name}</option>
          ))}
        </select>

        {/* Arrival Location Dropdown */}
        <select name="arrivalLocation" value={form.arrivalLocation} onChange={handleChange} required>
          <option value="">Select Arrival Location</option>
          {locations.map((location) => (
            <option key={location._id} value={location._id}>{location.name}</option>
          ))}
        </select>

        <textarea name="conditions" placeholder="Conditions" value={form.conditions} onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />

        <button type="submit" className="submit-button">Submit</button>
      </form>

      <button onClick={fetchReport} className="load-report-button">📄 Load Report</button>

      {report.length > 0 && (
        <table className="transport-table">
          <thead>
            <tr style={{ color: 'black' }}>
              <th>Horse</th>
              <th>Transporter</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Conditions</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {report.map((t, idx) => (
              <tr key={idx} style={{ color: 'black' }}>
                <td>{t.horse?.name}</td>
                <td>{t.transporter}</td>
                <td>{new Date(t.departureTime).toLocaleString()}</td>
                <td>{new Date(t.arrivalTime).toLocaleString()}</td>
                <td>{t.conditions}</td>
                <td>{t.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transport;
