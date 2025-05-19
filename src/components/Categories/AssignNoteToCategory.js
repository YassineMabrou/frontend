import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css';

const AssignNoteToCategory = () => {
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ noteId: '', categoryId: '' });

  // Fetch categories and notes
  useEffect(() => {
    // Fetch categories from the backend
    axios.get(`${process.env.REACT_APP_BACKEND_API}/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        alert("Failed to load categories.");
      });

    // Fetch notes from the backend
    axios.get(`${process.env.REACT_APP_BACKEND_API}/notes`)
      .then((res) => setNotes(res.data))
      .catch((err) => {
        console.error("Failed to fetch notes:", err);
        alert("Failed to load notes.");
      });
  }, []);

  // Handle form submission to assign the note to the category
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form data
    if (!form.noteId || !form.categoryId) {
      alert("Please select both a note and a category.");
      return;
    }

    try {
      // Send the POST request to the backend to assign the note to the category
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/categories/add-note`, // Corrected API endpoint
        { noteId: form.noteId, categoryId: form.categoryId }
      );

      alert('Note successfully assigned to category');

      // Reset the form after successful assignment
      setForm({ noteId: '', categoryId: '' });

    } catch (err) {
      console.error("Error during assignment:", err);
      alert('Failed to assign note to category.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="category-form">
        <h3>Assign Note to Category</h3>

        <div>
          <label htmlFor="noteSelect">Select Note:</label>
          <select
            id="noteSelect"
            value={form.noteId}
            onChange={(e) => setForm({ ...form, noteId: e.target.value })}
            required
          >
            <option value="">Select Note</option>
            {notes.map((note) => (
              <option key={note._id} value={note._id}>
                {note.content.length > 40 ? note.content.slice(0, 40) + '...' : note.content}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="categorySelect">Select Category:</label>
          <select
            id="categorySelect"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name?.fr ? `${cat.name.fr} / ` : ''}{cat.name?.en}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Assign</button>
      </form>
    </div>
  );
};

export default AssignNoteToCategory;
