import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Transport.css';

const Transport = () => {
  const [horses, setHorses] = useState([]);
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

  // Fetch horses list
  useEffect(() => {
    axios.get('http://localhost:7002/api/horses')
      .then((res) => setHorses(res.data))
      .catch((err) => console.error('❌ Error fetching horses:', err));
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
      const res = await axios.post('http://localhost:7002/api/transports', form);
      alert(res.data.message || 'Transport registered successfully');
      resetForm();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || '🚫 Failed to register transport');
    }
  };

  const fetchReport = async () => {
    try {
      const res = await axios.get('http://localhost:7002/api/transports/report');
      setReport(res.data.report);
    } catch (err) {
      console.error('❌ Failed to load report:', err);
    }
  };

  return (
    <div className="transport-wrapper">
      <h2>🚛 Register Transport</h2>

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
        <input type="text" name="departureLocation" placeholder="Departure Location" value={form.departureLocation} onChange={handleChange} required />
        <input type="text" name="arrivalLocation" placeholder="Arrival Location" value={form.arrivalLocation} onChange={handleChange} required />
        <textarea name="conditions" placeholder="Conditions" value={form.conditions} onChange={handleChange} />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />

        <button type="submit">Submit</button>
      </form>

      <button onClick={fetchReport}>Load Report</button>

      {report.length > 0 && (
        <table className="transport-report">
          <thead>
            <tr>
              <th>Horse</th>
              <th>Breed</th>
              <th>Owner</th>
              <th>Transporter</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Conditions</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {report.map((t, idx) => (
              <tr key={idx}>
                <td>{t.horse?.name}</td>
                <td>{t.horse?.breed}</td>
                <td>{t.horse?.owner}</td>
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
