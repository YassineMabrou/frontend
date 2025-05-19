import React, { useState, useEffect, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import "./Horses.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

import HorseList from "./horseList";

const AddHorseForm = React.lazy(() => import("./addHorse"));
const ImportHorseCSV = React.lazy(() => import("./ImportHorseCSV"));
const AddNoteForm = React.lazy(() => import("./AddNoteForm"));
const PensionManagement = React.lazy(() => import("./PensionManagement"));
const HorseActs = React.lazy(() => import("./HorseAct"));
const Categories = React.lazy(() => import("./Horsectg"));
const Qualifications = React.lazy(() => import("./Qualifications"));
const Transport = React.lazy(() => import("./Transport"));
const Location = React.lazy(() => import("./HorseLocation"));

const Horses = () => {
  const navigate = useNavigate();
  const { logout, user, setUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchParams, setSearchParams] = useState({
    name: "",
    coatColor: "",
    sireNumber: "",
    archived: "",
  });
  const [horseData, setHorseData] = useState([]);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // ✅ Added for logout modal

  useEffect(() => {
    if (user && !permissions) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_API}/users/${user.id}`, {
          headers: {
            "x-user-id": user.id,
            "x-user-role": user.role,
          },
        })
        .then((response) => {
          setPermissions(response.data.permissions);
        })
        .catch((error) => {
          console.error("Error fetching user permissions:", error.response?.data || error.message);
        });
    }
  }, [user, permissions]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSidebarClick = (formType) => {
    setSelectedForm(formType);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true); // ✅ Show modal instead of immediate logout
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!user) {
      console.log("No user logged in");
      return;
    }

    if (user.role === "admin" || permissions?.manage_horse) {
      fetchHorseData();
    } else {
      setIsUnauthorized(true);
    }
  };

  const fetchHorseData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/horses/search`, {
        params: searchParams,
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
        },
      });
      setHorseData(response.data);
    } catch (error) {
      console.error("Error fetching horses:", error.response?.data || error.message);
    }
  };

  const hasManageHorsePermission = user?.role === "admin" || permissions?.manage_horse;

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/horse1.png)`,
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

      <div className="page-container">
        {hasManageHorsePermission && (
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} size="lg" />
          </button>
        )}

        {hasManageHorsePermission && (
          <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <h2 className="sidebar-title">Menu</h2>
            <ul className="sidebar-menu">
              <li><button onClick={() => handleSidebarClick("addNote")} className="sidebar-item">Add Note</button></li>
              <li><button onClick={() => handleSidebarClick("PensionManagement")} className="sidebar-item">Horse Pension</button></li>
              <li><button onClick={() => handleSidebarClick("addHorse")} className="sidebar-item">Add Horse</button></li>
              <li><button onClick={() => handleSidebarClick("importHorse")} className="sidebar-item">Import Horse</button></li>
              <li><button onClick={() => handleSidebarClick("HorseActs")} className="sidebar-item">Horse Actions</button></li>
              <li><button onClick={() => handleSidebarClick("Categories")} className="sidebar-item">Horse Categories</button></li>
              <li><button onClick={() => handleSidebarClick("Qualifications")} className="sidebar-item">Horse Qualifications</button></li>
              <li><button onClick={() => handleSidebarClick("Transport")} className="sidebar-item">Horse Movements</button></li>
              <li><button onClick={() => handleSidebarClick("Location")} className="sidebar-item">Horse Location</button></li>
            </ul>
          </div>
        )}

        {hasManageHorsePermission ? (
          <div className="horse-content">
            {isUnauthorized && <div className="unauthorized-message">Unauthorized to access horses data</div>}

            {selectedForm === null && (
              <div className="horse-page-wrapper">
                <HorseList horses={horseData} />
              </div>
            )}

            {selectedForm === "addHorse" && (
              <Suspense fallback={<div>Loading Add Horse...</div>}>
                <AddHorseForm />
              </Suspense>
            )}
            {selectedForm === "importHorse" && (
              <Suspense fallback={<div>Loading Import Horse...</div>}>
                <ImportHorseCSV />
              </Suspense>
            )}
            {selectedForm === "addNote" && (
              <Suspense fallback={<div>Loading Add Note...</div>}>
                <AddNoteForm />
              </Suspense>
            )}
            {selectedForm === "PensionManagement" && (
              <Suspense fallback={<div>Loading Pension Management...</div>}>
                <PensionManagement />
              </Suspense>
            )}
            {selectedForm === "HorseActs" && (
              <Suspense fallback={<div>Loading Horse Actions...</div>}>
                <HorseActs />
              </Suspense>
            )}
            {selectedForm === "Categories" && (
              <Suspense fallback={<div>Loading Horse Categories...</div>}>
                <Categories />
              </Suspense>
            )}
            {selectedForm === "Qualifications" && (
              <Suspense fallback={<div>Loading Horse Qualifications...</div>}>
                <Qualifications />
              </Suspense>
            )}
            {selectedForm === "Transport" && (
              <Suspense fallback={<div>Loading Horse Transport...</div>}>
                <Transport />
              </Suspense>
            )}
            {selectedForm === "Location" && (
              <Suspense fallback={<div>Loading Horse Location...</div>}>
                <Location />
              </Suspense>
            )}
          </div>
        ) : (
          <div className="no-access-message">You do not have permission to access horses data.</div>
        )}
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

export default Horses;
