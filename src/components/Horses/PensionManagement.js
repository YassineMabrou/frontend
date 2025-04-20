import React, { useState, useEffect } from "react";
import axios from "axios";
import './Pension.css';

const PensionManagement = () => {
  const API = process.env.REACT_APP_BACKEND_API;

  const [pensions, setPensions] = useState([]);
  const [filteredPensions, setFilteredPensions] = useState([]);
  const [horses, setHorses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pensionDetails, setPensionDetails] = useState({
    horseName: '',
    horseId: '',
    startDate: '',
    endDate: '',
    rate: '',
    billingType: 'daily',
    status: 'active',
  });

  useEffect(() => {
    fetchPensions();
    fetchHorses();
  }, []);

  const fetchPensions = async () => {
    const response = await fetch(`${API}/pensions`);
    const data = await response.json();
    setPensions(data);
    setFilteredPensions(data);
  };

  const fetchHorses = async () => {
    try {
      const response = await axios.get(`${API}/horses`);
      setHorses(response.data);
    } catch (error) {
      console.error("Error fetching horses:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPensionDetails({ ...pensionDetails, [name]: value });
  };

  const handleHorseSelection = (e) => {
    const selectedHorseId = e.target.value;
    const selectedHorse = horses.find(h => h._id === selectedHorseId);
    if (selectedHorse) {
      setPensionDetails({
        ...pensionDetails,
        horseId: selectedHorse._id,
        horseName: selectedHorse.name,
      });
    }
  };

  const addPension = async () => {
    const response = await fetch(`${API}/pensions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pensionDetails),
    });
    if (response.ok) {
      fetchPensions();
      resetForm();
    }
  };

  const updatePension = async () => {
    const response = await fetch(`${API}/pensions/${pensionDetails.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pensionDetails),
    });
    if (response.ok) {
      fetchPensions();
      resetForm();
    }
  };

  const deletePension = async (id) => {
    const response = await fetch(`${API}/pensions/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchPensions();
    }
  };

  const editPension = (pension) => {
    setPensionDetails(pension);
    setEditing(true);
    setShowForm(true);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term) {
      setFilteredPensions(pensions);
      return;
    }
    const filtered = pensions.filter((p) =>
      p.horseName.toLowerCase().includes(term.toLowerCase())
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

  const resetForm = () => {
    setPensionDetails({
      horseName: '',
      horseId: '',
      startDate: '',
      endDate: '',
      rate: '',
      billingType: 'daily',
      status: 'active',
    });
    setShowForm(false);
    setEditing(false);
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
            value={pensionDetails.startDate}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="endDate"
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
          <select name="billingType" value={pensionDetails.billingType} onChange={handleInputChange}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={editing ? updatePension : addPension}>
            {editing ? "Update Pension" : "Add Pension"}
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
              {filteredPensions.map(p => (
                <tr key={p._id}>
                  <td>{p.horseName}</td>
                  <td>${p.rate}</td>
                  <td>{p.status}</td>
                  <td>{new Date(p.startDate).toLocaleDateString()}</td>
                  <td>{p.endDate ? new Date(p.endDate).toLocaleDateString() : "Ongoing"}</td>
                  <td>{p.billingType}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => editPension(p)}>Edit</button>
                    <button className="action-btn delete" onClick={() => deletePension(p._id)}>Delete</button>
                    <button className="action-btn print" onClick={() => printPension(p)}>Print</button>
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
