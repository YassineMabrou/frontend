import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ Use navigate for redirection
import { useAuth } from '../../context/AuthContext'; // ✅ Correct path to AuthContext
import './Sidebar.css';
import './Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const AddContact = lazy(() => import('./AddContact'));
const AddIntervention = lazy(() => import('./AddIntervention'));
const InterventionHistory = lazy(() => import('./InterventionHistory'));

const Contact = () => {
  const { logout,  } = useAuth(); // ✅ Access the logout function from context
  const navigate = useNavigate(); // ✅ For redirecting after logout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [editingContact, setEditingContact] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [view, setView] = useState('default');
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
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:7002/api/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const query = new URLSearchParams(searchParams).toString();
      const res = await axios.get(`http://localhost:7002/api/contacts/search?${query}`);
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
      await axios.delete(`http://localhost:7002/api/contacts/${id}`);
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
    setShowEditForm(true);
  };

  const updateContact = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:7002/api/contacts/${editingContact._id}`, formData);
      setEditingContact(null);
      setShowEditForm(false);
      setFormData({ name: '', role: '', email: '', phone: '', availability: '' });
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
    }
  };

  const handleLogout = () => {
    logout(); // Clear user session from context
    navigate('/'); // Redirect to homepage (or login page)
  };

  const renderMainView = () => {
    switch (view) {
      case 'add':
        return (
          <Suspense fallback={<p>Loading Add Contact Form...</p>}>
            <AddContact onContactAdded={() => {
              fetchContacts();
              setView('default');
            }} />
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
              <input
                type="text"
                placeholder="Search by name"
                value={searchParams.name}
                onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
                className="search-input"
              />
              <input
                type="text"
                placeholder="Search by role"
                value={searchParams.role}
                onChange={(e) => setSearchParams({ ...searchParams, role: e.target.value })}
                className="search-input"
              />
              <input
                type="text"
                placeholder="Search by availability"
                value={searchParams.availability}
                onChange={(e) => setSearchParams({ ...searchParams, availability: e.target.value })}
                className="search-input"
              />
              <button type="submit" className="btn-search">🔍 Search</button>
              <button type="button" className="btn-reset" onClick={resetSearch}>Reset</button>
            </form>

            {contacts.length === 0 ? (
              <p>No contacts found.</p>
            ) : (
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
                  {contacts.map(contact => (
                    <tr key={contact._id}>
                      <td>{contact.name}</td>
                      <td>{contact.role}</td>
                      <td>{contact.email}</td>
                      <td>{contact.phone}</td>
                      <td>{contact.availability}</td>
                      <td>
                        <button onClick={() => startEdit(contact)} style={{ marginRight: '0.5rem' }}>✏️</button>
                        <button onClick={() => deleteContact(contact._id)} style={{ color: 'red' }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {editingContact && showEditForm && (
              <div style={{ marginTop: '2rem' }}>
                <h3>Edit Contact</h3>
                <form onSubmit={updateContact}>
                  <input type="text" placeholder="Name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /><br />
                  <input type="text" placeholder="Role" value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })} required /><br />
                  <input type="email" placeholder="Email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /><br />
                  <input type="text" placeholder="Phone" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /><br />
                  <input type="text" placeholder="Availability" value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })} required /><br />
                  <button type="submit">✅ Update</button>
                  <button type="button" onClick={() => {
                    setEditingContact(null);
                    setShowEditForm(false);
                  }}>Cancel</button>
                </form>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: "url('/contact.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100%",
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
            {/* Sidebar items visible only for user */}
            <li><button className="sidebar-item" onClick={() => setView('intervention')}>Add Intervention</button></li>
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
