import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import './Sidebaar.css';
import './Actions.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const AddAct = lazy(() => import('./AddAct'));
const ActScheduler = lazy(() => import('./CalendarActScheduler'));
const ActHistory = lazy(() => import('./ActHistory'));
const Analysis = lazy(() => import('./Analysis'));

const Actions = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [acts, setActs] = useState([]);
  const [activeView, setActiveView] = useState('calendar');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // ✅ Added state

  const handleLogout = () => {
    setShowLogoutConfirm(true); // ✅ Show modal
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      axios
        .get(`${process.env.REACT_APP_BACKEND_API}/users/${user.id}`)
        .then((response) => setPermissions(response.data.permissions))
        .catch((error) => console.error('Error fetching user permissions:', error));
    } else {
      setPermissions({ manage_action: true });
    }
  }, [user]);

  const fetchActs = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/acts`);
      setActs(response.data);
    } catch (error) {
      console.error('Error fetching acts:', error);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'calendar') {
      fetchActs();
    }
  }, [fetchActs, activeView]);

  const hasManageActionPermission = permissions?.manage_action;

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/actions.png)`,
        backgroundRepeat: "repeat-y",
        backgroundSize: "contain",
        backgroundPosition: "top center",
        backgroundAttachment: "scroll",
        minHeight: "200vh",
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
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>

      {hasManageActionPermission && (
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
        </button>
      )}

      {hasManageActionPermission && (
        <div className={sidebarOpen ? 'sidebar open' : 'sidebar closed'}>
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-menu">
            <li><button className="sidebar-item" onClick={() => setActiveView('add')}>Add horse to an act</button></li>
            <li><button className="sidebar-item" onClick={() => setActiveView('Analysis')}>Health Analyses</button></li>
            {user && user.role === "admin" && (
              <>
                <li><button className="sidebar-item" onClick={() => setActiveView('ActHistory')}>Acts History</button></li>
                <li><button className="sidebar-item" onClick={() => setActiveView('calendar')}>Calendar</button></li>
              </>
            )}
          </ul>
        </div>
      )}

      <div className="content">
        {hasManageActionPermission && activeView === 'calendar' && (
          <div className="procedure-calendar">
            <ActScheduler
              acts={acts}
              onDateClick={(dateStr) => alert(`Create procedure on ${dateStr}`)}
              onEventClick={(event) => alert(`Procedure: ${event.title}\nCreated By: ${event.extendedProps?.createdBy || 'N/A'}`)}
            />
          </div>
        )}

        <Suspense fallback={<div>Loading...</div>}>
          {activeView === 'Analysis' && <Analysis />}
          {activeView === 'add' && <AddAct />}
          {activeView === 'ActHistory' && <ActHistory />}
        </Suspense>
      </div>

      {/* ✅ Logout Confirmation Modal */}
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

export default Actions;
