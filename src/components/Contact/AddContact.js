import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddContact.css';

const AddContact = ({ onContactAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    availability: '',
    horses: []
  });

  const [allHorses, setAllHorses] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch horses for the dropdown
    axios.get('http://localhost:7002/api/horses')
      .then(res => setAllHorses(res.data))
      .catch(err => console.error('Failed to fetch horses:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHorseSelect = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedHorseNames = options.map(opt => opt.value);
    setFormData(prev => ({ ...prev, horses: selectedHorseNames }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:7002/api/contacts', formData);
      setMessage('✅ Contact added successfully!');
      setFormData({
        name: '',
        role: '',
        email: '',
        phone: '',
        availability: '',
        horses: []
      });

      onContactAdded && onContactAdded(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred.');
    }
  };

  return (
    <div className="add-contact-container">
      <div className="form-box">
        <h2>Add New Contact</h2>
        <form onSubmit={handleSubmit} className="contact-form">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="role" placeholder="Role" value={formData.role} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
          <input type="text" name="availability" placeholder="Availability" value={formData.availability} onChange={handleChange} required />

          {/* Horse assignment */}
          <label>Assign Horses:</label>
          <select multiple value={formData.horses} onChange={handleHorseSelect} className="multi-select">
            {allHorses.map(horse => (
              <option key={horse._id} value={horse.name}>
                {horse.name}
              </option>
            ))}
          </select>

          {formData.horses.length > 0 && (
            <p className="assigned-preview">
              Assigned: {formData.horses.join(', ')}
            </p>
          )}

          <div className="button-group">
            <button type="submit" className="submit-btn">📤 Submit</button>
          </div>
        </form>

        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
};

export default AddContact;
