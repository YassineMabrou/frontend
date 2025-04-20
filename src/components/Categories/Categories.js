import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Categories.css';

const AddHorseCategory = lazy(() => import('./AddHorseCategory'));
const AddNoteCategory = lazy(() => import('./AddNoteCategory'));
const AssignHorseToCategory = lazy(() => import('./AssignHorseToCategory'));
const AssignNoteToCategory = lazy(() => import('./AssignNoteToCategory'));

const Categories = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', criteria: '' });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_API}/categories/${id}`);
        setCategories(categories.filter((cat) => cat._id !== id));
      } catch (error) {
        alert('Error deleting category');
      }
    }
  };

  const handleEditClick = (category) => {
    setEditCategoryId(category._id);
    setEditForm({ name: category.name, criteria: category.criteria || '' });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/categories/${id}`, editForm);
      setEditCategoryId(null);
      fetchCategories();
    } catch (error) {
      alert('Error updating category');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/categories.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <nav className="navbar">
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/horses">Horses</Link></li>
          <li><Link to="/actions">Actions</Link></li>
          <li><Link to="/mouvements">Mouvements</Link></li>
          <li><Link to="/categories">Categories</Link></li>
          <li><Link to="/locations">Location</Link></li>
          <li><Link to="/qualifications">Qualifications</Link></li>
          <li><Link to="/contacts">Contact</Link></li>
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer"
              }}
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>

      <div className="page-container">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
        </button>

        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-menu">
            <li><button className="sidebar-item" onClick={() => setActiveView('addHorse')}>Add a category for horses</button></li>
            <li><button className="sidebar-item" onClick={() => setActiveView('addNote')}>Add a category for notes</button></li>
            <li><button className="sidebar-item" onClick={() => setActiveView('assignHorse')}>Assign Horse to Category</button></li>
            <li><button className="sidebar-item" onClick={() => setActiveView('assignNote')}>Assign Note to Category</button></li>
            <li><button className="sidebar-item" onClick={() => setActiveView('list')}>View all categories</button></li>
          </ul>
        </div>

        <div className="content">
          <Suspense fallback={<div>Loading...</div>}>
            {activeView === 'addHorse' && <AddHorseCategory />}
            {activeView === 'addNote' && <AddNoteCategory />}
            {activeView === 'assignHorse' && <AssignHorseToCategory />}
            {activeView === 'assignNote' && <AssignNoteToCategory />}

            {activeView === 'list' && (
              <>
                <h2 style={{ marginBottom: '20px' }}>📂 Categories List</h2>
                {categories.length === 0 ? (
                  <p>No categories found.</p>
                ) : (
                  <table className="category-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Criteria</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat) => (
                        <tr key={cat._id}>
                          <td>
                            {editCategoryId === cat._id ? (
                              <input
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                              />
                            ) : (
                              cat.name
                            )}
                          </td>
                          <td>{cat.type}</td>
                          <td>
                            {editCategoryId === cat._id ? (
                              <input
                                name="criteria"
                                value={editForm.criteria}
                                onChange={handleEditChange}
                              />
                            ) : (
                              cat.criteria || '-'
                            )}
                          </td>
                          <td>
                            {editCategoryId === cat._id ? (
                              <button className="btn-edit" onClick={() => handleEditSubmit(cat._id)}>💾 Save</button>
                            ) : (
                              <button className="btn-edit" onClick={() => handleEditClick(cat)}>✏️ Modify</button>
                            )}
                            <button className="btn-delete" onClick={() => handleDelete(cat._id)}>🗑️ Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Categories;
