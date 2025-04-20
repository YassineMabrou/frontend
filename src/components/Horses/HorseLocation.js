import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HorseLocation.css';

const HorseLocationApp = () => {
  const [horseId, setHorseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [horses, setHorses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const BASE_API = process.env.REACT_APP_BACKEND_API;
  const HORSE_API = `${BASE_API}/horses`;
  const LOCATION_API = `${BASE_API}/lieux`;
  const HORSE_ASSIGN_API = `${BASE_API}/lieux/assign`;

  const fetchData = async () => {
    try {
      const [horsesRes, locationsRes] = await Promise.all([
        axios.get(HORSE_API),
        axios.get(LOCATION_API),
      ]);
      setHorses(horsesRes.data);
      setLocations(locationsRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch horses or locations.');
    }
  };

  const assignLocation = async () => {
    if (!horseId || !locationId) {
      setMessage('');
      setError('Please select both a horse and a location.');
      return;
    }

    try {
      await axios.post(HORSE_ASSIGN_API, {
        horseId,
        lieuId: locationId,
      });
      setMessage('Horse assigned successfully!');
      setError('');
      setHorseId('');
      setLocationId('');
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error('Error assigning location:', err);
      setMessage('');
      setError('Failed to assign horse to location.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getHorseName = (id) => horses.find((h) => h._id === id)?.name || 'Unknown';

  const assignmentRows = locations.flatMap((loc) =>
    loc.horses?.map((hId) => ({
      horseName: getHorseName(hId),
      locationName: loc.name,
      date: new Date(loc.updatedAt).toLocaleString(),
    })) || []
  );

  return (
    <div className="container">
      <h1>Assign Horse to Location</h1>

      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}

      <button className="assign-toggle-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Assign Horse'}
      </button>

      {showForm && (
        <div className="assign-form">
          <h3>Assign Form</h3>
          <label>
            Horse:
            <select value={horseId} onChange={(e) => setHorseId(e.target.value)}>
              <option value="">Select Horse</option>
              {horses.map((horse) => (
                <option key={horse._id} value={horse._id}>
                  {horse.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Location:
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">Select Location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </label>

          <button onClick={assignLocation}>Confirm Assignment</button>
        </div>
      )}

      <h2>Assigned Horses</h2>
      {assignmentRows.length === 0 ? (
        <p>No horses assigned yet.</p>
      ) : (
        <table className="assignment-table">
          <thead>
            <tr>
              <th>Horse Name</th>
              <th>Location Name</th>
              <th>Assigned Date</th>
            </tr>
          </thead>
          <tbody>
            {assignmentRows.map((row, index) => (
              <tr key={index}>
                <td>{row.horseName}</td>
                <td>{row.locationName}</td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HorseLocationApp;
