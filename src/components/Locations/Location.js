import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Locations.css';

const LOCATIONS_URL = `${process.env.REACT_APP_BACKEND_API}/lieux`;

const CurrentLocation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [allLocations, setAllLocations] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '', address: '', postalCode: '', city: '', type: '', capacity: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await fetch(LOCATIONS_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllLocations(data);
      } else {
        setErrorMessage('Unexpected response from server.');
      }
    } catch (err) {
      setErrorMessage('Failed to fetch locations: ' + err.message);
    }
  };

  const handleChange = (e, id = null) => {
    const { name, value } = e.target;
    if (id) {
      setAllLocations(locations =>
        locations.map(loc =>
          loc._id === id ? { ...loc, [name]: value } : loc
        )
      );
    } else {
      setNewLocation(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (id) => {
    try {
      const location = allLocations.find(l => l._id === id);
      const res = await fetch(`${LOCATIONS_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      });
      if (res.ok) {
        await fetchLocations();
        setEditingId(null);
      } else {
        alert('Update failed.');
      }
    } catch (err) {
      alert('Error updating: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      await fetch(`${LOCATIONS_URL}/${id}`, { method: 'DELETE' });
      setAllLocations(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Archive this location?')) return;
    try {
      await fetch(`${LOCATIONS_URL}/${id}/archive`, { method: 'PATCH' });
      await fetchLocations();
    } catch (err) {
      alert('Error archiving: ' + err.message);
    }
  };

  const handleCreate = async () => {
    const missing = Object.entries(newLocation).find(([_, v]) => !v.trim());
    if (missing) return alert("Please fill out all fields before submitting.");

    try {
      const res = await fetch(LOCATIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation)
      });
      if (res.ok) {
        setNewLocation({ name: '', address: '', postalCode: '', city: '', type: '', capacity: '' });
        await fetchLocations();
        setShowAddForm(false);
      } else {
        const err = await res.json();
        alert('Creation failed: ' + err.error);
      }
    } catch (err) {
      alert('Error creating: ' + err.message);
    }
  };

  const handleExport = (id, format) => {
    const link = document.createElement('a');
    link.href = `${LOCATIONS_URL}/${id}/export?format=${format}`;
    link.setAttribute('download', `lieu_${id}.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/location.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <nav className="navbar">
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/horses">Horses</Link></li>
          <li><Link to="/actions">Actions</Link></li>
          <li><Link to="/mouvements">Mouvements</Link></li>
          <li><Link to="/categories">Categories</Link></li>
          <li><Link to="/locations">Location</Link></li>
          <li><Link to="/qualifications">Qualifications</Link></li>
          <li><Link to="/contacts">Contact</Link></li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer"
              }}
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>

      <div className="content no-bg" style={{ maxWidth: "1100px", margin: "2rem auto" }}>
        <h1>📍 All Registered Locations</h1>
        {errorMessage && <p className="error">{errorMessage}</p>}

        {/* ✅ Now visible to all users */}
        <button className="toggle-add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? '➖ Cancel' : '➕ Add New Location'}
        </button>

        {showAddForm && (
          <div className="add-form-container">
            <h3>New Location Form</h3>
            {['name', 'address', 'postalCode', 'city', 'type', 'capacity'].map(field => (
              <input
                key={field}
                name={field}
                value={newLocation[field]}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            ))}
            <button className="btn-add" onClick={handleCreate}>Create</button>
          </div>
        )}

        <table className="location-table">
          <thead>
            <tr>
              <th>Name</th><th>Type</th><th>City</th><th>Address</th>
              <th>Postal</th><th>Capacity</th><th>Archived</th>
              <th>Created</th><th>Updated</th><th>Actions</th><th>Export</th>
            </tr>
          </thead>
          <tbody>
            {allLocations.map(location => (
              <tr key={location._id}>
                {['name', 'type', 'city', 'address', 'postalCode', 'capacity'].map(field => (
                  <td key={field}>
                    {editingId === location._id ? (
                      <input
                        name={field}
                        value={location[field] || ''}
                        onChange={(e) => handleChange(e, location._id)}
                      />
                    ) : (
                      location[field]
                    )}
                  </td>
                ))}
                <td>{location.archived ? "Yes" : "No"}</td>
                <td>{new Date(location.createdAt).toLocaleString()}</td>
                <td>{new Date(location.updatedAt).toLocaleString()}</td>
                <td>
                  {user.role === 'admin' && (
                    <>
                      {editingId === location._id ? (
                        <>
                          <button className="btn-save" onClick={() => handleUpdate(location._id)}>✅</button>
                          <button className="btn-cancel" onClick={() => setEditingId(null)}>❌</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => setEditingId(location._id)}>✏️</button>
                          <button className="btn-delete" onClick={() => handleDelete(location._id)}>🗑️</button>
                          {!location.archived && (
                            <button className="btn-archive" onClick={() => handleArchive(location._id)}>📦</button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </td>
                <td>
                  {user.role === 'admin' && (
                    <>
                      <button onClick={() => handleExport(location._id, 'pdf')} className="btn-export">📄</button>
                      <button onClick={() => handleExport(location._id, 'csv')} className="btn-export">📊</button>
                      <button onClick={() => handleExport(location._id, 'excel')} className="btn-export">📈</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentLocation;
