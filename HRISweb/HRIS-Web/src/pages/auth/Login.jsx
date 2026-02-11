import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import api from "../../config/axios";
import { Toast, ToastContainer } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import "./../../assets/style/global.css";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

const Login = ({ setIsAuth }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* =======================
     TOAST FUNCTIONS
  ======================== */
  const showToast = (message, type = "success") => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type,
      show: true,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-hide after 2.5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => 
        prevToasts.map(toast => 
          toast.id === id ? { ...toast, show: false } : toast
        )
      );
      
      // Clean up after fade animation
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
      }, 300);
    }, 2500);
  };

  // Handle redirect after toast is shown
  useEffect(() => {
    if (pendingRedirect) {
      const timer = setTimeout(() => {
        navigate(pendingRedirect);
      }, 2800); // Navigate after toast has been visible

      return () => clearTimeout(timer);
    }
  }, [pendingRedirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Login attempt with:", formData);

    try {
      const response = await api.post("/login", formData);
      console.log("Login response:", response.data);

      // Store user data and token using AuthContext
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
      }

      if (setIsAuth) setIsAuth(true);
      localStorage.setItem("isAuth", "true");
      setLoading(false);
      showToast("Login successful! Redirecting to dashboard...", "success");
      
      setPendingRedirect("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";

      // Show error toast (no redirect)
      showToast(errorMessage, "danger");
      
      // Reset loading state for error case
      setLoading(false);
    }
  };

  return (
    <Container fluid className="login-container">
      <Row className="h-100 align-items-center justify-content-center">
        <Col md={5} className="login-card p-5">
          <div className="text-center mb-4">
            <h1 className="welcome-heading">Welcome Back</h1>
            <p className="login-subtitle">Login to your HRIS account</p>
          </div>

          <Form onSubmit={handleSubmit}>
            {/* Email Field */}
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={formData.login}
                name="login"
                onChange={handleChange}
                className="form-control-lg login-input"
                required
                disabled={loading}
              />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-3 position-relative">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                name="password"
                onChange={handleChange}
                className="form-control-lg login-input"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeFill className="text-secondary" /> : <EyeSlashFill className="text-secondary" />}
              </button>
            </Form.Group>

            {/* Warning Message */}
            <Alert variant="light" className="password-warning mb-4">
              <i className="bi bi-exclamation-circle-fill warning-icon"></i>
              <span className="ms-2">
                Make sure to enter your password exactly as set, including any
                spaces
              </span>
            </Alert>

            {/* Sign In Button */}
            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="w-100 signin-btn mb-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>
          {/* <p className="text-center platform-text">Platform: Web</p> */}
        </Col>
      </Row>

      {/* Toast Container - Fixed positioning */}
      <ToastContainer 
        position="top-end" 
        className="p-3 toast-notification-container"
        style={{ zIndex: 999999 }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            show={toast.show}
            onClose={() => {
              setToasts((prevToasts) => 
                prevToasts.map(t => 
                  t.id === toast.id ? { ...t, show: false } : t
                )
              );
            }}
            className={`custom-toast glb-toast-${toast.type}`}
            autohide={false}
          >
            <Toast.Body>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </Container>
  );
};

export default Login;
