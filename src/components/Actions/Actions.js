import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext"; // ✅ Access user and logout function
import './Sidebaar.css';
import './Actions.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Lazy-loaded components
const AddAct = lazy(() => import('./AddAct'));
const ActScheduler = lazy(() => import('./CalendarActScheduler'));
const ActHistory = lazy(() => import('./ActHistory'));
const Analysis = lazy(() => import('./Analysis'));

const Actions = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Or redirect to "/login"
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [horses, setHorses] = useState([]);
  const [acts, setActs] = useState([]);
  const [selectedHorse, setSelectedHorse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedView, setSelectedView] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeView, setActiveView] = useState('calendar');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchHorses = async () => {
      try {
        const response = await axios.get(`${process.env.BACKEND_API}/horses`);
        setHorses(response.data);
      } catch (error) {
        console.error('Error fetching horses:', error);
      }
    };
    fetchHorses();
  }, []);

  const fetchFilteredActs = useCallback(async () => {
    try {
      const params = {};
      if (selectedType) params.type = selectedType;
      if (selectedHorse) params.horse = selectedHorse;
      if (selectedView) {
        params.view = selectedView;
        params.startDate = startDate || new Date().toISOString().split('T')[0];
      }

      if (!selectedView && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get(`${process.env.BACKEND_API}/acts/filter`, { params });
      setActs(response.data);
    } catch (error) {
      console.error('Error fetching acts:', error);
    }
  }, [selectedType, selectedHorse, startDate, endDate, selectedView]);

  useEffect(() => {
    if (activeView === 'calendar') {
      fetchFilteredActs();
    }
  }, [fetchFilteredActs, activeView]);

  return (
    <div className="home-container"
      style={{
        backgroundImage: 'url("/actions.png")',
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
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
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

        <div className="content">
          {/* Display calendar above other content */}
          {activeView === 'calendar' && (
            <div className="procedure-calendar">
              <ActScheduler
                acts={acts}
                view={selectedView}
                onDateClick={(dateStr) => alert(`Create procedure on ${dateStr}`)}
                onEventClick={(event) => alert(`Procedure: ${event.title}\nCreated By: ${event.extendedProps?.createdBy || 'N/A'}`)}
              />
            </div>
          )}

          {/* Horse selection for specific views */}
          {(activeView === 'calendar' || activeView === 'ActHistory') && (
            <div className="select-horse mb-4">
              <h3>Select Horse</h3>
              <select value={selectedHorse} onChange={(e) => setSelectedHorse(e.target.value)}>
                <option value="">Select Horse</option>
                {horses.map((horse) => (
                  <option key={horse._id} value={horse._id}>{horse.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* View filters for calendar */}
          {activeView === 'calendar' && (
            <div className="filters">
              <div className="select-type">
                <h3>Procedure Type</h3>
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="">Select Type</option>
                  <option value="Medical Checkup">Medical Checkup</option>
                  <option value="Training">Training</option>
                </select>
              </div>

              <div className="select-view">
                <h3>View</h3>
                <select value={selectedView} onChange={(e) => setSelectedView(e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div className="date-range">
                <h3>Date Range</h3>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          )}

          {/* Lazy-loaded views */}
          <Suspense fallback={<div>Loading...</div>}>
            {activeView === 'Analysis' && <Analysis />}
            {activeView === 'add' && <AddAct />}
            {activeView === 'ActHistory' && (
              selectedHorse ? (
                <ActHistory horseId={selectedHorse} />
              ) : (
                <p className="text-red-600 p-4 font-medium">Please select a horse to view its act history.</p>
              )
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Actions;
