import React, { useState, useEffect } from "react";
import axios from "axios";
import './Assign.css';

const AssignHorseToContact = () => {
  const [contacts, setContacts] = useState([]);
  const [horses, setHorses] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [selectedHorseName, setSelectedHorseName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const CONTACTS_API = `${process.env.REACT_APP_BACKEND_API}/contacts`;
  const HORSES_API = `${process.env.REACT_APP_BACKEND_API}/horses`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, horsesRes] = await Promise.all([
          axios.get(CONTACTS_API),
          axios.get(HORSES_API),
        ]);
        setContacts(contactsRes.data);
        setHorses(horsesRes.data);
      } catch (err) {
        setError("Failed to load contacts or horses.");
      }
    };

    fetchData();
  }, [CONTACTS_API, HORSES_API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${CONTACTS_API}/${selectedContactId}/assign-horse`,
        { horseName: selectedHorseName }
      );
      setMessage(res.data.message);
      setSelectedContactId("");
      setSelectedHorseName("");
    } catch (err) {
      setError(err.response?.data?.error || "Error assigning horse to contact.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-md">
      <h2 className="text-2xl font-bold mb-4">Assign Horse to Contact</h2>

      {error && <p className="text-red-500 mb-3">{error}</p>}
      {message && <p className="text-green-600 mb-3">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={selectedContactId}
          onChange={(e) => setSelectedContactId(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Contact</option>
          {contacts.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedHorseName}
          onChange={(e) => setSelectedHorseName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Horse</option>
          {horses.map((h) => (
            <option key={h._id} value={h.name}>
              {h.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-[#8d6e63] text-white font-bold py-2 px-4 rounded hover:bg-[#6d4c41] w-full"
        >
          Assign Horse
        </button>
      </form>
    </div>
  );
};

export default AssignHorseToContact;
