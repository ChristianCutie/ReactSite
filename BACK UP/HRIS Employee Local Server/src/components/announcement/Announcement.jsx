import React, { useState, useEffect, useRef } from "react";
import { Dropdown, Offcanvas } from "react-bootstrap";
import { Megaphone } from "react-bootstrap-icons";
import "@/components/layout/Adminlayout.css";
import api from "@/config/axios";
import { useAuth } from "@/context/AuthContext.jsx";
const Announcement = () => {
  const [notifications, setNotifications] = useState([]);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const { user } = useAuth();

  const hasFetched = useRef(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/dashboard/employees");
      const data = response.data?.announcements || [];
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    if(user){
 if (hasFetched.current) return;
      hasFetched.current = true;
    fetchNotifications();
    }
   
  }, [user]);
  return (
    <>
      <Dropdown className="notification-dropdown" align="end">
        <Dropdown.Toggle
          variant="link"
          id="notification-dropdown"
          className="notification-btn"
        >
          <Megaphone size={16} color="black" />
          {notifications?.length > 0 && (
            <span className="notification-count">{notifications.length}</span>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="notification-dropdown-menu">
          <div className="notification-header">
            <h6 className="mb-0">Announcement</h6>
          </div>
          {notifications.length === 0 ? (
            <div className="empty-notification">
              <p className="text-muted mb-0">No new announcement</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <Dropdown.Item
                key={notification.id || index}
                href="#"
                onClick={() => {
                  setSelectedAnnouncement(notification);
                  setShowAnnouncement(true);
                }}
              >
                <div className="announcement-card">
                  <div className="d-flex align-items-center justify-content-between">
                    <strong>
                      <h6>{notification.title}</h6>
                    </strong>
                    <p className="text-end fst-italic mb-1 small">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                  <p className="text-muted mb-1">
                    {notification.content.substring(0, 80)}...
                  </p>
                </div>
              </Dropdown.Item>
            ))
          )}
          {notifications?.length > 0 && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item
                href="#"
                onClick={(e) => e.preventDefault()}
                className="notification-footer text-center"
              >
                <small>View All Notifications</small>
              </Dropdown.Item>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>

      <Offcanvas
        show={showAnnouncement}
        onHide={() => setShowAnnouncement(false)}
        placement="end"
        backdrop={true}
        scroll={true}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Announcement Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="announcement-details">
          {selectedAnnouncement && (
            <>
              <h5 className="announcement-title">
                {selectedAnnouncement.title}
              </h5>
              <p className="text-muted announcement-date">
                Posted on:{" "}
                {new Date(selectedAnnouncement.created_at).toLocaleDateString()}
              </p>
              <hr />
              <p className="announcement-content">
                {selectedAnnouncement.content}
              </p>
              {/* Add any other fields like author if available */}
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Announcement;
