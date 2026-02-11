import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Toast, ToastContainer } from "react-bootstrap";
import { Link } from "react-router";
import api from "../../config/axios";

const Login = ({ setIsAuth }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [toast, setShowToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setShowToast({
        show: true,
        message: "Please fill in all fields",
        type: "danger",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", formData);
      console.log("Login response:", response.data);

      // Store auth token if backend returns one
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      if (setIsAuth) setIsAuth(true);
      localStorage.setItem("isAuth", "true");

      setShowToast({
        show: true,
        message: "Login successful!",
        type: "success",
      });

      // Navigate after toast shows
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed";

      setShowToast({
        show: true,
        message: errorMessage,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={5} sm={8} xs={12}>
            <Card className="shadow-lg border-0 login-card">
              <Card.Body className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">
                    Inventory Clinic
                  </h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control-lg"
                    />
                    <Form.Text className="text-muted">
                      We'll never share your email.
                    </Form.Text>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-2">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control-lg"
                    />
                  </Form.Group>

                  {/* Forgot Password Link */}
                  <div className="text-end mb-4">
                    <a
                      href="#forgot-password"
                      className="text-primary text-decoration-none small"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 fw-semibold mb-3"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </Form>

                {/* Divider */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1" />
                  <span className="mx-2 text-muted small">OR</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Sign Up Link */}
                <p className="text-center text-muted">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary text-decoration-none fw-semibold"
                  >
                    Sign Up
                  </Link>
                </p>
              </Card.Body>
            </Card>
            {/* Footer */}
            <div className="text-center mt-4 text-muted small">
              <p>© 2026 Inventory Clinic. All rights reserved.</p>
            </div>
          </Col>
        </Row>
        <ToastContainer position="top-end" className="p-3">
          <Toast
            bg={toast.type}
            show={toast.show}
            onClose={() => setShowToast({ ...toast, show: false })}
            delay={2000}
            autohide
          >
            <Toast.Header closeButton>
              <strong className="me-auto">
                {toast.type === "success" ? "Success" : "Error"}
              </strong>
            </Toast.Header>

            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  );
};

export default Login;
