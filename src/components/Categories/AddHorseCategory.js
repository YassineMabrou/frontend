import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignNoteToCategory.css';

const AddHorseCategory = () => {
  const [nameFr, setNameFr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [criteria, setCriteria] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  // Fetch existing categories to populate parent dropdown
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_API}/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name: { fr: nameFr.trim(), en: nameEn.trim() },
      type: 'horse',
      criteria: criteria ? { description: criteria.trim() } : {},
      isPublic,
      parentCategory: parentCategoryId || null,
    };

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_API}/categories`, payload);
      alert('Horse category added!');
      setNameFr('');
      setNameEn('');
      setCriteria('');
      setIsPublic(false);
      setParentCategoryId('');
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create horse category. Check console for details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <h3>Add Horse Category</h3>
      {error && <p className="error">{error}</p>}

      <input type="text" placeholder="Name (French)" value={nameFr} onChange={(e) => setNameFr(e.target.value)} required />
      <input type="text" placeholder="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
      <input type="text" placeholder="Criteria (optional)" value={criteria} onChange={(e) => setCriteria(e.target.value)} />

      <label style={{ color: 'black' }}>
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Public Category
      </label>

      <label style={{ color: 'black', marginTop: '10px' }}>
        Parent Category (optional)
        <select value={parentCategoryId} onChange={(e) => setParentCategoryId(e.target.value)}>
          <option value="">-- None --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name?.fr} / {cat.name?.en}
            </option>
          ))}
        </select>
      </label>

      <button type="submit">Add</button>
    </form>
  );
};

export default AddHorseCategory;
