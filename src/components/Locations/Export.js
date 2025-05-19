import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ExportLieu.css';

const ExportLieu = () => {
  const [lieux, setLieux] = useState([]);
  const [selectedLieu, setSelectedLieu] = useState('');
  const [format, setFormat] = useState('pdf');
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_BACKEND_API;

  useEffect(() => {
    // Fetch the list of locations
    axios.get(`${API_BASE}/lieux`)
      .then((res) => setLieux(res.data))
      .catch((err) => setError('Failed to load locations: ' + err.message));
  }, [API_BASE]);

  const handleExport = async () => {
    if (!selectedLieu || !format) {
      return alert('Please select both a location and export format.');
    }

    try {
      const link = document.createElement('a');
      link.href = `${API_BASE}/lieux/${selectedLieu}/export?format=${format}`;  // API call to export in selected format
      link.setAttribute('download', `lieu_export.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exporting: ' + err.message);
    }
  };

  return (
    <div className="export-container">
      <h2>📤 Export Lieu Data</h2>

      {error && <p className="error">{error}</p>}

      <div className="export-controls">
        <select value={selectedLieu} onChange={(e) => setSelectedLieu(e.target.value)}>
          <option value="">Select a location</option>
          {lieux.map((lieu) => (
            <option key={lieu._id} value={lieu._id}>{lieu.name}</option>
          ))}
        </select>

        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
        </select>

        <button onClick={handleExport}>Export</button>
      </div>
    </div>
  );
};

export default ExportLieu;
