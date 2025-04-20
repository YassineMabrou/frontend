// EditDeleteCategory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditDeleteCategory = () => {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [updatedData, setUpdatedData] = useState({ name: '', criteria: '' });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_API}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleEdit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/categories/${id}`, updatedData);
      alert('Category updated');
      setEditing(null);
      const refreshed = await axios.get(`${process.env.REACT_APP_BACKEND_API}/categories`);
      setCategories(refreshed.data);
    } catch (err) {
      alert('Error updating category');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_API}/categories/${id}`);
      alert('Category deleted');
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err) {
      alert('Error deleting category');
      console.error(err);
    }
  };

  return (
    <div>
      <h3>Edit/Delete Categories</h3>
      {categories.map(cat => (
        <div key={cat._id} style={{ marginBottom: '1rem' }}>
          {editing === cat._id ? (
            <>
              <input
                value={updatedData.name}
                onChange={e => setUpdatedData({ ...updatedData, name: e.target.value })}
                placeholder="Category Name"
              />
              <input
                value={updatedData.criteria}
                onChange={e => setUpdatedData({ ...updatedData, criteria: e.target.value })}
                placeholder="Criteria"
              />
              <button onClick={() => handleEdit(cat._id)}>💾 Save</button>
              <button onClick={() => setEditing(null)}>❌ Cancel</button>
            </>
          ) : (
            <>
              <strong>{cat.name}</strong> — <em>{cat.criteria || 'No criteria'}</em>
              <button onClick={() => {
                setEditing(cat._id);
                setUpdatedData({ name: cat.name, criteria: cat.criteria || '' });
              }}>✏️ Edit</button>
              <button onClick={() => handleDelete(cat._id)}>🗑️ Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditDeleteCategory;
