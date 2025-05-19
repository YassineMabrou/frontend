import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './addHorse.css';

const AddHorseForm = () => {
  const [horse, setHorse] = useState({
    name: '',
    coatColor: '',
    birthDate: '',
    sex: '',
    breedCode: '',
    responsibleContacts: '',
    currentLocation: {
      lieu: ''
    }
  });

  const [locations, setLocations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSireKey, setCreatedSireKey] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_API}/lieux`)
      .then(res => setLocations(res.data))
      .catch(err => console.error('Error fetching locations:', err));

    axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts`)
      .then(res => setContacts(res.data))
      .catch(err => console.error('Error fetching contacts:', err));
  }, []);

  const validateForm = () => {
    const requiredFields = ['name', 'coatColor', 'birthDate', 'sex', 'breedCode', 'currentLocation.lieu', 'responsibleContacts'];
    for (let field of requiredFields) {
      const value = field.includes('.') ? horse.currentLocation.lieu : horse[field];
      if (!value) {
        setError('All fields are required.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreatedSireKey(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const birthYear = new Date(horse.birthDate).getFullYear();
      const payload = { ...horse, birthYear };

      const res = await axios.post(`${process.env.REACT_APP_BACKEND_API}/horses/add`, payload);
      alert('Horse added successfully!');

      if (res.data?.horse?.sireKey) {
        setCreatedSireKey(res.data.horse.sireKey);
      }

      setHorse({
        name: '',
        coatColor: '',
        birthDate: '',
        sex: '',
        breedCode: '',
        responsibleContacts: '',
        currentLocation: { lieu: '' }
      });
    } catch (err) {
      console.error(err);
      setError('An error occurred while adding the horse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lieu') {
      setHorse(prev => ({
        ...prev,
        currentLocation: { lieu: value }
      }));
    } else {
      setHorse(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Add a Horse</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {createdSireKey && (
          <p style={{ color: 'green' }}>
            Generated UELN: <strong>{createdSireKey}</strong>
          </p>
        )}

        <label>Name:
          <input type="text" name="name" value={horse.name} onChange={handleChange} placeholder="Horse name" />
        </label>

        <label>Coat Color:
          <select name="coatColor" value={horse.coatColor} onChange={handleChange}>
            <option value="">Select coat color</option>
            <option value="bai">Bay</option>
            <option value="alezan">Chestnut</option>
            <option value="gris">Gray</option>
            <option value="noir">Black</option>
            <option value="autre">Other</option>
          </select>
        </label>

        <label>Birth Date:
          <input type="date" name="birthDate" value={horse.birthDate} onChange={handleChange} />
        </label>

        <label>Sex:
          <select name="sex" value={horse.sex} onChange={handleChange}>
            <option value="">Select sex</option>
            <option value="mâle">Male</option>
            <option value="femelle">Female</option>
            <option value="hongre">Gelding</option>
          </select>
        </label>

        <label>Breed Code:
          <input type="text" name="breedCode" value={horse.breedCode} onChange={handleChange} placeholder="Breed code" />
        </label>

        <label>Responsible Contact:
          <select name="responsibleContacts" value={horse.responsibleContacts} onChange={handleChange}>
            <option value="">Select a contact</option>
            {contacts.map(contact => (
              <option key={contact._id} value={contact._id}>{contact.name}</option>
            ))}
          </select>
        </label>

        <label>Current Location:
          <select name="lieu" value={horse.currentLocation.lieu} onChange={handleChange} required>
            <option value="">Select a location</option>
            {locations.map(loc => (
              <option key={loc._id} value={loc._id}>{loc.name}</option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Add Horse'}
        </button>
      </form>
    </div>
  );
};

export default AddHorseForm;
