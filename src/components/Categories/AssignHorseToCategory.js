import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css';


const AssignHorseToCategory = () => {
  const [categories, setCategories] = useState([]);
  const [horses, setHorses] = useState([]);
  const [form, setForm] = useState({ horseId: '', categoryId: '' });

  // Fetch categories and horses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, horseRes] = await Promise.all([
          axios.get(`${process.env.BACKEND_API}/categories`),
          axios.get(`${process.env.BACKEND_API}/horses`)
        ]);
        setCategories(catRes.data);
        setHorses(horseRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.BACKEND_API}/categories/horses`, {
        name: horses.find(h => h._id === form.horseId)?.name,
        categoryId: form.categoryId
      });
      alert('Horse assigned to category');
      setForm({ horseId: '', categoryId: '' });
    } catch (err) {
      alert('Error assigning horse');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h3>Assign Horse to Category</h3>

      {/* Horse dropdown */}
      <select
        value={form.horseId}
        onChange={(e) => setForm({ ...form, horseId: e.target.value })}
        required
      >
        <option value="">Select Horse</option>
        {horses.map(horse => (
          <option key={horse._id} value={horse._id}>
            {horse.name}
          </option>
        ))}
      </select>

      {/* Category dropdown */}
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
  );
};

export default AssignHorseToCategory;
