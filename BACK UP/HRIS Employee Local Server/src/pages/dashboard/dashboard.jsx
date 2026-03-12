import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import AdminLayout from "../../components/layout/Adminlayout";
import {
  PersonFillCheck,
  FileEarmarkRuledFill,
  ClipboardDataFill,
  CashCoin,
} from "react-bootstrap-icons";
import RecentReport from "./components/RecentReport";
import RecentPayslip from "./components/RecentPayslip";
import Overview from "./components/Overview";
import AttendanceCalendar from "./components/AttendanceCalendar";
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

  const [announcements, setAnnouncements] = useState([]);
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get("/dashboard/employees");
        const { overview, announcements, recent_payslips, recent_reports } =
          res.data;

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

        setAnnouncements(announcements);
        setRecentPayslips(recent_payslips || []);
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
                  <Card className="stat-card-modern">
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
              <Col lg={6}>
                <AttendanceCalendar />
              </Col>

              {/* ATTENDANCE CALENDAR */}
              <Col lg={6}>
                <Overview />
              </Col>
            </Row>

            {/* RECENT REPORTS */}
            <Row className="mb-4">
              <Col>
                <RecentReport recentReports={recentReports} />
              </Col>
            </Row>

            {/* RECENT PAYSLIPS */}
            <Row>
              <Col>
                <RecentPayslip recentPayslips={recentPayslips} />
              </Col>
            </Row>
          </>
        )}
      </Container>
    </AdminLayout>
  );
};

export default Dashboard;
