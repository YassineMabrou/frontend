import React, { useState, useEffect } from "react";
import axios from "axios";
import './AddAct.css';

const CreateAct = () => {
  const [allHorses, setAllHorses] = useState([]);
  const [selectedHorseIds, setSelectedHorseIds] = useState([]);
  const [horseSearch, setHorseSearch] = useState("");

  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [recurrencePattern, setRecurrencePattern] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationPhoneNumber, setNotificationPhoneNumber] = useState("");

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/horses`);
        setAllHorses(response.data);
      } catch (error) {
        console.error("Error fetching horses:", error);
      }
    };
    fetchHorses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAct = {
      horses: selectedHorseIds,
      type,
      date,
      createdBy,
      reminderDate,
      recurrencePattern,
      notificationEmail,
      notificationPhoneNumber,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_API}/acts`, newAct);
      console.log("Act created successfully:", response.data);
    } catch (error) {
      console.error("Error creating act:", error);
    }
  };

  const toggleHorseSelection = (horseId) => {
    setSelectedHorseIds((prev) =>
      prev.includes(horseId)
        ? prev.filter((id) => id !== horseId)
        : [...prev, horseId]
    );
  };

  return (
    <div className="create-act-wrapper">
      <form onSubmit={handleSubmit}>
        <div>
          <label>Search & Select Horses</label>
          <input
            type="text"
            placeholder="Search horse name..."
            value={horseSearch}
            onChange={(e) => setHorseSearch(e.target.value)}
          />
          {horseSearch.trim() !== '' && (
            <div className="horse-list">
              {allHorses
                .filter((horse) =>
                  horse.name.toLowerCase().includes(horseSearch.toLowerCase())
                )
                .map((horse) => (
                  <div key={horse._id} className="horse-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedHorseIds.includes(horse._id)}
                        onChange={() => toggleHorseSelection(horse._id)}
                      />
                      {horse.name}
                    </label>
                  </div>
                ))}
              {allHorses.filter((horse) =>
                horse.name.toLowerCase().includes(horseSearch.toLowerCase())
              ).length === 0 && (
                <div className="horse-item" style={{ fontStyle: "italic", color: "#999" }}>
                  No horses found
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            <option value="">Select Type</option>
            <option value="Administration">Administration</option>
            <option value="Reproduction">Reproduction</option>
            <option value="Care">Care</option>
            <option value="Treatments">Treatments</option>
            <option value="Vaccines">Vaccines</option>
            <option value="Deworming">Deworming</option>
            <option value="Tests">Tests</option>
            <option value="Training">Training</option>
            <option value="Transport">Transport</option>
            <option value="Performance">Performance</option>
            <option value="Sales">Sales</option>
            <option value="Evaluation">Evaluation</option>
          </select>
        </div>

        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div>
          <label>Created By (User ID)</label>
          <input type="text" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} required />
        </div>

        <div>
          <label>Reminder Date</label>
          <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
        </div>

        <div>
          <label>Recurrence Pattern</label>
          <select value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value)}>
            <option value="">Select Recurrence Pattern</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label>Notification Email</label>
          <input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} />
        </div>

        <div>
          <label>Notification Phone Number</label>
          <input type="text" value={notificationPhoneNumber} onChange={(e) => setNotificationPhoneNumber(e.target.value)} />
        </div>

        <button type="submit">Create Act</button>
      </form>
    </div>
  );
};

export default CreateAct;
