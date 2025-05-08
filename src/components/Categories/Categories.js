import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import './Categories.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'; // Importing required icons
import axios from 'axios';

const AddHorseCategory = lazy(() => import('./AddHorseCategory'));
const AddNoteCategory = lazy(() => import('./AddNoteCategory'));
const AssignHorseToCategory = lazy(() => import('./AssignHorseToCategory'));
const AssignNoteToCategory = lazy(() => import('./AssignNoteToCategory'));

const Categories = () => {
  const { user, logout } = useAuth();  // Accessing the logged-in user and role
  const navigate = useNavigate(); // Use navigate for redirecting after logout

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeView, setActiveView] = useState('list');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', criteria: '' });
  const [userPermissions, setUserPermissions] = useState(null); // Store permissions
  const [loading, setLoading] = useState(true); // Loading state for user data

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch categories for display
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch user permissions
  const fetchUserPermissions = async () => {
    if (user?.role !== 'admin') {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserPermissions(res.data.permissions); // Save permissions
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false); // Admin has immediate access
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUserPermissions();
  }, [user]);

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

  // Updated logout function with navigation to the home page (App.js content)
  const handleLogout = () => {
    logout(); // Log the user out from the context
    navigate('/'); // Redirect to the home page (App.js content or login page) after logout
  };

  // Ensure there's a user (to avoid errors if user data isn't loaded yet)
  if (!user || loading) {
    return <div className="home-container">Loading user data...</div>;
  }

  // If the user is not an admin, check their permission for 'manage_categories'
  if (user.role !== 'admin' && !userPermissions?.manage_categories) {
    return (
      <div
        className="home-container"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/categories.png)`,
          backgroundSize: 'contain',             // ✅ Ensure the full image fits
          backgroundRepeat: 'repeat-y',          // ✅ Repeat the image vertically
          backgroundPosition: 'top center',      // ✅ Start from the top center
          backgroundAttachment: 'scroll',        // ✅ Scrolls with content
          minHeight: '200vh',                    // ✅ Make the container 2x the height of the screen
          width: '100%',
        }}
      >
        {/* Navbar for user */}
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
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            </li>
          </ul>
        </nav>

        {/* Access Denied Message */}
        <div className="access-denied-container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this content.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/categories.png)`,
        backgroundSize: 'contain',             // ✅ Ensure the full image fits
        backgroundRepeat: 'repeat-y',          // ✅ Repeat the image vertically
        backgroundPosition: 'top center',      // ✅ Start from the top center
        backgroundAttachment: 'scroll',        // ✅ Scrolls with content
        minHeight: '200vh',                    // ✅ Make the container 2x the height of the screen
        width: '100%',
      }}
    >
      {/* Navbar for admin */}
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
          <li><Link to="/logout">Log out</Link></li>
        </ul>
      </nav>

      {/* Page Content */}
      <div className="page-container">
        {user.role === 'admin' && (
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
          </button>
        )}

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

        {/* Content Area */}
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
