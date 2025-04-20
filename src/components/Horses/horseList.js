import React, { useState } from "react";
import axios from "axios";
import './HorseList.css';

const BASE_API = process.env.REACT_APP_BACKEND_API;
const API_URL = `${BASE_API}/horses`;
const NOTES_URL = `${BASE_API}/notes`;
const PRESCRIPTION_URL = `${BASE_API}/prescriptions`;

const HorseList = () => {
  const [horses, setHorses] = useState([]);
  const [searchParams, setSearchParams] = useState({
    name: "",
    coatColor: "",
    sireNumber: "",
    archived: "",
  });
  const [error, setError] = useState(null);
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [currentHorseId, setCurrentHorseId] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    medication: "",
    dosage: "",
    instructions: "",
  });

  const fetchHorses = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/search`, { params: searchParams });
      setHorses(response.data);
    } catch (error) {
      console.error("Error fetching horses:", error);
      setError("Failed to fetch horses. Please try again.");
    }
  };

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const archiveHorse = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/archive`);
      fetchHorses();
    } catch (error) {
      console.error("Error archiving horse:", error);
    }
  };

  const deleteHorse = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchHorses();
    } catch (error) {
      console.error("Error deleting horse:", error);
    }
  };

  const createPrescription = async () => {
    try {
      await axios.post(PRESCRIPTION_URL, {
        horseId: currentHorseId,
        ...prescriptionData,
      });
      setIsPrescriptionModalOpen(false);
      setPrescriptionData({ medication: "", dosage: "", instructions: "" });
      fetchHorses();
    } catch (error) {
      console.error("Error creating prescription:", error);
      setError("Failed to create prescription. Please try again.");
    }
  };

  const handlePrescriptionChange = (e) => {
    setPrescriptionData({ ...prescriptionData, [e.target.name]: e.target.value });
  };

  const handleSearchClick = () => {
    setIsSearchClicked(true);
    fetchHorses();
  };

  const printHorseInfo = async (horse) => {
    try {
      const notesRes = await axios.get(`${NOTES_URL}/horse/${horse._id}`);
      const presRes = await axios.get(`${PRESCRIPTION_URL}/horse/${horse._id}`);

      const horseNotes = notesRes.data || [];
      const horsePrescriptions = presRes.data || [];

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
        <head>
          <title>Horse Information</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            h3 { margin-top: 30px; }
            .info p { font-size: 14px; line-height: 1.6; margin: 4px 0; }
            ul { margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Horse Information - ${horse.name}</h1>
          <div class="info">
            <p><strong>Name:</strong> ${horse.name}</p>
            <p><strong>Coat Color:</strong> ${horse.coatColor}</p>
            <p><strong>Sire Number:</strong> ${horse.sireNumber}</p>
            <p><strong>Sex:</strong> ${horse.sex}</p>
            <p><strong>Breed Code:</strong> ${horse.breedCode}</p>
            <p><strong>Birth Date:</strong> ${horse.birthDate}</p>
            <p><strong>Date Added:</strong> ${horse.createdAt}</p>
            <p><strong>Archived:</strong> ${horse.archived ? "Yes" : "No"}</p>

            <h3>Notes:</h3>
            <ul>
              ${
                horseNotes.length > 0
                  ? horseNotes.map(note => `<li>${note.content} (by ${note.author})</li>`).join('')
                  : "<li>No notes found.</li>"
              }
            </ul>

            <h3>Prescriptions:</h3>
            <ul>
              ${
                horsePrescriptions.length > 0
                  ? horsePrescriptions.map(p => `<li>${p.medication}: ${p.instructions} (by ${p.issuedBy || "N/A"})</li>`).join('')
                  : "<li>No prescriptions found.</li>"
              }
            </ul>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Error printing horse info:", error);
      alert("Failed to load horse details for printing.");
    }
  };

  return (
    <div className="horse-list-container">
      <h2>Horse Management</h2>

      <div className="search-box">
        <input type="text" name="name" placeholder="Search by name" onChange={handleChange} />
        <input type="text" name="coatColor" placeholder="Search by coat color" onChange={handleChange} />
        <input type="text" name="sireNumber" placeholder="Search by sire number" onChange={handleChange} />
        <select name="archived" onChange={handleChange}>
          <option value="">Show All</option>
          <option value="true">Archived</option>
          <option value="false">Active</option>
        </select>
        <button onClick={handleSearchClick}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {isSearchClicked && (
        <div>
          <table className="horse-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Coat Color</th>
                <th>Sire Number</th>
                <th>Archived</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {horses.length > 0 ? (
                horses.map((horse) => (
                  <tr key={horse._id}>
                    <td>{horse.name}</td>
                    <td>{horse.coatColor}</td>
                    <td>{horse.sireNumber}</td>
                    <td>{horse.archived ? "Yes" : "No"}</td>
                    <td>
                      {!horse.archived && (
                        <button className="action-button" onClick={() => archiveHorse(horse._id)}>
                          Archive
                        </button>
                      )}
                      <button className="action-button" onClick={() => deleteHorse(horse._id)}>
                        Delete
                      </button>
                      <button className="action-button" onClick={() => {
                        setCurrentHorseId(horse._id);
                        setIsPrescriptionModalOpen(true);
                      }}>
                        Prescription
                      </button>
                      <button className="action-button" onClick={() => printHorseInfo(horse)}>
                        Print Information
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No horses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isPrescriptionModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Prescription</h3>
            <label>Medication</label>
            <input
              type="text"
              name="medication"
              value={prescriptionData.medication}
              onChange={handlePrescriptionChange}
            />
            <label>Dosage</label>
            <input
              type="text"
              name="dosage"
              value={prescriptionData.dosage}
              onChange={handlePrescriptionChange}
            />
            <label>Instructions</label>
            <input
              type="text"
              name="instructions"
              value={prescriptionData.instructions}
              onChange={handlePrescriptionChange}
            />
            <button onClick={createPrescription}>Submit</button>
            <button onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorseList;
