import React, { useState } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css';

const AddHorseCategory = () => {
  const [name, setName] = useState('');
  const [criteria, setCriteria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = `${process.env.REACT_APP_BACKEND_API}/categories`;
    console.log('POST to:', endpoint); // helpful for debugging

    try {
      await axios.post(endpoint, {
        name,
        type: 'horse',
        criteria,
      });

      alert('Category created!');
      setName('');
      setCriteria('');
    } catch (err) {
      console.error('AxiosError:', err);
      setError('Error creating category. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-form">
      <h2>Add Horse Category</h2>
      <form onSubmit={handleSubmit}>
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
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Category'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default AddHorseCategory;
