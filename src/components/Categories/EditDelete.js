// EditDeleteCategory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditDeleteCategory = () => {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [updatedData, setUpdatedData] = useState({ name: '', criteria: '' });

  useEffect(() => {
    axios.get('http://localhost:7002/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleEdit = async (id) => {
    try {
      await axios.put(`http://localhost:7002/api/categories/${id}`, updatedData);
      alert('Category updated');
    } catch (err) {
      alert('Error updating category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`http://localhost:7002/api/categories/${id}`);
      alert('Category deleted');
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div>
      <h3>Edit/Delete Categories</h3>
      {categories.map(cat => (
        <div key={cat._id}>
          {editing === cat._id ? (
            <>
              <input value={updatedData.name} onChange={e => setUpdatedData({ ...updatedData, name: e.target.value })} />
              <input value={updatedData.criteria} onChange={e => setUpdatedData({ ...updatedData, criteria: e.target.value })} />
              <button onClick={() => handleEdit(cat._id)}>Save</button>
              <button onClick={() => setEditing(null)}>Cancel</button>
            </>
          ) : (
            <>
              <span>{cat.name}</span> - <span>{cat.criteria}</span>
              <button onClick={() => { setEditing(cat._id); setUpdatedData({ name: cat.name, criteria: cat.criteria }); }}>Edit</button>
              <button onClick={() => handleDelete(cat._id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditDeleteCategory;


