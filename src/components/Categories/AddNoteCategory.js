// AddNoteCategory.js
import React, { useState } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css';

const AddNoteCategory = () => {
  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_API}/categories/notes`, { name, criteria });
      alert('Note category added successfully');
      setName('');
      setCriteria('');
    } catch (err) {
      alert('Error adding note category');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h3>Add Note Category</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category Name"
        required
      />
      <input
        type="text"
        value={criteria}
        onChange={(e) => setCriteria(e.target.value)}
        placeholder="Criteria"
        required
      />
      <button type="submit">Add</button>
    </form>
  );
};

export default AddNoteCategory;
