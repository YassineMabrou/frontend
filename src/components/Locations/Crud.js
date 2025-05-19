import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Location.css';

const API_URL = `${process.env.REACT_APP_BACKEND_API}/lieux`;

const LocationManager = () => {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    name: '',
    address: '',
    postalCode: '',
    city: '',
    type: '',
    capacity: '',
    subLocations: [],
  });
  const [editingId, setEditingId] = useState(null);
  const [editingSubLocation, setEditingSubLocation] = useState(null);
  const [error, setError] = useState('');
  const [subLocationForm, setSubLocationForm] = useState({
    name: '',
    type: '',
    capacity: '',
    dimensions: { length: '', width: '', height: '' },
  });

  const fetchLocations = async () => {
    try {
      const res = await axios.get(API_URL);
      setLocations(res.data);
    } catch (err) {
      setError('Failed to fetch locations');
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubLocationChange = (e) => {
    const { name, value } = e.target;
    setSubLocationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubLocationDimensionsChange = (e) => {
    const { name, value } = e.target;
    setSubLocationForm((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        capacity: parseInt(form.capacity),
        subLocations: form.subLocations,
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setEditingId(null);
      } else {
        await axios.post(API_URL, payload);
      }
      setForm({
        name: '',
        address: '',
        postalCode: '',
        city: '',
        type: '',
        capacity: '',
        subLocations: [],
      });
      fetchLocations();
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  const handleEdit = (location) => {
    setForm(location);
    setEditingId(location._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      await axios.delete(`${API_URL}/${id}`);
      fetchLocations();
    }
  };

  const handleArchive = async (id) => {
    await axios.patch(`${API_URL}/${id}/archive`);
    fetchLocations();
  };

  const handleAddSubLocation = () => {
    setForm((prev) => ({
      ...prev,
      subLocations: [
        ...prev.subLocations,
        {
          ...subLocationForm,
          dimensions: {
            length: subLocationForm.dimensions.length,
            width: subLocationForm.dimensions.width,
            height: subLocationForm.dimensions.height,
          },
        },
      ],
    }));
    setSubLocationForm({
      name: '',
      type: '',
      capacity: '',
      dimensions: { length: '', width: '', height: '' },
    });
  };

  const handleDeleteSubLocation = (index) => {
    const updatedSubLocations = form.subLocations.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, subLocations: updatedSubLocations }));
  };

  return (
    <div className="home-container">
      <h1>📍 Location Manager</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} className="location-form">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          required
        />
        <input
          name="postalCode"
          value={form.postalCode}
          onChange={handleChange}
          placeholder="Postal Code"
          required
        />
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
          required
        />
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Type"
          required
        />
        <input
          name="capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
          placeholder="Capacity"
          required
        />

        <div className="sub-location-form">
          <h3>Sub-locations</h3>
          <input
            name="name"
            value={subLocationForm.name}
            onChange={handleSubLocationChange}
            placeholder="Sub-location Name"
            required
          />
          <input
            name="type"
            value={subLocationForm.type}
            onChange={handleSubLocationChange}
            placeholder="Type"
            required
          />
          <input
            name="capacity"
            type="number"
            value={subLocationForm.capacity}
            onChange={handleSubLocationChange}
            placeholder="Sub-location Capacity"
            required
          />
          <input
            name="length"
            value={subLocationForm.dimensions.length}
            onChange={handleSubLocationDimensionsChange}
            placeholder="Length"
            required
          />
          <input
            name="width"
            value={subLocationForm.dimensions.width}
            onChange={handleSubLocationDimensionsChange}
            placeholder="Width"
            required
          />
          <input
            name="height"
            value={subLocationForm.dimensions.height}
            onChange={handleSubLocationDimensionsChange}
            placeholder="Height"
            required
          />
          <button type="button" onClick={handleAddSubLocation}>
            Add Sub-location
          </button>
        </div>

        <button type="submit">{editingId ? 'Update' : 'Add'} Location</button>
      </form>

      <table className="location-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>City</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc._id}>
              <td>{loc.name}</td>
              <td>{loc.city}</td>
              <td>{loc.type}</td>
              <td>{loc.capacity}</td>
              <td>
                <button className="btn-edit" onClick={() => handleEdit(loc)}>
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(loc._id)}
                >
                  🗑️ Delete
                </button>
                {!loc.archived && (
                  <button
                    className="btn-archive"
                    onClick={() => handleArchive(loc._id)}
                  >
                    📦 Archive
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LocationManager;
