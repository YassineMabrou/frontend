import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate for redirection
import './Sidebar.css';
import './Mouvement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext'; // Importing AuthContext to track user data

import TransportHistory from './TransportHistory';
const Transport = lazy(() => import('./Transport'));

const Mouvements = () => {
  const { user, logout } = useAuth(); // Accessing the logged-in user and role
  const navigate = useNavigate(); // Use navigate to redirect
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('history');
  const [userPermissions, setUserPermissions] = useState(null); // New state to store user permissions

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Fetch user permissions based on the user ID from AuthContext
  useEffect(() => {
    if (user) {
      fetchUserPermissions(user.id); // Fetch the user permissions when the component loads
    }
  }, [user]);

  const fetchUserPermissions = async (userId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_API}/users/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setUserPermissions(data.permissions); // Assuming 'permissions' is a field in the response
      } else {
        console.error('Failed to fetch user permissions');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  // Ensure there's a user (to avoid errors if user data isn't loaded yet)
  if (!user) {
    return <div className="home-container">Loading user data...</div>;
  }

  // Check if the user is an admin or has 'manage_location' permission
  if (user.role !== 'admin' && (!userPermissions || !userPermissions.manage_location)) {
    return (
      <div
        className="home-container"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/movements.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
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
            <li><Link to="/logout">Log out</Link></li>
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

  const handleLogout = () => {
    logout(); // Log the user out from the context
    navigate("/"); // Redirect to the home page or login page after logging out
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/movements.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Navbar for admin or manage_location permission */}
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
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>

      {/* Page Content */}
      <div className="page-container">
        {/* Show the sidebar if the user is an admin or has 'manage_location' permission */}
        {(user.role === 'admin' || (userPermissions && userPermissions.manage_location)) && (
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
          </button>
        )}

        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-menu">
            <li>
              <button className="sidebar-item" onClick={() => setActiveView('transport')}>
                Transporting a Horse
              </button>
            </li>
            <li>
              <button className="sidebar-item" onClick={() => setActiveView('history')}>
                Movement History
              </button>
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="content">
          {/* Show the 'Transport' component if 'admin' role or 'manage_location' permission */}
          {(user.role === 'admin' || (userPermissions && userPermissions.manage_location)) && activeView === 'transport' && (
            <Suspense fallback={<div>Loading...</div>}>
              <Transport />
            </Suspense>
          )}

          {(user.role === 'admin' || (userPermissions && userPermissions.manage_location)) && activeView === 'history' && (
            <>
              <div className="history-header">
                <h2>📜 Movement History</h2>
                <a
                  href={`${process.env.REACT_APP_BACKEND_API}/transports/report?export=csv`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="csv-download-button"
                >
                  📥 Download CSV
                </a>
              </div>
              <TransportHistory />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mouvements;
