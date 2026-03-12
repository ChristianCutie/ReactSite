import React, { useState } from "react";
import "./ChangePasswordModal.css";
import { Toast, ToastContainer } from "react-bootstrap";
import { Eye, EyeSlash, Lock } from "react-bootstrap-icons";
import api from "../config/axios";
import "../assets/style/global.css";


const ChangePasswordModal = ({ onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    new_password_confirmation: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setShowToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (!passwordRegex.test(formData.new_password)) {
      newErrors.new_password =
        "Password must be at least 8 characters, contain uppercase, lowercase, number, and special character";
    } else if (formData.new_password === formData.current_password) {
      newErrors.new_password =
        "New password must be different from current password";
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Please confirm your new password";
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate(formData);
      setShowToast({
        show: true,
        message: "Password changed successfully!",
        type: "success",
      });
      // Reset form after successful submission
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setShowToast({
        show: true,
        message: error.message || "Error changing password. Please try again.",
        type: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cpm-modal-overlay" onClick={onClose}>
      <div className="cpm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cpm-modal-header">
          <h2>
            <Lock size={24} className="me-2" style={{ display: "inline" }} />
            Change Password
          </h2>
          <button className="cpm-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cpm-modal-form">
          <div className="cpm-form-fields">
            <div className="cpm-form-group">
              <label htmlFor="current_password">Current Password</label>
              <div className="cpm-password-input-wrapper">
                <input
                  type={showPasswords.current_password ? "text" : "password"}
                  id="current_password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className={errors.current_password ? "cpm-input-error" : ""}
                />
                <button
                  type="button"
                  className="cpm-password-toggle"
                  onClick={() => togglePasswordVisibility("current_password")}
                  title={
                    showPasswords.current_password
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPasswords.current_password ? (
                    <EyeSlash size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <span className="cpm-error-message">{errors.current_password}</span>
              )}
            </div>

            <div className="cpm-form-group">
              <label htmlFor="new_password">New Password</label>
              <div className="cpm-password-input-wrapper">
                <input
                  type={showPasswords.new_password ? "text" : "password"}
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  className={errors.new_password ? "cpm-input-error" : ""}
                />
                <button
                  type="button"
                  className="cpm-password-toggle"
                  onClick={() => togglePasswordVisibility("new_password")}
                  title={
                    showPasswords.new_password
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPasswords.new_password ? (
                    <EyeSlash size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <span className="cpm-error-message">{errors.new_password}</span>
              )}
              <div className="cpm-password-requirements">
                <p className="cpm-requirements-title">Password Requirements:</p>
                <ul>
                  <li
                    className={
                      formData.new_password.length >= 8 ? "valid" : ""
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(formData.new_password) ? "valid" : ""
                    }
                  >
                    One uppercase letter
                  </li>
                  <li
                    className={
                      /[a-z]/.test(formData.new_password) ? "valid" : ""
                    }
                  >
                    One lowercase letter
                  </li>
                  <li
                    className={/\d/.test(formData.new_password) ? "valid" : ""}
                  >
                    One number
                  </li>
                  <li
                    className={
                      /[@$!%*?&]/.test(formData.new_password) ? "valid" : ""
                    }
                  >
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            <div className="cpm-form-group">
              <label htmlFor="new_password_confirmation">Confirm New Password</label>
              <div className="cpm-password-input-wrapper">
                <input
                  type={showPasswords.new_password_confirmation ? "text" : "password"}
                  id="new_password_confirmation"
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className={errors.new_password_confirmation ? "cpm-input-error" : ""}
                />
                <button
                  type="button"
                  className="cpm-password-toggle"
                  onClick={() => togglePasswordVisibility("new_password_confirmation")}
                  title={
                    showPasswords.new_password_confirmation
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPasswords.confirm_password ? (
                    <EyeSlash size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.new_password_confirmation && (
                <span className="cpm-error-message">{errors.new_password_confirmation}</span>
              )}
            </div>
          </div>

          <div className="cpm-modal-footer">
            <button
              type="button"
              className="cpm-btn cpm-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cpm-btn cpm-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>

        {/* Toast Notification */}
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{ position: "fixed", zIndex: 9999 }}
        >
          <Toast
          className={toast.type === "success" ? "glb-toast-success" : "glb-toast-danger"}
            show={toast.show}
            onClose={() => setShowToast({ ...toast, show: false })}
            delay={3000}
            autohide
          >
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
