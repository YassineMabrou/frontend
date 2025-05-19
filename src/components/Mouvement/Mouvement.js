import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import './Mouvement.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

import TransportHistory from './TransportHistory';
const Transport = lazy(() => import('./Transport'));

const Mouvements = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('history');
  const [userPermissions, setUserPermissions] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    if (user) {
      fetchUserPermissions(user.id);
    }
  }, [user]);

  const fetchUserPermissions = async (userId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_API}/users/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setUserPermissions(data.permissions);
      } else {
        console.error('Failed to fetch user permissions');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return <div className="home-container">Loading user data...</div>;
  }

  if (user.role !== 'admin' && (!userPermissions || !userPermissions.manage_location)) {
    return (
      <div
        className="home-container"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/movements.png)`,
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
            <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Log out</button></li>
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
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/movements.png)`,
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
          <li><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Log out</button></li>
        </ul>
      </nav>

      <div className="page-container">
        {(user.role === 'admin' || (userPermissions && userPermissions.manage_location)) && (
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
          </button>
        )}

        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-menu">
            <li><button onClick={() => setActiveView('transport')} className="sidebar-item">Transporting a Horse</button></li>
            <li><button onClick={() => setActiveView('history')} className="sidebar-item">Movement History</button></li>
          </ul>
        </div>

        <div className="content">
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

export default Mouvements;
