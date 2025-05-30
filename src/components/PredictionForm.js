import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './PredictionForm.css';

const PredictionForm = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setError('');
    setResults([]);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (sheet.length === 0) {
        setError('The file is empty or invalid.');
        return;
      }

      setLoading(true);

      try {
        const horses = sheet.map((row) => ({
          features: Object.values(row).map((value) => {
            const num = parseFloat(value);
            return isNaN(num) ? value : num;
          }),
        }));

        const response = await axios.post(`${process.env.REACT_APP_BACKEND_API}/predict`, { horses });

        const predictions = response.data.map((pred, i) => ({
          row: i + 1,
          prediction: pred,
        }));

        setResults(predictions);
      } catch (err) {
        setError('Error processing file: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="prediction-form">
      <h2>Upload Horse Data File</h2>
      <input type="file" accept=".xlsx, .csv" onChange={handleFileUpload} />

      {loading && <p>Loading predictions...</p>}

      {results.length > 0 && (
        <div className="result">
          <h4>Predictions:</h4>
          <ul>
            {results.map((r, idx) => (
              <li key={idx}>
                <strong>Row {r.row}:</strong> {JSON.stringify(r.prediction)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
