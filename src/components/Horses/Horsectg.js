import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState({});
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_BACKEND_API;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await axios.get(`${API_URL}/categories`);
        setCategories(result.data);
      } catch (err) {
        setError('Failed to fetch categories.');
        console.error(err);
      }
    };
    fetchCategories();
  }, [API_URL]);

  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${API_URL}/categories/${categoryId}`);
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
    } catch (error) {
      console.error(error);
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditedCategory({
      name: category.name,
      type: category.type,
      criteria: JSON.stringify(category.criteria || {}, null, 2),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedCategory({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveCategory = async (id) => {
    try {
      const updated = {
        name: editedCategory.name,
        type: editedCategory.type,
        criteria: JSON.parse(editedCategory.criteria || '{}'),
      };

      const res = await axios.put(`${API_URL}/categories/${id}`, updated);
      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? res.data : cat))
      );
      cancelEditing();
    } catch (error) {
      console.error('Failed to save category:', error);
      setError('Invalid JSON in criteria or failed update.');
    }
  };

  return (
    <div>
      <h1>Categories</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Criteria (JSON)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) =>
            editingId === category._id ? (
              <tr key={category._id}>
                <td>
                  <input
                    name="name"
                    value={editedCategory.name}
                    onChange={handleInputChange}
                  />
                </td>
                <td>
                  <select
                    name="type"
                    value={editedCategory.type}
                    onChange={handleInputChange}
                  >
                    <option value="horse">Horse</option>
                    <option value="note">Note</option>
                  </select>
                </td>
                <td>
                  <textarea
                    name="criteria"
                    value={editedCategory.criteria}
                    onChange={handleInputChange}
                    rows={3}
                    cols={30}
                  />
                </td>
                <td>
                  <button onClick={() => saveCategory(category._id)}>Save</button>
                  <button onClick={cancelEditing}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category.type}</td>
                <td>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(category.criteria)}
                  </pre>
                </td>
                <td>
                  <button onClick={() => deleteCategory(category._id)}>Delete</button>
                  <button onClick={() => startEditing(category)}>Edit</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Categories;
