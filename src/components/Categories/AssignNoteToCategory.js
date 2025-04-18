import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css';


const AssignNoteToCategory = () => {
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ noteId: '', categoryId: '' });

  // Fetch categories and notes
  useEffect(() => {
    axios.get( `${process.env.BACKEND_API}/categories`)
      .then(res => setCategories(res.data))
      .catch(console.error);

    axios.get( `${process.env.BACKEND_API}/notes`)
      .then(res => setNotes(res.data))
      .catch(console.error);
  }, []);

  // Submit assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Assuming the backend expects the note to contain categoryId
      await axios.put(`${process.env.BACKEND_API}/notes/${form.noteId}`, {
        category: form.categoryId,
      });
      alert('Note assigned to category successfully');
      setForm({ noteId: '', categoryId: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to assign note to category');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="category-form">
        <h3>Assign Note to Category</h3>

        <select
          value={form.noteId}
          onChange={(e) => setForm({ ...form, noteId: e.target.value })}
          required
        >
          <option value="">Select Note</option>
          {notes.map(note => (
            <option key={note._id} value={note._id}>
              {note.content.length > 40 ? note.content.slice(0, 40) + '...' : note.content}
            </option>
          ))}
        </select>

        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        <button type="submit">Assign</button>
      </form>
    </div>
  );
};

export default AssignNoteToCategory;
