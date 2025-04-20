// AddIntervention.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Intervention.css';

const AddIntervention = () => {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    contactId: '',
    horseName: '',
    type: '',
    description: '',
    date: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts`)
      .then(res => setContacts(res.data))
      .catch(() => setError('Failed to load contacts.'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const { contactId, ...interventionData } = form;
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_API}/contacts/${contactId}/intervention`, interventionData);
      setMessage(res.data.message || '✅ Intervention added successfully!');
      setForm({ contactId: '', horseName: '', type: '', description: '', date: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to add intervention.');
    }
  };

  return (
    <div className="intervention-container">
      <h2>Add Intervention</h2>
      {error && <p className="error-msg">{error}</p>}
      {message && <p className="success-msg">{message}</p>}
      <form onSubmit={handleSubmit}>
        <select name="contactId" value={form.contactId} onChange={handleChange} required>
          <option value="">Select Contact</option>
          {contacts.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input name="horseName" placeholder="Horse Name" value={form.horseName} onChange={handleChange} required />
        <input name="type" placeholder="Type of Intervention" value={form.type} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <button type="submit">Add Intervention</button>
      </form>
    </div>
  );
};

export default AddIntervention;
