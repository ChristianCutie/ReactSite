import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PayslipPDF from "../../components/payslip/PayslipPDF";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import "./Payslip.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import api from "../../config/axios";
import AdminLayout from "../../components/layout/Adminlayout";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Form,
} from "react-bootstrap";
import {
  Search,
  GraphUpArrow,
  FileText,
  CurrencyDollar,
  FileEarmarkText,
  CalendarDate,
  Download,
} from "react-bootstrap-icons";

const Payslip = ({ setIsAuth }) => {
  const { isAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [compactView, setCompactView] = useState(false);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const navigate = useNavigate();
  // Ref for PDF generation
  const pdfRef = useRef();
  const hasFetched = useRef(false);

  // Selected payslip detail
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  //Deductions SSS, Philhealth, Pagibig
  const [allDeductions, setDeductions] = useState([]);

  //Remarks
  const [remarks, setRemarks] = useState([]);

  //period Count page
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  //All Period Count
  const [periodCount, setPeriodCount] = useState([]);

  //Basic Salary
  const [basicSalary, setBasicSalary] = useState(0);

  //`Payslips Data
  const [payslips, setPayslips] = useState([]);

  //Total Allowances
  const [totalAllowances, setTotalAllowances] = useState(0);
  const [allowances, setAllowances] = useState([]);

  //Total Gross, Deductions, Net Pay
  const [totalGross, setTotalGross] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [totalNetPay, setTotalNetPay] = useState(0);

  // Format number to Philippine Peso
  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);

  // Download PDF
  const downloadPDF = async () => {
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Payslip-${selectedPayslip.period}.pdf`);
  };

  // Fetch payslip by ID
  const fetchPayslipById = async (record_id) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/my-payslip/${record_id}`);
      const detail = res.data?.payslip;
      setSelectedPayslip(detail);
    } catch (error) {
      console.error(
        "Error fetching payslip detail:",
        error.response?.data || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch payslips with pagination
  const fetchPayslips = async (page = 1) => {
    try {
      const res = await api.get("/my-payroll-records", {
        params: { page },
      });

      const records = res.data?.data || [];
      setPayslips(records);

      // Totals
      const totalGross = records.reduce(
        (sum, p) => sum + Number(String(p.gross_pay).replace(/,/g, "")),
        0,
      );
      const totalDeductions = records.reduce(
        (sum, p) => sum + Number(String(p.total_deductions).replace(/,/g, "")),
        0,
      );
      const totalNetPay = records.reduce(
        (sum, p) => sum + Number(String(p.net_pay).replace(/,/g, "")),
        0,
      );

      // Fetch Period Count
      const periodCount = records.map((record) => record.period || "");
      setPeriodCount(periodCount);

      // Remarks
      const allRemarks = records.map((record) => record.remarks || "");
      setRemarks(allRemarks);

      // Basic Salary
      const basicSalary = records.map((record) => record.basic_salary || 0);
      setBasicSalary(basicSalary);

      // Flatten deductions - REMOVED, keep with individual payslips
      const allDeductions = records.flatMap(
        (record) => record.deductions || [],
      );
      setDeductions([]);

      // Flatten allowances - REMOVED, keep with individual payslips
      const allAllowances = records.flatMap(
        (record) => record.allowances || [],
      );
      setAllowances([]);

      const totalAllowances = allAllowances.reduce(
        (sum, a) => sum + Number(String(a.allowance_amount).replace(/,/g, "")),
        0,
      );

      // Set totals
      setTotalGross(totalGross);
      setTotalDeductions(totalDeductions);
      setTotalNetPay(totalNetPay);
      setTotalAllowances(totalAllowances);

      // Pagination
      const pagination = res.data?.pagination;
      if (pagination) {
        setCurrentPage(pagination.current_page);
        setLastPage(pagination.last_page);
      }
    } catch (error) {
      console.error(
        "Error fetching payslips:",
        error.response?.data || error.message,
      );
    } finally {
      setIsLoading(false);
    }
  };
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
    fetchPayslips(1);
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      fetchPayslips(newPage);
    }
  };

  // Sample payslip data
  const payslipData = {
    grossPay: totalGross,
    totalDeductions: totalDeductions,
    netPay: totalNetPay,
    attendanceNote: remarks,
  };

  if (!isAuth) {
    return null;
  }

  if (isLoading) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="profile-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading payslip...</span>
          </div>
          <p>Loading payslip information...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout setIsAuth={isAuth}>
      <Container fluid className="payslip-container">
        {/* Page Header */}
        <div className="payslip-header">
          <h2 className="payslip-title fw-bold">Payslip</h2>
        </div>

        {/* My Payslips Section */}
        <div className="payslip-section">
          <div className="payslip-header-section">
            <div>
              <h4 className="section-title">My Payslips</h4>
              <p className="section-subtitle">
                Access your salary slips and payment records
              </p>
            </div>
            <Button
              className="btn-compact-view"
              variant="outline-secondary"
              onClick={() => setCompactView(!compactView)}
            >
              {compactView ? "Detailed View" : "Compact View"}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="search-section mb-4">
            <InputGroup className="payslip-search">
              <InputGroup.Text className="search-icon">
                <Search size={18} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search payslips or remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="payslip-search-input"
              />
            </InputGroup>
          </div>

          {/* Payroll Summary */}
          <div className="payroll-summary">
            <div className="summary-header">
              <h5 className="summary-title">Payroll Summary</h5>
              <p className="summary-period">
                Page: {currentPage} of {lastPage}
              </p>
            </div>
            <Row className="mb-4">
              <Col md={4} className="mb-3">
                <Card className="summary-card">
                  <Card.Body className="text-center">
                    <div className="summary-icon summary-icon-primary">
                      <GraphUpArrow size={28} />
                    </div>
                    <p className="summary-label">Total Gross</p>
                    <h5 className="summary-value">{formatPeso(totalGross)}</h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="summary-card">
                  <Card.Body className="text-center">
                    <div className="summary-icon summary-icon-warning">
                      <FileText size={28} />
                    </div>
                    <p className="summary-label">Total Deductions</p>
                    <h5 className="summary-value summary-value-danger">
                      - {formatPeso(totalDeductions)}
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="summary-card">
                  <Card.Body className="text-center">
                    <div className="summary-icon summary-icon-success">
                      <CurrencyDollar size={28} />
                    </div>
                    <p className="summary-label">Total Net Pay</p>
                    <h5 className="summary-value summary-value-success">
                      {formatPeso(totalNetPay)}
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
          {/* End of Payroll Summary */}

          {/* Payslip Cards - 3 Column Layout */}
          <Row className=" mt-4">
            {payslips
              .filter((payslip) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                  (payslip.period &&
                    payslip.period.toLowerCase().includes(searchLower)) ||
                  (payslip.remarks &&
                    payslip.remarks.toLowerCase().includes(searchLower))
                );
              })
              .map((payslip, index) => (
                <Col key={payslip.record_id} lg={4} md={6} sm={12} className="mb-4">
                  <Card className="payslip-card h-100 shadow-sm rounded-3">
                    <Card.Header className="payslip-card-header">
                      <Card.Title className="payslip-card-title mb-0">
                        {payslip.period}
                      </Card.Title>
                    </Card.Header>
                    <Card.Body className="payslip-card-body">
                      {/* Remarks */}
                      <div className="remarks-section mb-3">
                        <h6 className="remarks-label">Remarks</h6>
                        <div className="remarks-content">
                          <p className="remarks-text text-italic text-muted">
                            {payslip.remarks || "--No additional remarks--"}
                          </p>
                        </div>
                      </div>

                      {/* Payslip Details */}
                      <div className="payslip-details-grid">
                        <div className="detail-item-compact">
                          <p className="detail-label">Gross Pay</p>
                          <h6 className="detail-value">
                            {formatPeso(
                              Number(
                                String(payslip.gross_pay).replace(/,/g, ""),
                              ),
                            )}
                          </h6>
                        </div>
                        <div className="detail-item-compact">
                          <p className="detail-label">Basic Salary</p>
                          <h6 className="detail-value">
                            {formatPeso(
                              Number(
                                String(payslip.basic_salary).replace(/,/g, ""),
                              ),
                            )}
                          </h6>
                        </div>
                        <div className="detail-item-compact">
                          <p className="detail-label">Deductions</p>
                          <h6 className="detail-value detail-value-danger">
                            -{" "}
                            {formatPeso(
                              Number(
                                String(payslip.total_deductions).replace(
                                  /,/g,
                                  "",
                                ),
                              ),
                            )}
                          </h6>
                        </div>
                      </div>

                      {/* Net Pay Highlight */}
                      <div className="net-pay-section mt-3">
                        <div className="net-pay-item">
                          <p className="net-pay-label">Net Pay</p>
                          <h5 className="net-pay-value">
                            {formatPeso(
                              Number(
                                String(payslip.net_pay).replace(/,/g, ""),
                              ),
                            )}
                          </h5>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="payslip-card-footer">
                      <Button
                        onClick={() => {
                          fetchPayslipById(payslip.record_id);
                          handleShow();
                        }}
                        className="btn-view-details w-100"
                      >
                        <FileEarmarkText size={16} className="me-2" />
                        View Details
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            {payslips.filter((payslip) => {
              const searchLower = searchTerm.toLowerCase();
              return (
                (payslip.period &&
                  payslip.period.toLowerCase().includes(searchLower)) ||
                (payslip.remarks &&
                  payslip.remarks.toLowerCase().includes(searchLower))
              );
            }).length === 0 &&
              searchTerm && (
                <Col xs={12}>
                  <div className="alert alert-info text-center mt-4">
                    <p className="mb-0">
                      No payslips found for "{searchTerm}". Try searching with a
                      different period or remark.
                    </p>
                  </div>
                </Col>
              )}
          </Row>

          {/* Pagination Controls - Bottom */}
          {lastPage > 1 && (
            <div className="pagination-controls mt-4 d-flex gap-2 align-items-center justify-content-center">
              <Button
                variant="outline-primary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="pagination-info">
                Page {currentPage} of {lastPage}
              </span>
              <Button
                variant="outline-primary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        <Offcanvas
          show={show}
          onHide={handleClose}
          placement="bottom"
          className="payslip-offcanvas h-75"
        >
          <Offcanvas.Header closeButton className="payslip-offcanvas-header">
            <Offcanvas.Title className="payslip-offcanvas-title">
              <FileEarmarkText size={20} className="me-2" />
              Payslip Details
            </Offcanvas.Title>
          </Offcanvas.Header>
          {selectedPayslip && (
            <Offcanvas.Body className="payslip-offcanvas-body p-4">
              {/* Date Range */}
              <div className="payslip-detail-section">
                <div className="detail-date-info">
                  <p className="detail-date-label">
                    <CalendarDate size={16} className="me-2" />
                    {selectedPayslip.period}
                  </p>
                  <p className="detail-generated">
                    Generated: {selectedPayslip.generated_at}
                    <p>{selectedPayslip.employee_id || "--No employee ID--"}</p>
                  </p>
                </div>
              </div>

              {/* Remarks Section */}

              <div className="payslip-detail-section">
                <h6 className="detail-section-title">Remarks</h6>
                <div className="remarks-box">
                  <p className="remarks-text">
                    {selectedPayslip.remarks || "--No additional remarks--"}
                  </p>
                </div>
              </div>
              {/* Summary Boxes */}
              <Row className="mb-4">
                <Col lg={4} className="mb-2">
                  <div className="summary-detail-box summary-detail-blue">
                    <p className="summary-detail-label">Total Gross Pay</p>
                    <h6 className="summary-detail-value">
                      {formatPeso(
                        Number(
                          String(selectedPayslip.gross_pay).replace(/,/g, ""),
                        ),
                      )}
                    </h6>
                  </div>
                </Col>
                <Col lg={4} className="mb-2">
                  <div className="summary-detail-box summary-detail-yellow">
                    <p className="summary-detail-label">Total Deductions</p>
                    <h6 className="summary-detail-value-danger">
                      -{" "}
                      {formatPeso(
                        Number(
                          String(selectedPayslip.total_deductions).replace(
                            /,/g,
                            "",
                          ),
                        ),
                      )}
                    </h6>
                  </div>
                </Col>
                <Col lg={4} className="mb-2">
                  <div className="summary-detail-box summary-detail-green">
                    <p className="summary-detail-label">Net Pay</p>
                    <h6 className="summary-detail-value">
                      {formatPeso(
                        Number(
                          String(selectedPayslip.net_pay).replace(/,/g, ""),
                        ),
                      )}
                    </h6>
                  </div>
                </Col>
              </Row>

              {/* Allowances Section */}
              <div className="payslip-detail-section">
                <h6 className="detail-section-title">Allowances</h6>
                {selectedPayslip.allowances &&
                selectedPayslip.allowances.length > 0 ? (
                  selectedPayslip.allowances.map((allowance, idx) => (
                    <div key={idx} className="allowance-deduction-item">
                      <span className="item-name">
                        {allowance.allowance_type}
                      </span>
                      <span className="item-amount positive">
                        +
                        {formatPeso(
                          Number(
                            String(allowance.allowance_amount).replace(
                              /,/g,
                              "",
                            ),
                          ),
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No allowances</p>
                )}
              </div>

              {/* Deductions Section */}
              <div className="payslip-detail-section">
                <h6 className="detail-section-title">Deductions</h6>
                {selectedPayslip.deductions &&
                selectedPayslip.deductions.length > 0 ? (
                  selectedPayslip.deductions.map((deduction, idx) => (
                    <div key={idx} className="allowance-deduction-item">
                      <span className="item-name">
                        {deduction.deduction_type}
                      </span>
                      <span className="item-amount negative">
                        -
                        {formatPeso(
                          Number(
                            String(deduction.deduction_amount).replace(
                              /,/g,
                              "",
                            ),
                          ),
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No deductions</p>
                )}
              </div>

              {/* Basic Salary Section */}
              <div className="payslip-detail-section">
                <h6 className="detail-section-title">Daily Rate</h6>
                <div className="allowance-deduction-item">
                  <span className="item-name">Basic Salary</span>
                  <span className="item-amount positive">
                    {formatPeso(
                      Number(
                        String(selectedPayslip.basic_salary).replace(/,/g, ""),
                      ),
                    )}
                  </span>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="payslip-detail-section">
                <div className="allowance-deduction-item">
                  <span className="item-name">
                    <strong>Total Gross Pay</strong>
                  </span>
                  <span className="item-amount">
                    <strong>
                      {formatPeso(
                        Number(
                          String(selectedPayslip.gross_pay).replace(/,/g, ""),
                        ),
                      )}
                    </strong>
                  </span>
                </div>
                <div className="allowance-deduction-item">
                  <span className="item-name">
                    <strong>Total Deductions</strong>
                  </span>
                  <span className="item-amount negative">
                    <strong>
                      {formatPeso(
                        Number(
                          String(selectedPayslip.total_deductions).replace(
                            /,/g,
                            "",
                          ),
                        ),
                      )}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Download PDF Button */}
              <div className="d-flex justify-content-end w-100">
                <Button
                  className="btn-download-pdf w-100 mt-4"
                  onClick={downloadPDF}
                >
                  <Download size={18} className="me-2" />
                  Download as PDF
                </Button>
              </div>
            </Offcanvas.Body>
          )}
        </Offcanvas>
        {/* Hidden but renderable */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <PayslipPDF
            ref={pdfRef}
            payslip={selectedPayslip}
            formatPeso={formatPeso}
          />
        </div>
      </Container>
    </AdminLayout>
  );
};

export default Payslip;
