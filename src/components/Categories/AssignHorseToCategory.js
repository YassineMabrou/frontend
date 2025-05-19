import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css'; // Add your custom styles

const AssignHorseToCategory = () => {
  const [categories, setCategories] = useState([]); // For categories
  const [horses, setHorses] = useState([]); // For horses
  const [form, setForm] = useState({ horseId: '', categoryId: '' });

  // Fetch categories and horses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories from the existing API
        const catRes = await axios.get(`${process.env.REACT_APP_BACKEND_API}/categories`);
        setCategories(catRes.data);

        // Fetch all horses from the API using the dynamic backend URL
        const horseRes = await axios.get(`${process.env.REACT_APP_BACKEND_API}/horses`);
        setHorses(horseRes.data);

        // Debugging log: Check if the horse data is being fetched correctly
        console.log("Fetched horses:", horseRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Submit handler for form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure horse and category IDs are provided
    if (!form.horseId || !form.categoryId) {
      alert('Please select both a horse and a category.');
      return;
    }

    try {
      const selectedHorse = horses.find(h => h._id === form.horseId);

      // Ensure we have a valid horse name to assign to the category
      const horseName = selectedHorse?.name || 'Unknown name'; // Use single name field directly

      if (!horseName) {
        alert('Horse name is required.');
        return;
      }

      // API call to assign the horse to the category using the dynamic backend URL
      await axios.post(`${process.env.REACT_APP_BACKEND_API}/categories/add-horse`, {
        horseId: form.horseId,
        categoryId: form.categoryId,
      });

      alert('Horse assigned to category successfully');
      setForm({ horseId: '', categoryId: '' }); // Reset form
    } catch (err) {
      alert('Error assigning horse');
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="category-form">
        <h3>Assign Horse to Category</h3>

        {/* Horse dropdown */}
        <select
          value={form.horseId}
          onChange={(e) => setForm({ ...form, horseId: e.target.value })}
          required
          className="select-dropdown"
        >
          <option value="">Select Horse</option>
          {horses.length > 0 ? (
            horses.map(horse => (
              <option key={horse._id} value={horse._id}>
                {/* Display the name of the horse directly */}
                {horse.name}
              </option>
            ))
          ) : (
            <option value="">No horses available</option>
          )}
        </select>

        {/* Category dropdown */}
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
          className="select-dropdown"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {/* Render both French and English names separately */}
              {cat.name?.fr ? `${cat.name.fr} (FR)` : ''}{cat.name?.en ? ` / ${cat.name.en} (EN)` : ''}
            </option>
          ))}
        </select>

        <button type="submit" className="submit-btn">Assign</button>
      </form>

      {/* Inline CSS for styling */}
      <style>
        {`
          .form-container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .category-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .select-dropdown {
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: white;
            color: black;
          }
          .select-dropdown option {
            color: black;
          }
          .submit-btn {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          .submit-btn:hover {
            background-color: #45a049;
          }
        `}
      </style>
    </div>
  );
};

export default AssignHorseToCategory;
