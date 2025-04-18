import React, { useState, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom"; // ✅ Import useNavigate
import { useAuth } from "../../context/AuthContext"; // ✅ Import useAuth
import "./Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Horses.css";

import HorseList from "./horseList";

// Lazy-loaded components
const AddHorseForm = React.lazy(() => import("./addHorse"));
const ImportHorseCSV = React.lazy(() => import("./ImportHorseCSV"));
const AddNoteForm = React.lazy(() => import("./AddNoteForm"));
const PensionManagement = React.lazy(() => import("./PensionManagement")); // Lazy-loaded PensionManagement
const HorseActs = React.lazy(() => import("./HorseAct"));
const Categories = React.lazy(() => import("./Horsectg"));
const Qualifications = React.lazy(() => import("./Qualifications"));
const Transport = React.lazy(() => import("./Transport"));
const Location = React.lazy(() => import("./HorseLocation"));

const Horses = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // ✅ Access user and logout
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchParams, setSearchParams] = useState({
    name: "",
    coatColor: "",
    sireNumber: "",
    archived: "",
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleSidebarClick = (formType) => {
    setSelectedForm(formType);
    setSidebarOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // ✅ Handle logout with context + redirect
  const handleLogout = () => {
    logout();
    navigate("/"); // or use "/login" if preferred
  };

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/horse1.png)`, // ✅ Reference image from the public folder
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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
                cursor: "pointer",
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

        <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <h2 className="sidebar-title">Menu</h2>
          <ul className="sidebar-menu">
            {/* Sidebar items visible for all users */}
            <li><button onClick={() => handleSidebarClick("addNote")} className="sidebar-item">Add Note</button></li>
            <li><button onClick={() => handleSidebarClick("PensionManagement")} className="sidebar-item">Horse Pension</button></li> {/* Add Horse Pension option for all users */}

            {/* Admin-specific sidebar items */}
            {user && user.role === "admin" && (
              <>
                <li><button onClick={() => handleSidebarClick("addHorse")} className="sidebar-item">Add Horse</button></li>
                <li><button onClick={() => handleSidebarClick("importHorse")} className="sidebar-item">Import Horse</button></li>
                <li><button onClick={() => handleSidebarClick("HorseActs")} className="sidebar-item">Horse Actions</button></li>
                <li><button onClick={() => handleSidebarClick("Categories")} className="sidebar-item">Horse Categories</button></li>
                <li><button onClick={() => handleSidebarClick("Qualifications")} className="sidebar-item">Horse Qualifications</button></li>
                <li><button onClick={() => handleSidebarClick("Transport")} className="sidebar-item">Horse Movements</button></li>
                <li><button onClick={() => handleSidebarClick("Location")} className="sidebar-item">Horse Location</button></li>
              </>
            )}
          </ul>
        </div>

        {/* Lazy-loaded Content */}
        {selectedForm === "addHorse" && (
          <Suspense fallback={<div>Loading...</div>}>
            <AddHorseForm />
          </Suspense>
        )}
        {selectedForm === "importHorse" && (
          <Suspense fallback={<div>Loading...</div>}>
            <ImportHorseCSV />
          </Suspense>
        )}
        {selectedForm === "addNote" && (
          <Suspense fallback={<div>Loading...</div>}>
            <AddNoteForm />
          </Suspense>
        )}
        {selectedForm === "PensionManagement" && (
          <Suspense fallback={<div>Loading...</div>}>
            <PensionManagement />
          </Suspense>
        )}
        {selectedForm === "HorseActs" && (
          <Suspense fallback={<div>Loading...</div>}>
            <HorseActs />
          </Suspense>
        )}
        {selectedForm === "Categories" && (
          <Suspense fallback={<div>Loading...</div>}>
            <Categories />
          </Suspense>
        )}
        {selectedForm === "Qualifications" && (
          <Suspense fallback={<div>Loading...</div>}>
            <Qualifications />
          </Suspense>
        )}
        {selectedForm === "Transport" && (
          <Suspense fallback={<div>Loading...</div>}>
            <Transport />
          </Suspense>
        )}
        {selectedForm === "Location" && (
          <Suspense fallback={<div>Loading...</div>}>
            <Location />
          </Suspense>
        )}

        {selectedForm === null && (
          <div className="horse-page-wrapper">
            <HorseList searchParams={searchParams} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Horses;
