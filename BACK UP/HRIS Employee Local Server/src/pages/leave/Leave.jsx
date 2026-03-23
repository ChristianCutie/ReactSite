import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  Table,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/Adminlayout";
import { PlusCircle } from "react-bootstrap-icons";
import { useAuth } from "@/context/AuthContext";
import "@/pages/leave/Leave.css";
import api from "@/config/axios";
import "@/assets/style/global.css";

const Leave = ({ setIsAuth }) => {
  // Assuming you have an authentication context or method to check if the user is authenticated
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [showModal, setShowModal] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

    const hasFetched = useRef(false);

  // Form State
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [calculatedDays, setCalculatedDays] = useState(0);

  // Fetch user data and leaves on component mount
  useEffect(() => {
if (hasFetched.current) return;
      hasFetched.current = true;
    fetchLeaves();
    fetchLeaveTypes();
    fetchLeaveBalances();
  }, []);

  // Calculate days when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(days > 0 ? days : 0);
    }
  }, [formData.start_date, formData.end_date]);

  // Fetch user's leave requests
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get("/my-leaves");
      if (response.data.isSuccess) {
        setLeaves(response.data.leaves);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch leave requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave types
  const fetchLeaveTypes = async () => {
    try {
      const response = await api.get("/dropdown/leave-types");

      if (response.data.isSuccess) {
        setLeaveTypes(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch leave types:", err);
    }
  };
  // Fetch leave balances
  const fetchLeaveBalances = async () => {
    try {
      const response = await api.get("/my-leaves-balance");
      if (response.data.isSuccess) {
        setLeaveBalances(response.data.balances || response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch leave balances:", err);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit leave request
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date) {
      setError("Please fill in all required fields");
      return;
    }

    if (calculatedDays <= 0) {
      setError("End date must be after start date");
      return;
    }

    // Check leave balance
    const selectedBalance = leaveBalances.find(
      (balance) => balance.leave_type_id === parseInt(formData.leave_type_id),
    );

    if (selectedBalance && calculatedDays > selectedBalance.remaining_days) {
      setError(
        `Insufficient leave balance. You have ${selectedBalance.remaining_days} days remaining.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || null,
      };

      const response = await api.post("/request-leave", submitData);

      if (response.data.isSuccess) {
        setSuccess(response.data.message);
        setFormData({
          leave_type_id: "",
          start_date: "",
          end_date: "",
          reason: "",
        });
        setCalculatedDays(0);

        // Refresh data
        setTimeout(() => {
          fetchLeaves();
          fetchLeaveBalances();
          setShowModal(false);
        }, 1500);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to submit leave request");
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Get leave status badge
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge bg="success">Approved</Badge>;
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Get leave type name
  const getLeaveTypeName = (leaveTypeId) => {
    const leaveType = leaveTypes.find((lt) => lt.id === leaveTypeId);
    return leaveType ? leaveType.leave_name : "Unknown";
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuth) {
      if (setIsAuth) setIsAuth(false);
      navigate("/");
      return;
    }
  }, [isAuth, navigate]);

  if (!isAuth) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="loadingScreen">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading leave...</span>
          </div>
          <p>Loading leave information...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="glb-container">
        {/* Page Header */}
        <Row className="leave-header mb-4">
          <Col>
            <h1 className="leave-title">Leave Management</h1>
          </Col>
          <Col className="text-end"></Col>
        </Row>

        {/* Leave Balance Cards */}
        <Row className="leave-section mb-4">
          <Col md={12}>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
              <div>
                <h5 className="section-title text-dark">Leave Balance</h5>
                <p className="section-subtitle">
                  Your remaining leave days by type
                </p>
              </div>

              <div>
                <Button
                  className=" px-3"
                  size="sm"
                  onClick={() => setShowModal(true)}
                >
                  <PlusCircle size={18} className="me-2" />
                  Request Leave
                </Button>
              </div>
            </div>
          </Col>
          {leaveBalances.length > 0 ? (
            leaveBalances.map((balance) => (
              <Col md={6} lg={4} key={balance.id} className="mb-3">
                <Card className="leave-balance-card h-100">
                  <Card.Body>
                    <h6 className="leave-balance-type">
                      {leaveTypes.find((lt) => lt.id === balance.leave_type_id)
                        ?.leave_name || "Leave Type"}
                    </h6>
                    <div className="leave-balance-display">
                      <div className="balance-item">
                        <span className="balance-label">Remaining</span>
                        <span className="balance-value-primary text-dark">
                          {balance.remaining_days}
                        </span>
                        <span className="balance-unit">days</span>
                      </div>
                      <div className="balance-separator">•</div>
                      <div className="balance-item">
                        <span className="balance-label">Total</span>
                        <span className="balance-value-secondary text-dark">
                          {balance.used_days || 0}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col md={12}>
              <Alert variant="info">
                No leave balance information available
              </Alert>
            </Col>
          )}
        </Row>

        {/* Leave Requests Section */}
        <Row className="leave-section">
          <Col md={12}>
          <Card>
            <Card.Body className="p-4">
  <div className="section-header-inline">
              <div>
                <h5 className="section-title">Leave Requests</h5>
                <p className="section-subtitle">
                  View your leave request history
                </p>
              </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : leaves.length > 0 ? (
              <Card className="leave-table-card">
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table striped hover className="mb-0 leave-requests-table">
                      <thead className="leave-table-header">
                        <tr>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Days</th>
                          <th>Reason</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.map((leave) => (
                          <tr key={leave.id} className="leave-table-row">
                            <td className="leave-type">
                              <strong>
                                {getLeaveTypeName(leave.leave_type_id)}
                              </strong>
                            </td>
                            <td>{formatDate(leave.start_date)}</td>
                            <td>{formatDate(leave.end_date)}</td>
                            <td>
                              <Badge
                                bg="light"
                                text="dark"
                                className="px-2 py-1"
                              >
                                {leave.total_days}
                              </Badge>
                            </td>
                            <td className="leave-reason">
                              {leave.reason || (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{getStatusBadge(leave.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Alert variant="info">
                No leave requests found. Want to create one?
              </Alert>
            )}
            </Card.Body>
          </Card>
          </Col>
        </Row>

        {/* Request Leave Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-white">Request Leave</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmitLeave}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Leave Type *</Form.Label>
                <Form.Select
                  name="leave_type_id"
                  value={formData.leave_type_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map((leaveType) => (
                    <option key={leaveType.id} value={leaveType.id}>
                      {leaveType.leave_name} - ({leaveType.max_days} days
                      remaining)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Start Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleFormChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">End Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleFormChange}
                      min={
                        formData.start_date ||
                        new Date().toISOString().split("T")[0]
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {calculatedDays > 0 && (
                <Alert variant="info" className="mb-3">
                  <strong>Total Days:</strong> {calculatedDays} days
                  {leaveBalances.find(
                    (b) => b.leave_type_id === parseInt(formData.leave_type_id),
                  ) && (
                    <>
                      {" | "}
                      <strong>Remaining After:</strong>{" "}
                      {leaveBalances.find(
                        (b) =>
                          b.leave_type_id === parseInt(formData.leave_type_id),
                      )?.remaining_days - calculatedDays}{" "}
                      days
                    </>
                  )}
                </Alert>
              )}

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Reason (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  placeholder="Enter reason for your leave request..."
                  maxLength={500}
                />
                <small className="text-muted">
                  {formData.reason.length}/500 characters
                </small>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer size="sm">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSubmitLeave}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default Leave;
