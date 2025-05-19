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
  const [view, setView] = useState('default');
  const [manageContactPermission, setManageContactPermission] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id);
    }
  }, [user]);

  const fetchUserData = async (userId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/users/${userId}`);
      const userData = res.data;

      const isAdmin = userData?.role === 'admin';
      const hasPermission = userData?.permissions?.manage_contact;

      if (isAdmin || hasPermission) {
        setManageContactPermission(true);
        fetchContacts();
      }

      setLoadingUser(false);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setLoadingUser(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_API}/contacts`);
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
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
  };

  const updateContact = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_API}/contacts/${editingContact._id}`, formData);
      setEditingContact(null);
      setFormData({ name: '', role: '', email: '', phone: '', availability: '' });
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
    }
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

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
            </form>

            <table className="contact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? contacts.map(contact => (
                  <tr key={contact._id}>
                    {editingContact?._id === contact._id ? (
                      <>
                        <td><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></td>
                        <td><input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} /></td>
                        <td><input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></td>
                        <td><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></td>
                        <td><input value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} /></td>
                        <td>
                          <button onClick={updateContact} style={{ marginRight: '0.5rem' }}>💾</button>
                          <button onClick={() => setEditingContact(null)}>❌</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{contact.name}</td>
                        <td>{contact.role}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                        <td>{contact.availability}</td>
                        <td>
                          <button onClick={() => startEdit(contact)} style={{ marginRight: '0.5rem' }}>✏️</button>
                          <button onClick={() => deleteContact(contact._id)} style={{ color: 'red' }}>🗑️</button>
                        </td>
                      </>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No contacts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        );
    }
  };

  if (loadingUser) return <div className="home-container">Loading user data...</div>;

  if (!manageContactPermission) {
    return (
      <div className="home-container" style={{ backgroundImage: "url('/contact.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed", minHeight: "100vh", width: "100%" }}>
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
            <li><button onClick={() => setShowLogoutConfirm(true)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>Log out</button></li>
          </ul>
        </nav>
        <div className="access-denied-container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this content.</p>
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
  }

  return (
    <div className="home-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/contact.png)`, backgroundSize: 'contain', backgroundRepeat: 'repeat-y', backgroundPosition: 'top center', backgroundAttachment: 'scroll', minHeight: '200vh', width: '100%' }}>
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
          <li><button onClick={() => setShowLogoutConfirm(true)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>Log out</button></li>
        </ul>
      </nav>
      <div className="page-container">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

export default Contact;
