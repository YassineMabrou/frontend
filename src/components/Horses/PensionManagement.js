import React, { useState, useEffect } from "react";
import axios from "axios";
import './Pension.css';

const PensionManagement = () => {
  const [pensions, setPensions] = useState([]);
  const [filteredPensions, setFilteredPensions] = useState([]);
  const [horses, setHorses] = useState([]);
  const [showForm, setShowForm] = useState(false); // 👈 New state
  const [pensionDetails, setPensionDetails] = useState({
    horseName: '',
    horseId: '',
    startDate: '',
    endDate: '',
    rate: '',
    billingType: 'daily',
    status: 'active',
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchPensions();
    fetchHorses();
  }, []);

  const fetchPensions = async () => {
    const response = await fetch('http://localhost:7002/api/pensions');
    const data = await response.json();
    setPensions(data);
    setFilteredPensions(data);
  };

  const fetchHorses = async () => {
    try {
      const response = await axios.get('http://localhost:7002/api/horses');
      setHorses(response.data);
    } catch (error) {
      console.error("Error fetching horses:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPensionDetails({
      ...pensionDetails,
      [name]: value,
    });
  };

  const handleHorseSelection = (e) => {
    const selectedHorseId = e.target.value;
    const selectedHorse = horses.find(h => h._id === selectedHorseId);
    setPensionDetails({
      ...pensionDetails,
      horseId: selectedHorse._id,
      horseName: selectedHorse.name,
    });
  };

  const addPension = async () => {
    const response = await fetch('http://localhost:7002/api/pensions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pensionDetails),
    });
    if (response.ok) {
      fetchPensions();
      setPensionDetails({
        horseName: '',
        horseId: '',
        startDate: '',
        endDate: '',
        rate: '',
        billingType: 'daily',
        status: 'active',
      });
      setShowForm(false); // 👈 Hide the form after adding
    }
  };

  const updatePension = async () => {
    const response = await fetch(`http://localhost:7002/api/pensions/${pensionDetails.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pensionDetails),
    });
    if (response.ok) {
      fetchPensions();
      setEditing(false);
      setShowForm(false); // 👈 Hide the form after updating
      setPensionDetails({
        horseName: '',
        horseId: '',
        startDate: '',
        endDate: '',
        rate: '',
        billingType: 'daily',
        status: 'active',
      });
    }
  };

  const deletePension = async (id) => {
    const response = await fetch(`http://localhost:7002/api/pensions/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchPensions();
    }
  };

  const editPension = (pension) => {
    setPensionDetails(pension);
    setEditing(true);
    setShowForm(true); // 👈 Show form when editing
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term) {
      setFilteredPensions(pensions);
      return;
    }
    const filtered = pensions.filter((pension) =>
      pension.horseName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPensions(filtered);
  };

  const printPension = (pension) => {
    const printWindow = window.open("", "Print", "height=400,width=600");
    printWindow.document.write("<html><head><title>Pension Details</title></head><body>");
    printWindow.document.write(`<h1>Pension Details for Horse Name: ${pension.horseName}</h1>`);
    printWindow.document.write(`<p><strong>Rate:</strong> ${pension.rate}</p>`);
    printWindow.document.write(`<p><strong>Start Date:</strong> ${new Date(pension.startDate).toLocaleDateString()}</p>`);
    printWindow.document.write(`<p><strong>End Date:</strong> ${pension.endDate ? new Date(pension.endDate).toLocaleDateString() : "Ongoing"}</p>`);
    printWindow.document.write(`<p><strong>Billing Type:</strong> ${pension.billingType}</p>`);
    printWindow.document.write(`<p><strong>Status:</strong> ${pension.status}</p>`);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="pension-management">
      <h1>Pension Management</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Horse Name"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <button className="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
        {editing ? "Edit Pension" : (showForm ? "Hide Form" : "Add Pension")}
      </button>

      {showForm && (
        <div className="pension-form">
          <select name="horseId" value={pensionDetails.horseId} onChange={handleHorseSelection}>
            <option value="">Select a Horse</option>
            {horses.map(horse => (
              <option key={horse._id} value={horse._id}>
                {horse.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="startDate"
            placeholder="Start Date"
            value={pensionDetails.startDate}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="endDate"
            placeholder="End Date (optional)"
            value={pensionDetails.endDate}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="rate"
            placeholder="Rate"
            value={pensionDetails.rate}
            onChange={handleInputChange}
          />
          <select
            name="billingType"
            value={pensionDetails.billingType}
            onChange={handleInputChange}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={editing ? updatePension : addPension}>
            {editing ? 'Update Pension' : 'Add Pension'}
          </button>
        </div>
      )}

      <div className="pension-list-container">
        <h2>Pensions</h2>
        <div className="table-wrapper">
          <table className="pension-table">
            <thead>
              <tr>
                <th>Horse Name</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Billing Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPensions.map((pension) => (
                <tr key={pension._id}>
                  <td>{pension.horseName}</td>
                  <td>${pension.rate}</td>
                  <td>{pension.status}</td>
                  <td>{new Date(pension.startDate).toLocaleDateString()}</td>
                  <td>{pension.endDate ? new Date(pension.endDate).toLocaleDateString() : "Ongoing"}</td>
                  <td>{pension.billingType}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => editPension(pension)}>Edit</button>
                    <button className="action-btn delete" onClick={() => deletePension(pension._id)}>Delete</button>
                    <button className="action-btn print" onClick={() => printPension(pension)}>Print</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PensionManagement;
