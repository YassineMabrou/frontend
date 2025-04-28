import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import './Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const AddContact = lazy(() => import('./AddContact'));
const AddIntervention = lazy(() => import('./AddIntervention'));
const InterventionHistory = lazy(() => import('./InterventionHistory'));

const Contact = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [view, setView] = useState('default');
  const [manageContactPermission, setManageContactPermission] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    availability: ''
  });

  const [searchParams, setSearchParams] = useState({
    name: '',
    role: '',
    availability: ''
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id);
    }
  }, [user]);

  const fetchUserData = async (userId) => {
    if (!userId) return;

    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users/${userId}`);
      const userData = res.data;

      if (userData?.permissions) {
        setUserInfo(userData);
        setManageContactPermission(userData.permissions.manage_contact);
      } else {
        console.error("Permissions not found in user data.");
        setError("User permissions not found.");
      }

      setLoadingUser(false);
      if (userData?.permissions?.manage_contact) {
        fetchContacts();
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError('Failed to fetch user information.');
      setLoadingUser(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts`);
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to fetch contacts.');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const query = new URLSearchParams(searchParams).toString();
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts/search?${query}`);
      setContacts(res.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search contacts.');
    }
  };

  const resetSearch = () => {
    setSearchParams({ name: '', role: '', availability: '' });
    fetchContacts();
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_API}/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact.');
    }
  };

  const startEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      role: contact.role,
      email: contact.email,
      phone: contact.phone,
      availability: contact.availability
    });
    setShowEditForm(true);
  };

  const updateContact = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/contacts/${editingContact._id}`, formData);
      setEditingContact(null);
      setShowEditForm(false);
      setFormData({ name: '', role: '', email: '', phone: '', availability: '' });
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loadingUser) {
    return <div className="home-container">Loading user data...</div>;
  }

  if (user.role !== "admin" && !manageContactPermission) {
    return (
      <div className="home-container" style={{ backgroundImage: "url('/contact.png')", backgroundSize: "cover", minHeight: "100vh" }}>
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
            <li><button onClick={handleLogout} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>Log out</button></li>
          </ul>
        </nav>

        <div className="access-denied-container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this content.</p>
        </div>
      </div>
    );
  }

  const renderMainView = () => {
    switch (view) {
      case 'add':
        return (
          <Suspense fallback={<p>Loading Add Contact Form...</p>}>
            <AddContact onContactAdded={() => { fetchContacts(); setView('default'); }} />
          </Suspense>
        );
      case 'intervention':
        return (
          <Suspense fallback={<p>Loading Add Intervention...</p>}>
            <AddIntervention />
          </Suspense>
        );
      case 'history':
        return (
          <Suspense fallback={<p>Loading Intervention History...</p>}>
            <InterventionHistory />
          </Suspense>
        );
      default:
        return (
          <>
            <form onSubmit={handleSearch} className="search-bar">
              <input type="text" placeholder="Search by name" value={searchParams.name} onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })} className="search-input" />
              <input type="text" placeholder="Search by role" value={searchParams.role} onChange={(e) => setSearchParams({ ...searchParams, role: e.target.value })} className="search-input" />
              <input type="text" placeholder="Search by availability" value={searchParams.availability} onChange={(e) => setSearchParams({ ...searchParams, availability: e.target.value })} className="search-input" />
              <button type="submit" className="btn-search">🔍 Search</button>
              <button type="button" className="btn-reset" onClick={resetSearch}>Reset</button>
            </form>

            {contacts.length > 0 && (
              <table className="contact-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Availability</th>
                    <th>Horses</th> {/* 🆕 Add Horses column */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(contact => (
                    <tr key={contact._id}>
                      <td>{contact.name}</td>
                      <td>{contact.role}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone}</td>
                      <td>{contact.availability}</td>
                      <td>
                        {contact.horses && contact.horses.length > 0
                          ? contact.horses.map(h => h?.name).join(', ')
                          : 'No Horses Assigned'}
                      </td>
                      <td>
                        <button onClick={() => startEdit(contact)} style={{ marginRight: '0.5rem' }}>✏️</button>
                        <button onClick={() => deleteContact(contact._id)} style={{ color: 'red' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        );
    }
  };

  return (
    <div className="home-container" style={{ backgroundImage: "url('/contact.png')", backgroundSize: "cover", minHeight: "100vh" }}>
      <nav className="navbar">
        {/* Navbar */}
        ...
      </nav>

      <div className="page-container">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
        </button>

        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-menu">
            <li><button className="sidebar-item" onClick={() => setView('intervention')}>Add Intervention</button></li>
            <li><button className="sidebar-item" onClick={() => setView('add')}>Add Contact</button></li>
            <li><button className="sidebar-item" onClick={() => setView('history')}>Intervention History</button></li>
          </ul>
        </div>

        <div className="content">
          <h1>📋 Contacts Management</h1>
          {renderMainView()}
        </div>
      </div>
    </div>
  );
};

export default Contact;
