import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Categories.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const AddHorseCategory = lazy(() => import('./AddHorseCategory'));
const AddNoteCategory = lazy(() => import('./AddNoteCategory'));
const AssignHorseToCategory = lazy(() => import('./AssignHorseToCategory'));
const AssignNoteToCategory = lazy(() => import('./AssignNoteToCategory'));

const Categories = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]); // Categories data
  const [activeView, setActiveView] = useState('list');
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: { fr: '', en: '' },
    criteria: '',
    parent: '',
  });
  const [userPermissions, setUserPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [horseNames, setHorseNames] = useState({}); // Store horse names by ID
  const [noteNames, setNoteNames] = useState({}); // Store note names by ID

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/categories`);
      setCategories(res.data);
      fetchHorsesAndNotes(res.data); // Fetch all horses and notes after categories are fetched
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchHorsesAndNotes = async (categories) => {
    let horseIds = [];
    let noteIds = [];

    // Collect horse and note IDs from categories
    categories.forEach((category) => {
      if (category.type === 'horse' && Array.isArray(category.horses)) {  // Ensure horses is an array
        horseIds = [...horseIds, ...category.horses];
      }
      if (category.type === 'note' && Array.isArray(category.notes)) {  // Ensure notes is an array
        noteIds = [...noteIds, ...category.notes];
      }
    });

    // Fetch all horses' data
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/horses`); // Fetch all horses data
      const horses = res.data;

      // Log the horses data to see if it's coming correctly
      console.log("Fetched horses:", horses);

      // Create a map of horse IDs to names
      const horseNamesObj = horses.reduce((acc, horse) => {
        acc[horse._id] = horse.name; // Store horse name by ID
        return acc;
      }, {});

      // Log the map of horse names
      console.log("Horse names object:", horseNamesObj);

      setHorseNames(horseNamesObj); // Set all horses by ID
    } catch (error) {
      console.error('Error fetching horses:', error);
    }

    // Fetch note names by their IDs
    try {
      const noteRequests = noteIds.map((noteId) =>
        axios.get(`${process.env.REACT_APP_BACKEND_API}/notes/${noteId}`).then((res) => res.data)
      );
      const notes = await Promise.all(noteRequests);
      const noteNamesObj = notes.reduce((acc, note) => {
        acc[note._id] = note.content; // Assuming 'content' is the name of the note
        return acc;
      }, {});
      setNoteNames(noteNamesObj);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchUserPermissions = async () => {
    if (user?.role !== 'admin') {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserPermissions(res.data.permissions);
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
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
    setEditForm({
      name: {
        fr: category.name?.fr || '',
        en: category.name?.en || '',
      },
      criteria: JSON.stringify(category.criteria || {}, null, 2),
      parent: category.parentCategory?._id || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fr' || name === 'en') {
      setEditForm((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          [name]: value,
        },
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/categories/${id}`, {
        name: editForm.name,
        criteria: JSON.parse(editForm.criteria || '{}'),
        parentCategory: editForm.parent || null,
      });
      setEditCategoryId(null);
      fetchCategories();
    } catch (error) {
      alert('Error updating category. Make sure criteria is valid JSON.');
      console.error(error);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  const hasCategoryAccess = user?.role === 'admin' || userPermissions?.categories === true;

  // Deny access to categories if the user doesn't have permission
  if (!user || loading) return <div className="home-container">Loading user data...</div>;

  return (
    <div className="categories-page">
      <div
        className="home-container"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/categories.png)`,
          backgroundSize: 'contain',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'top center',
          backgroundAttachment: 'scroll',
          minHeight: '200vh',
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
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
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
              {hasCategoryAccess && (
                <>
                  <li><button className="sidebar-item" onClick={() => setActiveView('addHorse')}>Add a category for horses</button></li>
                  <li><button className="sidebar-item" onClick={() => setActiveView('addNote')}>Add a category for notes</button></li>
                  <li><button className="sidebar-item" onClick={() => setActiveView('assignHorse')}>Assign Horse to Category</button></li>
                  <li><button className="sidebar-item" onClick={() => setActiveView('assignNote')}>Assign Note to Category</button></li>
                </>
              )}
              <li><button className="sidebar-item" onClick={() => setActiveView('list')}>View all categories</button></li>
            </ul>
          </div>

          <div className="content">
            {!hasCategoryAccess ? (
              <div className="no-access">
                <h2>You do not have permission to access categories.</h2>
              </div>
            ) : (
              <Suspense fallback={<div>Loading...</div>}>
                {activeView === 'addHorse' && <AddHorseCategory />}
                {activeView === 'addNote' && <AddNoteCategory />}
                {activeView === 'assignHorse' && <AssignHorseToCategory />}
                {activeView === 'assignNote' && <AssignNoteToCategory />}
                {activeView === 'list' && (
                  <>
                    {['horse', 'note'].map((type) => (
                      <div key={type} className={`category-table-wrapper ${type}`}>
                        <h2>{type === 'horse' ? '🐎 Horse Categories' : '📝 Note Categories'}</h2>
                        {categories.filter(cat => cat.type === type).length === 0 ? (
                          <p>No {type} categories found.</p>
                        ) : (
                          <table className="category-table">
                            <thead>
                              <tr>
                                <th>Parent</th>
                                <th>Name (FR / EN)</th>
                                <th>Criteria</th>
                                {type === 'horse' && <th>Horses</th>}
                                {type === 'note' && <th>Notes</th>}
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categories.filter(cat => cat.type === type).map((cat) => {
                                const parentName = cat.parentCategory?.name?.fr || '—';
                                const isEditing = editCategoryId === cat._id;
                                return (
                                  <tr key={cat._id}>
                                    <td>{parentName}</td>
                                    <td>
                                      {isEditing ? (
                                        <>
                                          <input
                                            name="fr"
                                            value={editForm.name.fr}
                                            onChange={handleEditChange}
                                            placeholder="FR"
                                          />
                                          <input
                                            name="en"
                                            value={editForm.name.en}
                                            onChange={handleEditChange}
                                            placeholder="EN"
                                          />
                                        </>
                                      ) : (
                                        <>
                                          <div><strong>FR:</strong> {cat.name?.fr}</div>
                                          <div><strong>EN:</strong> {cat.name?.en}</div>
                                        </>
                                      )}
                                    </td>
                                    <td>
                                      {isEditing ? (
                                        <textarea
                                          name="criteria"
                                          value={editForm.criteria}
                                          onChange={handleEditChange}
                                          rows={3}
                                        />
                                      ) : (
                                        Object.entries(cat.criteria || {}).map(([k, v]) => (
                                          <div key={k}><strong>{k}:</strong> {String(v)}</div>
                                        ))
                                      )}
                                    </td>
                                    {type === 'horse' && (
                                      <td>
                                        {cat.horses && cat.horses.length > 0 ? (
                                          cat.horses.map(horseId => (
                                            <div key={horseId}>
                                              {horseNames[horseId] || 'Unknown Horse'}
                                            </div>
                                          ))
                                        ) : (
                                          '—'
                                        )}
                                      </td>
                                    )}
                                    {type === 'note' && (
                                      <td>
                                        {cat.notes && cat.notes.length > 0 ? (
                                          cat.notes.map(noteId => (
                                            <div key={noteId}>{noteNames[noteId] || 'Unknown Note'}</div>
                                          ))
                                        ) : (
                                          '—'
                                        )}
                                      </td>
                                    )}
                                    <td>
                                      {isEditing ? (
                                        <>
                                          <select
                                            name="parent"
                                            value={editForm.parent}
                                            onChange={handleEditChange}
                                          >
                                            <option value="">None</option>
                                            {categories
                                              .filter(c => c._id !== cat._id)
                                              .map((c) => (
                                                <option key={c._id} value={c._id}>{c.name?.fr}</option>
                                              ))}
                                          </select>
                                          <button className="btn-edit" onClick={() => handleEditSubmit(cat._id)}>💾 Save</button>
                                        </>
                                      ) : (
                                        <button className="btn-edit" onClick={() => handleEditClick(cat)}>✏️ Modify</button>
                                      )}
                                      {hasCategoryAccess && (
                                        <button className="btn-delete" onClick={() => handleDelete(cat._id)}>🗑️ Delete</button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </Suspense>
            )}
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>Are you sure you want to log out?</h3>
            <div className="modal-buttons">
              <button className="confirm" onClick={confirmLogout}>Yes</button>
              <button className="cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
