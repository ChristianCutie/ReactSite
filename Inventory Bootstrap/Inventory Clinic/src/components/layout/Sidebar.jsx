import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Toast, ToastContainer } from "react-bootstrap";
import "./Sidebar.css";
import api from "../../config/axios";
import {
  House,
  Cart3,
  People,
  Gear,
  BoxArrowRight,
  List,
  X,
} from "react-bootstrap-icons";

const Sidebar = ({ setIsAuth, onLogout }) => {

  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const location = useLocation();

  const menuItems = [
    {
      id: 1,
      title: "Dashboard",
      icon: House,
      path: "/admin/dashboard",
    },
    {
      id: 2,
      title: "Inventory",
      icon: Cart3,
      path: "/admin/inventory",
    },
    {
      id: 3,
      title: "Users",
      icon: People,
      path: "/admin/users",
    },
    {
      id: 4,
      title: "Face Recognition",
      icon: Gear,
      path: "/admin/face-recognition",
    },
  ];

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Toggle the sidebar open/closed state.
   *
   * @returns {undefined}
   */
  /*******  1acb2ef5-a260-427d-b2e9-275fa57fc507  *******/ const toggleSidebar =
    () => {
      setIsOpen(!isOpen);
    };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setShowToast(true);
    setLoading(true);
    setTimeout(() => {
      onLogout();
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuth");
      setIsAuth(false);
      setLoading(false);
    }, 3000);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="mobile-toggle d-lg-none">
        <button
          className="btn btn-primary"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          {isOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="logo-container">
            {/* <div className="logo-icon">IC</div> */}
            <img src="/src/components/assets/image/vite.svg" alt="Logo" />
            <div className="logo-text">
              <h3>Inventory</h3>
              <p>Clinic</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <Nav className="sidebar-nav flex-column">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Nav.Link
                key={item.id}
                as={Link}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              >
                <span className="nav-icon">
                  <Icon size={20} />
                </span>
                <span className="nav-text">{item.title}</span>
              </Nav.Link>
            );
          })}
        </Nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button
            className="btn btn-logout text-primary w-100"
            onClick={handleLogout}
            disabled={loading}
          >
            <BoxArrowRight size={18} />
            <span>{loading ? "Logging out..." : "Logout"}</span>
          </button>
          <div className="user-info mt-3 pt-3 border-top">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <p className="user-name">Admin user</p>
              <p className="user-email">admin@clinic.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={toggleSidebar}
        ></div>
      )}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="success"
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Logout</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            You are now logged out!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default Sidebar;
