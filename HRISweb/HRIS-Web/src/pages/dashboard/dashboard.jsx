import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Table,
  Offcanvas,
} from "react-bootstrap";
import AdminLayout from "../../components/layout/Adminlayout";
import {
  PersonFillCheck,
  FileEarmarkRuledFill,
  FileEarmarkRuled,
  ClipboardDataFill,
  CashCoin,
  JournalText,
  Megaphone,
  Eye,
} from "react-bootstrap-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import PayslipPDF from "../../components/payslip/PayslipPDF";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import api from "../../config/axios";
import "./Dashboard.css";

const Dashboard = ({ setIsAuth }) => {
  const iconMap = {
    "person-fill-check": <PersonFillCheck />,
    "file-earmark-ruled-fill": <FileEarmarkRuledFill />,
    "clipboard-data-fill": <ClipboardDataFill />,
    "cash-coin": <CashCoin />,
  };

  const [stats, setStats] = useState([
    {
      id: 1,
      label: "Total Attendances",
      value: "0",
      icon: "person-fill-check",
      color: "primary",
    },
    {
      id: 2,
      label: "Total Payslips",
      value: "0",
      icon: "file-earmark-ruled-fill",
      color: "primary",
    },
    {
      id: 3,
      label: "Total Presents",
      value: "0",
      icon: "clipboard-data-fill",
      color: "primary",
    },
    {
      id: 4,
      label: "Total Net Pay",
      value: "0",
      icon: "cash-coin",
      color: "primary",
    },
  ]);

  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    presentPercentage: 0,
    absent: 0,
    absentPercentage: 0,
  });

  const [announcements, setAnnouncements] = useState([]);
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const pdfRef = useRef();
  const hasFetched = useRef(false);

  // Add these state declarations inside the Dashboard component
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/employees");
        const {
          overview,
          announcements,
          recent_attendance,
          recent_payslips,
          recent_reports,
        } = res.data;

        // --- STAT CARDS ---
        setStats([
          {
            id: 1,
            label: "Total Attendances",
            value: overview.total_attendance.toLocaleString(),
            icon: "person-fill-check",
            color: "primary",
          },
          {
            id: 2,
            label: "Total Payslips",
            value: overview.total_payslip_count.toLocaleString(),
            icon: "file-earmark-ruled-fill",
            color: "primary",
          },
          {
            id: 3,
            label: "Total Gross Pay",
            value: formatPeso(overview.total_payslip_amount),
            icon: "clipboard-data-fill",
            color: "primary",
          },
          {
            id: 4,
            label: "Total Net Pay",
            value: formatPeso(overview.total_net_pays),
            icon: "cash-coin",
            color: "primary",
          },
        ]);

        // --- ATTENDANCE OVERVIEW (based on recent_attendance) ---
        const present = recent_attendance.filter(
          (a) => a.status === "Present",
        ).length;
        const absent = recent_attendance.filter(
          (a) => a.status !== "Present",
        ).length;
        const total = present + absent || 1;

        setAttendanceData({
          present,
          absent,
          presentPercentage: Math.round((present / total) * 100),
          absentPercentage: Math.round((absent / total) * 100),
        });

        setAnnouncements(announcements);
        setRecentPayslips(recent_payslips);
        setRecentReports(recent_reports || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load dashboard");
        setLoading(false);
      }
    };
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchDashboard();
  }, []);

  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);

  // Download payslip PDF
  const downloadPayslipPDF = async (payslipId) => {
    try {
      setDownloadingId(payslipId);

      // Fetch full payslip details
      const res = await api.get(`/my-payslip/${payslipId}`);
      const payslipData = res.data?.payslip;

      if (!payslipData) {
        alert("Failed to fetch payslip details");
        setDownloadingId(null);
        return;
      }

      // Create a temporary container for rendering the PDF component
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = "800px";
      document.body.appendChild(tempContainer);

      // Render the PayslipPDF component
      const root = ReactDOM.createRoot(tempContainer);
      root.render(
        <PayslipPDF
          payslip={payslipData}
          formatPeso={formatPeso}
          ref={pdfRef}
        />,
      );

      // Wait for render to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate PDF from the rendered content
      const pdfContainer = tempContainer.querySelector(".pdf-container");
      if (pdfContainer) {
        const canvas = await html2canvas(pdfContainer, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Payslip-${payslipData.period}.pdf`);
      }

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
      setDownloadingId(null);
    } catch (err) {
      console.error("Error downloading payslip:", err);
      alert("Failed to download payslip. Please try again.");
      setDownloadingId(null);
    }
  };

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="dashboard-container">
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="profile-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading dashboard...</span>
            </div>
            <p>Loading dashboard information...</p>
          </div>
        ) : (
          <>
            <Row className="mb-4">
              <Col>
                <h2 className="dashboard-title">Dashboard</h2>
                <p className="dashboard-subtitle">
                  Welcome back! Here's your HRIS overview
                </p>
              </Col>
            </Row>

            {/* STAT CARDS */}
            <Row className="mb-4">
              {stats.map((stat) => (
                <Col lg={3} md={6} key={stat.id}>
                  <Card className={`stat-card stat-card-${stat.color}`}>
                    <Card.Body className="stat-content">
                      <div className="stat-info">
                        <p>{stat.label}</p>
                        <h5>{stat.value}</h5>
                      </div>
                      <div className={`stat-icon stat-icon-${stat.color}`}>
                        {iconMap[stat.icon]}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row className="mb-4">
              {/* ATTENDANCE CHART */}
              <Col lg={8}>
                <Card className="dashboard-card h-100">
                  <Card.Header className="card-header-custom">
                    <h5>Recent Attendance</h5>
                    <Link to="/attendance">
                      <Button size="sm" variant="outline-primary">
                        View All
                      </Button>
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    <div className="attendance-chart-wrapper">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[
                            {
                              name: "Present",
                              value: attendanceData.present,
                              fill: "#28a745",
                            },
                            {
                              name: "Absent",
                              value: attendanceData.absent,
                              fill: "#dc3545",
                            },
                          ]}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e9ecef"
                          />
                          <XAxis dataKey="name" stroke="#6b7280" />
                          <YAxis stroke="#6b7280" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "1px solid #e9ecef",
                              borderRadius: "8px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="attendance-stats-container mt-5">
                      <Row className="g-3">
                        <Col md={6}>
                          <div className="attendance-stat-card">
                            <div className="stat-header">
                              <div className="stat-color-indicator present"></div>
                              <h6>Present</h6>
                            </div>
                            <div className="stat-content">
                              <h3>{attendanceData.present}</h3>
                              <div className="stat-percentage">
                                <span className="percentage-badge success">
                                  {attendanceData.presentPercentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="attendance-stat-card">
                            <div className="stat-header">
                              <div className="stat-color-indicator absent"></div>
                              <h6>Absent</h6>
                            </div>
                            <div className="stat-content">
                              <h3>{attendanceData.absent}</h3>
                              <div className="stat-percentage">
                                <span className="percentage-badge danger">
                                  {attendanceData.absentPercentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* ANNOUNCEMENTS */}
              <Col lg={4}>
                <Card className="dashboard-card h-100">
                  <Card.Header className="card-header-custom">
                    <h5>Announcement Board</h5>
                  </Card.Header>
                  <Card.Body>
                    {announcements.length === 0 ? (
                       <div className="text-center py-5">
                        <Megaphone
                          size={48}
                          className="mb-3 text-muted"
                        />
                        <p className="text-muted">No announcements available</p>
                      </div>
                    ):(
                      <>
                       {announcements.map((a) => (
                      <div
                        key={a.id}
                        className="mb-3 border announcement-card pb-2 shadow-sm"
                        onClick={() => {
                          setSelectedAnnouncement(a);
                          setShowAnnouncement(true);
                        }}
                        style={{ cursor: "pointer" }} // visual feedback
                      >
                        <strong>{a.title}</strong>
                        <p className="small text-muted">
                          {a.content.substring(0, 80)}...
                        </p>
                        <div className="text-end">
                          <p className="text-muted text-end fst-italic mb-1 announcement-date">
                            {a.created_at
                              ? new Date(a.created_at).toLocaleDateString()
                              : "Date not available"}
                          </p>
                        </div>
                      </div>
                    ))}</>
                    )}
                   
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* RECENT REPORTS */}
            <Row className="mb-4">
              <Col>
                <Card className="dashboard-card">
                  <Card.Header className="card-header-custom">
                    <h5>Recent Reports</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table borderless striped className="dashboard-table">
                        <thead>
                          <tr>
                            <th>Report ID</th>
                            <th>Clock Out Time</th>
                            <th>Date</th>
                            <th>Report Details</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentReports.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="text-center py-5">
                                <JournalText
                                  size={48}
                                  className="mb-3 text-muted"
                                />
                                <p className="text-muted">
                                  No reports available
                                </p>
                              </td>
                            </tr>
                          ) : (
                            recentReports.map((report) => (
                              <tr key={report.id}>
                                <td className="report-id-cell">
                                  <span className="badge bg-primary">
                                    #{report.id}
                                  </span>
                                </td>
                                <td>
                                  <span className="report-time">
                                    {new Date(
                                      report.clock_out,
                                    ).toLocaleTimeString()}
                                  </span>
                                </td>
                                <td>
                                  <span className="report-date">
                                    {new Date(
                                      report.clock_out,
                                    ).toLocaleDateString()}
                                  </span>
                                </td>
                                <td>
                                  <span className="report-details">
                                    {report.report_today ||
                                      "No details provided"}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-info">
                                    Submitted
                                  </span>
                                </td>
                                <td>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="action-btn"
                                  >
                                    <Eye size={14} className="me-1" />
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* RECENT PAYSLIPS */}
            <Row>
              <Col>
                <Card className="dashboard-card">
                  <Card.Header className="card-header-custom">
                    <h5>Recent Payslips</h5>
                    <Link to="/payslip">
                      <Button size="sm" variant="outline-primary">
                        View All
                      </Button>
                    </Link>
                  </Card.Header>
                  <Card.Body>
                    {recentPayslips.length === 0 ? (
                      <div className="text-center py-5">
                        <FileEarmarkRuled
                          size={48}
                          className="mb-3 text-muted"
                        />
                        <p className="text-muted">No payslips available</p>
                      </div>
                    ) : (
                      <Row>
                        {recentPayslips.map((p) => (
                          <Col lg={4} md={6} key={p.id} className="mb-4">
                            <Card className="payslip-card border shadow-sm">
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <h6 className="mb-1 text-primary">
                                      {new Date(
                                        p.created_at,
                                      ).toLocaleDateString()}
                                    </h6>
                                    <small className="text-muted">
                                      Payslip
                                    </small>
                                  </div>
                                  <span className="badge bg-success">
                                    Completed
                                  </span>
                                </div>
                                <hr />
                                <div className="payslip-info">
                                  <div className="mb-3">
                                    <small className="text-muted d-block">
                                      Gross Pay
                                    </small>
                                    <h5 className="mb-0">
                                      {formatPeso(p.gross_pay)}
                                    </h5>
                                  </div>
                                  <div>
                                    <small className="text-muted d-block">
                                      Net Pay
                                    </small>
                                    <h5 className="mb-0 text-success">
                                      {formatPeso(p.net_pay)}
                                    </h5>
                                  </div>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="w-100 mt-3"
                                  onClick={() => downloadPayslipPDF(p.id)}
                                  disabled={downloadingId === p.id}
                                >
                                  {downloadingId === p.id ? (
                                    <>
                                      <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                      />
                                      Downloading...
                                    </>
                                  ) : (
                                    "Download Payslip"
                                  )}
                                </Button>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
        {/* Offcanvas for announcement details */}
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
                  {new Date(
                    selectedAnnouncement.created_at,
                  ).toLocaleDateString()}
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
      </Container>
    </AdminLayout>
  );
};

export default Dashboard;
