import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Categories.css';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [horses, setHorses] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('horse');
  const [criteria, setCriteria] = useState('');
  const [loading, setLoading] = useState(true); // New loading state for categories and category details
  const [error, setError] = useState(null); // New error state
  const { id } = useParams();
  const navigate = useNavigate(); // Replaced useHistory with useNavigate

  const API_URL = 'http://localhost:7002/api'; // Backend API base URL (adjust port if needed)

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const result = await axios.get(`${API_URL}/categories`);
        setCategories(result.data);
      } catch (err) {
        setError('Failed to fetch categories.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch specific category details
  useEffect(() => {
    if (id) {
      const fetchCategoryDetails = async () => {
        setLoading(true);
        try {
          const categoryRes = await axios.get(`${API_URL}/categories/${id}`);
          setCategory(categoryRes.data);
          setName(categoryRes.data.name);
          setType(categoryRes.data.type);
          setCriteria(JSON.stringify(categoryRes.data.criteria));

          const horsesRes = await axios.get(`${API_URL}/horses?category=${id}`);
          setHorses(horsesRes.data);
        } catch (err) {
          setError('Failed to fetch category details.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchCategoryDetails();
    }
  }, [id]);

  // Handle category deletion
  const deleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${API_URL}/categories/${categoryId}`);
      setCategories(categories.filter((category) => category._id !== categoryId));
      navigate('/categories');  // Replaced history.push with navigate
    } catch (error) {
      console.error(error);
    }
  };

  // Handle category update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`${API_URL}/categories/${id}`, {
          name,
          type,
          criteria: JSON.parse(criteria || '{}'),
        });
        navigate(`/categories/${id}`);  // Replaced history.push with navigate
      }
    } catch (error) {
      console.error(error);
      setError('Failed to save category.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') setName(value);
    if (name === 'type') setType(value);
    if (name === 'criteria') setCriteria(value);
  };

  // Render the categories table
  const renderCategoriesTable = () => {
    return (
      <div>
        <h1>Categories</h1>
        {error && <div style={{ color: 'red' }}>{error}</div>} {/* Show error if any */}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Criteria</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>{category.type}</td>
                <td>{JSON.stringify(category.criteria)}</td>
                <td>
                  <button onClick={() => deleteCategory(category._id)}>Delete</button>
                  <Link to={`/categories/${category._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render the category details view
  const renderCategoryDetails = () => {
    if (loading) return <div>Loading...</div>; // Show loading state
    if (error) return <div style={{ color: 'red' }}>{error}</div>; // Show error message

    return (
      <div>
        <h1>{category.name}</h1>
        <h3>Type: {category.type}</h3>
        <h3>Criteria: {JSON.stringify(category.criteria)}</h3>
        <h2>Horses in this Category</h2>
        <ul>
          {horses.map((horse) => (
            <li key={horse._id}>{horse.name}</li>
          ))}
        </ul>
        <Link to={`/categories/edit/${id}`}>Edit Category</Link>
      </div>
    );
  };

  // Render the category edit form
  const renderCategoryEditForm = () => {
    return (
      <div>
        <h1>Edit Category</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Type</label>
            <select name="type" value={type} onChange={handleInputChange} required>
              <option value="horse">Horse</option>
              <option value="note">Note</option>
            </select>
          </div>
          <div>
            <label>Criteria</label>
            <textarea
              name="criteria"
              value={criteria}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Update Category</button>
        </form>
      </div>
    );
  };

  // Conditional rendering based on the route or state
  if (loading) return <div>Loading...</div>; // Show loading state for categories
  if (id && category) {
    return renderCategoryDetails();
  } else if (id) {
    return renderCategoryEditForm();
  } else {
    return renderCategoriesTable(); // Render the categories table instead of list
  }
};

export default Categories;
