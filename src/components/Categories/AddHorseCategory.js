import React, { useState } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css';


const AddHorseCategory = () => {
  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.BACKEND_API}/acts/categories`, {
        name,
        type: 'horse',
        criteria,
      });
      alert("Category created!");
      setName('');
      setCriteria('');
    } catch (error) {
      alert("Error creating category.");
    }
  };

  return (
    <div className="category-form">
      <h2>Add Horse Category</h2>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" required />
        <input value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="Criteria" />
        <button type="submit">Add Category</button>
      </form>
    </div>
  );
};

export default AddHorseCategory;
