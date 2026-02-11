import React, { useState, useEffect, useRef } from "react";
import { Button, Dropdown } from "react-bootstrap";
import {
  List,
  KeyFill,
  BoxArrowRight,
  PersonLinesFill,
  PersonCircle,
} from "react-bootstrap-icons";
import { Toast, ToastContainer } from "react-bootstrap";
import Sidebar from "./Sidebar.jsx";
import ChangePasswordModal from "../ChangePasswordModal.jsx";
import "./AdminLayout.css";
import api from "../../config/axios.js";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "../../assets/style/global.css";

/**
 * AdminLayout is a higher-order component that wraps the main content
 * of the application with a sidebar and a top navigation bar.
 * It provides a simple way to manage the layout of the application.
 * The component accepts a single prop, "children", which is the main content
 * of the application.
 *
 * @param { React.ReactNode } children - The main content of the application.
 * @param { Function } setIsAuth - Callback to update auth state in App.jsx
 * @returns { React.ReactElement } A React element representing the layout of the application.
 */

const AdminLayout = ({ children, setIsAuth }) => {
  const [sidebarShow, setSidebarShow] = useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const [displayData, setDisplayData] = useState(null);
  const { user, logout } = useAuth();

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };
  useEffect(() => {
    if (user) {
      if (hasFetched.current) return;
      hasFetched.current = true;
      fetchUserData();
    }
  }, [user]);
  const fetchUserData = async () => {
    if (!user) return; // Ensure user data is available before making the API call

    try {
      const response = await api.get("/my-profile");
      console.log("User data fetched:", response.data);

      if (response.data && response.data.isSuccess) {
        const userData = response.data.user;
        setDisplayData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          profile_picture: userData.profile_picture,
          email: userData.email,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleChangePasswordUpdate = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/change-password",
        {
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.new_password_confirmation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to change password",
      );
    }
  };
  const handleLogout = async () => {
    setLoading(true);
    setShowToast(true);

    try {
      await api.post("/logout");
    } catch (error) {
      // 401 is OK here — user is already considered logged out
      if (error.response?.status !== 401) {
        console.error("Logout error:", error);
      }
    } finally {
      setTimeout(() => {
        // Clear all auth data
        logout();
        localStorage.removeItem("isAuth");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Update App.jsx state
        if (setIsAuth) setIsAuth(false);

        setLoading(false);

        // Force redirect to login page
        navigate("/snl-hr-app", { replace: true });
      }, 1500);
    }
  };

  const getUserInitials = (userInitials) => {
    if (!user) return "";

    if (user.profile_picture) return ""; // Don't show initials if profile picture exists

    const first = userInitials.first_name?.charAt(0) || "";
    const last = userInitials.last_name?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar show={sidebarShow} handleClose={() => setSidebarShow(false)} />

      {/* Main Content */}
      <div className="admin-content">
        {/* Top Navigation Bar */}
        <nav className="admin-navbar">
          <div className="navbar-content">
            <Button
              variant="link"
              className="navbar-toggle"
              onClick={() => setSidebarShow(true)}
            >
              <List size={24} />
            </Button>
            <h5 className="navbar-title">Employee Dashboard</h5>
            <div className="navbar-profile">
              <div className="profile-info">
                <p className="profile-name text-end d-none d-md-block">
                  {displayData?.first_name && displayData?.last_name
                    ? `${displayData.first_name} ${displayData.last_name}`
                    : "Loading..."}
                </p>
                <small className="text-muted d-none d-md-block">{displayData?.email || "Loading..."}</small>
              </div>
              <Dropdown className="profile-dropdown" align="end">
                <Dropdown.Toggle
                  variant="link"
                  id="profile-dropdown"
                  className="profile-avatar-toggle"
                >
                  <div className="profile-avatar">
                    {displayData?.profile_picture ? (
                      <img 
                        src={displayData.profile_picture}
                        alt="Profile"
                        className="profile-avatar"
                      />
                    ) : (
                      <span className="profile-initials">{getUserInitials(user)}</span>
                    )}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="profile-dropdown-menu">
                  <Dropdown.Item
                    as={Link}
                    to="/snl-hr-app/profile"
                    className={`dropdown-item-custom ${isActive("/snl-hr-app/profile") ? "active" : ""}`}
                  >
                    <PersonLinesFill size={16} />
                    <span>Profile</span>
                  </Dropdown.Item>
                  <Dropdown.Item
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleChangePassword();
                    }}
                    className="dropdown-item-custom"
                  >
                    <KeyFill size={16} />
                    <span>Change Password</span>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    disabled={loading}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    className="dropdown-item-custom dropdown-item-logout"
                  >
                    <BoxArrowRight size={16} />
                    <span>{loading ? "Logging out..." : "Logout"}</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="admin-main">{children}</div>
      </div>
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onUpdate={handleChangePasswordUpdate}
        />
      )}

      <ToastContainer position="top-end" className="p-3">
        <Toast
          className="glb-toast-success"
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
        >
          <Toast.Body>You are now logged out!</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AdminLayout;
