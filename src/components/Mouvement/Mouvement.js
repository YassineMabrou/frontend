import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Mouvement.css';

import TransportHistory from './TransportHistory';
const Transport = lazy(() => import('./Transport'));

const Mouvements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('history');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
      {/* Navbar with links visible for all users */}
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

      <div className="page-container">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
        </button>

        <div className={sidebarOpen ? 'sidebar open' : 'sidebar closed'}>
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-menu">
            <li>
              <button className="sidebar-item" onClick={() => setActiveView('transport')}>
                Transporting a horse
              </button>
            </li>
            <li>
              <button className="sidebar-item" onClick={() => setActiveView('history')}>
                Movement History
              </button>
            </li>
          </ul>
        </div>

        <div className="content">
          {/* Lazy-loaded content for transport view */}
          <Suspense fallback={<div>Loading...</div>}>
            {activeView === 'transport' && <Transport />}
          </Suspense>

          {/* Display history view */}
          {activeView === 'history' && (
            <>
              <div className="history-header">
                <h2>📜 Movement History</h2>
                <a
                  href="http://localhost:7002/api/transports/report?export=csv"
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
