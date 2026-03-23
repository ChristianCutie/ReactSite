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
import AdminLayout from "@/components/layout/Adminlayout";
import {
  PlusCircle,
  CashStack,
  ChevronLeft,
  ChevronRight,
  Wallet2,
  Wallet,
  CashCoin,
} from "react-bootstrap-icons";
import api from "@/config/axios";
import "@/pages/loan/Loan.css";
import "@/assets/style/global.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Loan = ({ setIsAuth }) => {
  // Assuming you have an authentication context or method to check if the user is authenticated
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [showModal, setShowModal] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);

  //loading
  const [loading, setLoading] = useState(false);
  const [loadingLoanTypes, setLoadingLoanTypes] = useState(false);

  // Error & Success Messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);
  const ROWS_PER_PAGE = 10;

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const hasFetched = useRef(false);

  // Form State
  const [formData, setFormData] = useState({
    loan_type_id: "",
    principal_amount: "",
    end_date: "",
    remarks: "",
  });

  const [selectedLoanType, setSelectedLoanType] = useState(null);

  // Fetch loans on mount and when filters change
  useEffect(() => {
    fetchLoans();
    fetchLoanTypes();
  }, [currentPage, statusFilter, searchTerm]);

  // Fetch user's loans
  const fetchLoans = async () => {
    try {
      setLoadingLoanTypes(true);
      const response = await api.get("/my-loans", {
        params: {
          per_page: ROWS_PER_PAGE,
          page: currentPage,
          search: searchTerm || undefined,
          status: statusFilter || undefined,
        },
      });

      if (response.data.success) {
        setLoans(response.data.data);
        setTotalLoans(response.data.pagination.total);
        setTotalPages(response.data.pagination.last_page);
      }
      setError(null);
    } catch (err) {
      setError("Failed to fetch loans");
      console.error(err);
    } finally {
      setLoadingLoanTypes(false);
    }
  };

  // Fetch loan types
  const fetchLoanTypes = async () => {
    try {
      const response = await api.get("/dropdown/loan-types");
      if (
        response.data.isSuccess ||
        (Array.isArray(response.data) && response.data.length > 0)
      ) {
        setLoanTypes(
          Array.isArray(response.data)
            ? response.data
            : response.data.data || [],
        );
      }
    } catch (err) {
      console.error("Failed to fetch loan types:", err);
    }
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update selected loan type for display
    if (name === "loan_type_id") {
      const selected = loanTypes.find((lt) => lt.id === parseInt(value));
      setSelectedLoanType(selected);
    }
  };

  // Submit loan application
  const handleSubmitLoan = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form
    if (
      !formData.loan_type_id ||
      !formData.principal_amount ||
      !formData.end_date
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Check amount limit
    if (selectedLoanType?.amount_limit) {
      if (
        parseFloat(formData.principal_amount) > selectedLoanType.amount_limit
      ) {
        setError(
          `Maximum loan amount for this type is ₱${selectedLoanType.amount_limit?.toLocaleString()}`,
        );
        return;
      }
    }

    // Check end date is in future
    const endDate = new Date(formData.end_date);
    if (endDate <= new Date()) {
      setError("End date must be in the future");
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        loan_type_id: parseInt(formData.loan_type_id),
        principal_amount: parseFloat(formData.principal_amount),
        end_date: formData.end_date,
        remarks: formData.remarks || null,
      };

      const response = await api.post("/create/loans", submitData);

      if (response.data.success) {
        setSuccess("Loan application submitted successfully!");
        setFormData({
          loan_type_id: "",
          principal_amount: "",
          end_date: "",
          remarks: "",
        });
        setSelectedLoanType(null);

        setTimeout(() => {
          setShowModal(false);
          setCurrentPage(1);
          fetchLoans();
        }, 1500);
      } else {
        setError(response.data.message || "Failed to submit loan application");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to submit loan application");
      }
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge bg="success">✓ Active</Badge>;
      case "pending":
        return <Badge bg="warning">⏳ Pending</Badge>;
      case "paid":
        return <Badge bg="info">💳 Paid</Badge>;
      case "defaulted":
        return <Badge bg="danger">✕ Defaulted</Badge>;
      case "cancelled":
        return <Badge bg="secondary">⊘ Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "₱0.00";
    return `₱${parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // Reset form
  const handleResetForm = () => {
    setShowModal(false);
    setLoadingLoanTypes(false);
    setFormData({
      loan_type_id: "",
      principal_amount: "",
      end_date: "",
      remarks: "",
    });
    setSelectedLoanType(null);
  };

  const totalActiveLoans = loans.filter(
    (loan) => loan.status?.toLowerCase() === "active",
  ).length;

  const totalPendingLoans = loans.filter(
    (loan) => loan.status?.toLowerCase() === "pending",
  ).length;

  const setStats = () => {
    return [
      {
        id: 1,
        label: "Total Loans",
        value: totalLoans || 0,
        icon: "CashStack",
        color: "primary",
      },
      {
        id: 2,
        label: "Total Active Loans",
        value: totalActiveLoans || 0,
        icon: "CashStack",
        color: "primary",
      },
      {
        id: 3,
        label: "Total Pending Loans",
        value: totalPendingLoans || 0,
        icon: "CashStack",
        color: "primary",
      },
      {
        id: 4,
        label: "Total Paid Loans",
        value: loans.filter((loan) => loan.status?.toLowerCase() === "paid")
          .length,
        icon: "CashStack",
        color: "primary",
      },
    ];
  };

  const statIcons = {
    "Total Loans": <CashStack size={30} />,
    "Total Active Loans": <Wallet2 size={30} />,
    "Total Pending Loans": <Wallet size={30} />,
    "Total Paid Loans": <CashCoin size={30} />,
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuth) {
      if (setIsAuth) setIsAuth(false);
      navigate("/");
      return;
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
  }, []);

  if (!isAuth) {
    return null;
  }
  if (loading) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="profile-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading loan...</span>
          </div>
          <p>Loading loan information...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout setIsAuth={isAuth}>
      <Container fluid className="glb-container">
        {/* Page Header */}
        <Row>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <h1 className="loan-title">Loan Management</h1>
            <Button
              size="sm"
              className="px-3"
              onClick={() => setShowModal(true)}
            >
              <PlusCircle size={18} className="me-2" />
              Apply for Loan
            </Button>
          </div>
        </Row>

        {/* Summary Stats */}
        <Row className="loan-section mb-4 g-3">
          {setStats().map((stat) => (
            <Col md={3} sm={6} key={stat.id}>
              <Card className="glb-stats-card">
                <Card.Body className="glb-stat-content">
                  <div className="glb-stat-info">
                    <p>{stat.label}</p>
                    <h5>{stat.value}</h5>
                  </div>
                  <div className="glb-stat-icon">
                    {statIcons[stat.label] || stat.icon}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        {/* Search & Filter */}
        <Card className="loan-filter-card mb-4">
          <Card.Body className="p-3">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">
                    Search by Loan Type
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter loan type..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-3 p-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">
                    Filter by Status
                  </Form.Label>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-3 p-2"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="paid">Paid</option>
                    <option value="defaulted">Defaulted</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end ">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleResetFilters}
                  className="w-100 rounded-3 mb-1"
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Loans Table */}
        <Card className="loan-table-card">
          <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
            <h5 className="fw-bold mb-0">My Loans</h5>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}

            {loadingLoanTypes ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : loans.length > 0 ? (
              <>
                <div className="table-responsive">
                  <Table striped hover className="align-middle mb-0 loan-table">
                    <thead className="loan-table-header">
                      <tr>
                        <th>Loan Type</th>
                        <th>Principal</th>
                        <th>Balance</th>
                        <th>Monthly</th>
                        <th>Interest</th>
                        <th>Period</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan) => (
                        <tr key={loan.id} className="loan-table-row">
                          <td className="fw-medium text-primary">
                            {loan.loan_type}
                          </td>
                          <td>{formatCurrency(loan.principal_amount)}</td>
                          <td className="text-info">
                            {formatCurrency(loan.balance_amount)}
                          </td>
                          <td>{formatCurrency(loan.monthly_amortization)}</td>
                          <td>{loan.interest_rate}</td>
                          <td className="small">
                            <span className="text-muted">
                              {loan.start_date} to {loan.end_date}
                            </span>
                          </td>
                          <td>{getStatusBadge(loan.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <div className="text-muted small">
                      Page {currentPage} of {totalPages} ({totalLoans} total
                      loans)
                    </div>
                    <div className="pagination-controls">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="me-2"
                      >
                        <ChevronLeft size={16} /> Previous
                      </Button>

                      <div className="d-inline-flex gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page
                                ? "primary"
                                : "outline-secondary"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="page-btn"
                            style={{ minWidth: "32px" }}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="ms-2"
                      >
                        Next <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Alert variant="info">
                No loans found. Ready to apply for a loan?
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Apply Loan Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-white">Apply for Loan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmitLoan}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Loan Type *</Form.Label>
                <Form.Select
                  name="loan_type_id"
                  value={formData.loan_type_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Loan Type</option>
                  {loanTypes.map((loanType) => (
                    <option key={loanType.id} value={loanType.id}>
                      {loanType.type_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Principal Amount *</Form.Label>
                <Form.Control
                  type="number"
                  name="principal_amount"
                  value={formData.principal_amount}
                  onChange={handleFormChange}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
                {selectedLoanType?.amount_limit && (
                  <Form.Text className="text-muted">
                    Maximum: ₱
                    {parseFloat(selectedLoanType.amount_limit).toLocaleString()}
                  </Form.Text>
                )}
                {selectedLoanType?.interest && (
                  <Form.Text className="text-muted d-block">
                    Interest Rate: {selectedLoanType.interest}%
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">End Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleFormChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <Form.Text className="text-muted">
                  Loan period will be calculated from today
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Remarks (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  placeholder="Enter any additional remarks..."
                  maxLength={500}
                />
                <small className="text-muted">
                  {formData.remarks.length}/500 characters
                </small>
              </Form.Group>

              {selectedLoanType &&
                formData.principal_amount &&
                formData.end_date && (
                  <Alert variant="info" className="mb-3">
                    <strong>Loan Summary:</strong>
                    <ul className="mb-0 mt-2 small">
                      <li>Loan Type: {selectedLoanType.type_name}</li>
                      <li>
                        Principal: {formatCurrency(formData.principal_amount)}
                      </li>
                      <li>Interest Rate: {selectedLoanType.interest || 0}%</li>
                      <li>
                        Period End:{" "}
                        {new Date(formData.end_date).toLocaleDateString()}
                      </li>
                    </ul>
                  </Alert>
                )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="px-3"
              size="sm"
              variant="secondary"
              onClick={handleResetForm}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="px-3"
              size="sm"
              variant="primary"
              onClick={handleSubmitLoan}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
};

export default Loan;
