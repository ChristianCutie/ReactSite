import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Container,
  Card,
  Button,
  Modal,
  Toast,
  ToastContainer,
  Badge,
  Spinner,
  Row,
  Col,
  Table,
  Form,
  InputGroup,
  Dropdown,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import AdminLayout from "../../components/layout/Adminlayout";
import api from "../../config/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Clock,
  DoorOpen,
  Lightbulb,
  ThreeDots,
  CalendarDate,
  ClockHistory,
  PersonBadge,
  QuestionCircle,
} from "react-bootstrap-icons";
import { useNavigate, Link } from "react-router-dom";
import RichTextEditor from "./components/RichTextEditor.jsx";
import "./Attendance.css";
import "../../assets/style/global.css";

const Attendance = ({ setIsAuth }) => {
  const { isAuth } = useAuth();
  const hasFetched = useRef(false);
  const autoClockOutTriggered = useRef(false);

  const [toasts, setToasts] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingIn, setLoadingIn] = useState(false);
  const [loadingOut, setLoadingOut] = useState(false);
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({
    clockInTime: null,
    hoursToday: 0,
    isClockedIn: false,
    weekHours: 0,
    monthHours: 0,
    attendanceDays: 0,
    onTimeRate: 95,
    recentAttendance: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);

  const [clockInTimestamp, setClockInTimestamp] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [showReportModal, setShowReportModal] = useState(false);
  const [ccEmails, setCcEmails] = useState("");
  const [reportBody, setReportBody] = useState("");
  const [reportSubject, setReportSubject] = useState("");

  // DTR Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustedClockIn: "",
    adjustedClockOut: "",
    reason: "",
  });

  // Forgot Clock In Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotClockInForm, setForgotClockInForm] = useState({
    adjustedClockDate: "",
    adjustedClockIn: "",
    adjustedClockOut: "",
    reason: "",
  });

  // Present/Absent Tab
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [absentDates, setAbsentDates] = useState([]);
  const [loadingPresentAbsent, setLoadingPresentAbsent] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const navigate = useNavigate();

  // ----------------- FETCH ATTENDANCE -----------------
  const fetchMyAttendance = async () => {
    try {
      setLoadingSummary(true);
      const response = await api.get("/my-attendance");
      const data = response.data;

      if (data.isSuccess) {
        let clockInTime = null;
        let hoursToday = 0;
        let isClockedIn = false;
        let rawTimestamp = null;

        if (data.todayRecord) {
          if (data.todayRecord.clock_in) {
            const date = new Date(data.todayRecord.clock_in);
            clockInTime = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            rawTimestamp = data.todayRecord.clock_in;
          }
          hoursToday = parseFloat(data.todayRecord.hours_worked) || 0;
          isClockedIn =
            data.todayRecord.clock_in && !data.todayRecord.clock_out;
        }

        setSummary({
          clockInTime,
          hoursToday,
          isClockedIn,
          weekHours: parseFloat(data.thisWeekHours) || 0,
          monthHours: parseFloat(data.thisMonthHours) || 0,
          attendanceDays: parseInt(data.attendanceRate, 10) || 0,
          onTimeRate: parseInt(data.onTimeRate, 10) || 95,
          recentAttendance: data.recentAttendance || [],
        });

        setClockInTimestamp(isClockedIn ? rawTimestamp : null);
      }
    } catch (error) {
      showToast("Failed to load attendance summary", "danger");
    } finally {
      setLoadingSummary(false);
      setIsInitialLoading(false);
    }
  };

  // ---------- FETCH ABSENCES FOR SELECTED MONTH ----------
  const fetchMonthlyAbsences = async (month, year) => {
    setLoadingPresentAbsent(true);
    try {
      const response = await api.get("/my-absence", {
        params: { month, year },
      });
      if (response.data && response.data.absent_dates) {
        setAbsentDates(response.data.absent_dates);
      } else {
        setAbsentDates([]);
        showToast("Unexpected response format", "danger");
      }
    } catch (error) {
      showToast("Error loading absences: " + error.message, "danger");
      setAbsentDates([]);
    } finally {
      setLoadingPresentAbsent(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuth) {
      if (setIsAuth) setIsAuth(false);
      navigate("/snl-hr-app");
      return;
    }
  }, [isAuth, navigate, setIsAuth]);

  // Initial fetch
  useEffect(() => {
    if (isAuth && !hasFetched.current) {
      hasFetched.current = true;
      fetchMyAttendance();
    }
  }, [isAuth]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ----------------- LIVE HOURS CALCULATION -----------------
  const liveHoursToday = useMemo(() => {
    if (summary.isClockedIn && clockInTimestamp) {
      const now = currentDateTime;
      const clockInDate = new Date(clockInTimestamp);
      const diffMs = now - clockInDate;
      return diffMs / (1000 * 60 * 60);
    }
    return summary.hoursToday;
  }, [
    summary.isClockedIn,
    clockInTimestamp,
    currentDateTime,
    summary.hoursToday,
  ]);

  // ----------------- AUTO CLOCK-OUT AFTER 15 HOURS -----------------
  const autoClockOut = async () => {
    autoClockOutTriggered.current = true;
    try {
      await api.post("/attendance/clock-out");
      showToast("Auto clocked out after 15 hours", "info");
      await fetchMyAttendance();
    } catch (error) {
      showToast(
        "Auto clock-out failed: " +
          (error.response?.data?.message || error.message),
        "danger",
      );
    }
  };

  useEffect(() => {
    if (
      summary.isClockedIn &&
      liveHoursToday >= 15 &&
      !autoClockOutTriggered.current
    ) {
      autoClockOut();
    }
  }, [liveHoursToday, summary.isClockedIn]);

  // ----------------- CLOCK IN HANDLER -----------------
  const handleClockIn = async () => {
    setLoadingIn(true);
    try {
      await api.post("/attendance/clock-in");
      showToast("Clocked In Successfully!");
      setClockInTimestamp(null);
      autoClockOutTriggered.current = false;
      await fetchMyAttendance();
    } catch (error) {
      showToast(error.response?.data?.message || "Clock in failed", "danger");
    } finally {
      setLoadingIn(false);
    }
  };

  // ----------------- CLOCK OUT HANDLER (with report) -----------------
  const handleClockOut = async () => {
    setLoadingOut(true);
    try {
      const payload = {
        report_today: reportBody,
        cc_emails: ccEmails,
        subject: reportSubject,
      };

      await api.post("/attendance/clock-out", payload);
      showToast("Clocked Out Successfully!");

      setCcEmails("");
      setReportSubject("");
      setReportBody("");
      setClockInTimestamp(null);
      autoClockOutTriggered.current = false;

      await fetchMyAttendance();
    } catch (error) {
      showToast(error.response?.data?.message || "Clock out failed", "danger");
    } finally {
      setLoadingOut(false);
    }
  };

  // ----------------- REPORT MODAL SUBMIT -----------------
  const handleReportSubmit = async () => {
    if (!reportBody || !reportBody.trim()) {
      showToast("Please enter a report before continuing.", "warning");
      return;
    }
    setShowReportModal(false);
    await handleClockOut();
  };

  // ----------------- TOASTS -----------------
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ----------------- FORMAT HELPERS -----------------
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatTimeRange = (clockIn, clockOut) => {
    if (!clockIn) return "—";
    const inTime = formatTime(clockIn);
    if (!clockOut) return `${inTime} - (on duty)`;
    const outTime = formatTime(clockOut);
    return `${inTime} - ${outTime}`;
  };

  const formatHours = (hours) => {
    if (!hours && hours !== 0) return "0.00";
    return parseFloat(hours).toFixed(2);
  };

  // ----------------- DTR ADJUSTMENT MODAL HANDLERS -----------------
  const handleOpenAdjustModal = (record) => {
    setSelectedRecord(record);
    setAdjustmentForm({
      adjustedClockIn: record.clock_in
        ? formatTimeForInput(record.clock_in)
        : "",
      adjustedClockOut: record.clock_out
        ? formatTimeForInput(record.clock_out)
        : "",
      reason: "",
    });
    setShowAdjustModal(true);
  };

  const handleCloseForgotClockInModal = () => {
    setShowForgotModal(false);
    setLoading(false);
    setForgotClockInForm({
      adjustedClockDate: "",
      adjustedClockIn: "",
      adjustedClockOut: "",
      reason: "",
    });
  };

  const handleCloseAdjustModal = () => {
    setShowAdjustModal(false);
    setSelectedRecord(null);
    setAdjustmentForm({
      adjustedClockIn: "",
      adjustedClockOut: "",
      reason: "",
    });
  };

  const handleAdjustmentFormChange = (e) => {
    const { name, value } = e.target;
    setAdjustmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotFormChange = (e) => {
    const { name, value } = e.target;
    setForgotClockInForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ----------------- HANDLE FORGOT CLOCK IN REQUEST SUBMISSION -----------------
  const handleSubmitForgotClockInRequest = async () => {
    setLoading(true);
    try {
      const payload = {
        adjusted_clock_date: forgotClockInForm.adjustedClockDate || null,

        adjusted_clock_in:
          forgotClockInForm.adjustedClockDate &&
          forgotClockInForm.adjustedClockIn
            ? `${forgotClockInForm.adjustedClockDate}T${forgotClockInForm.adjustedClockIn}:00`
            : null,

        adjusted_clock_out:
          forgotClockInForm.adjustedClockDate &&
          forgotClockInForm.adjustedClockOut
            ? `${forgotClockInForm.adjustedClockDate}T${forgotClockInForm.adjustedClockOut}:00`
            : null,

        reason: forgotClockInForm.reason,
      };
      console.log("Forgot Clock In Payload:", payload);
      const res = await api.post("/request/clock/date", payload);
      setLoading(false);
    showToast("Clock-in adjustment request submitted!", "success");
      setShowForgotModal(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      showToast("Failed to submit request.", "danger");
    }
  };

  // ----------------- HANDLE DTR ADJUSTMENT SUBMISSION -----------------
  const handleSubmitAdjustment = async () => {
    try {
      const recordDate = new Date(selectedRecord.clock_in)
        .toISOString()
        .split("T")[0];

      const payload = {
        adjusted_clock_in: adjustmentForm.adjustedClockIn
          ? `${recordDate}T${adjustmentForm.adjustedClockIn}:00Z`
          : null,
        adjusted_clock_out: adjustmentForm.adjustedClockOut
          ? `${recordDate}T${adjustmentForm.adjustedClockOut}:00Z`
          : null,
        reason: adjustmentForm.reason,
      };

      await api.post(`/request/adjustment/${selectedRecord.id}`, payload);
      showToast("Attendance adjustment submitted successfully!", "success");
      handleCloseAdjustModal();
      await fetchMyAttendance();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error submitting adjustment request.",
        "danger",
      );
      handleCloseAdjustModal();
    }
  };

  // ----------------- UI DERIVED STATES -----------------
  const formattedDate = currentDateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = currentDateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const badgeText = summary.isClockedIn ? "Checked In" : "Not Checked In";
  const badgeVariant = summary.isClockedIn ? "success" : "secondary";
  const statusText = summary.isClockedIn ? "On Duty" : "Off Duty";

  const isClockOutDisabled =
    summary.isClockedIn &&
    liveHoursToday >= 15 &&
    !autoClockOutTriggered.current;

  const formatHoursWorked = function (hours) {
    const totalHours = parseFloat(hours);

    if (isNaN(totalHours)) return "--";

    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);

    return `${h}h ${m}m`;
  };

  // Filter recent attendance for selected month (used in Present & Absent tab)
  const filteredAttendance = useMemo(() => {
    return summary.recentAttendance.filter((record) => {
      if (!record.clock_in) return false;
      const date = new Date(record.clock_in);
      return (
        date.getMonth() + 1 === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  }, [summary.recentAttendance, selectedMonth, selectedYear]);

  // Fetch absences when Present & Absent tab is active and month/year changes
  useEffect(() => {
    if (isAuth && activeTab === "presentAbsent") {
      fetchMonthlyAbsences(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, activeTab, isAuth]);

  // ----------------- INITIAL LOADING -----------------
  if (isInitialLoading) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="profile-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading attendance...</span>
          </div>
          <p>Loading attendance information...</p>
        </div>
      </AdminLayout>
    );
  }
  const popover = (
    <Popover id="popover-help">
      <Popover.Body>
        This request is for the current day only. If you forgot to clock in, you
        can request to adjust your clock-in time for today. Please provide a
        reason for the adjustment.
      </Popover.Body>
    </Popover>
  );

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="attendance-container">
        {/* HEADER */}
        <div className="attendance-header">
          <h2 className="attendance-title fw-bold">Attendance</h2>
        </div>
        <div className="align-items-center justify-content-start d-flex flex-wrap gap-3 mb-4">
          <Button
            size="sm"
            className="px-3"
            variant={
              activeTab === "overview" ? "secondary" : "outline-secondary"
            }
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Button>
          <Button
            size="sm"
            className="px-3"
            variant={
              activeTab === "presentAbsent" ? "secondary" : "outline-secondary"
            }
            onClick={() => setActiveTab("presentAbsent")}
          >
            Present & Absent
          </Button>
        </div>

        {/* OVERVIEW TAB CONTENT */}
        {activeTab === "overview" && (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-0 attendance-date">{formattedDate}</h5>
                <p className="attendance-time text-muted">{formattedTime}</p>
              </div>
              {loadingSummary ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Badge
                  bg={badgeVariant}
                  className="px-3 py-2 mt-2 mt-sm-0"
                  style={{ fontSize: "1.1rem" }}
                >
                  {badgeText}
                </Badge>
              )}
            </div>

            <Card className="shadow-sm border-0 rounded-4 mb-4">
              <Card.Body className="p-3 p-md-4">
                {loadingSummary ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-uppercase text-muted">
                          CLOCK IN TIME
                        </small>
                        <h3 className="fw-bold">
                          {summary.clockInTime || "---"}
                        </h3>
                      </div>
                      <div>
                        <small className="text-uppercase text-muted">
                          HOURS TODAY
                        </small>
                        <h3 className="fw-bold">
                          {liveHoursToday.toFixed(2)} hrs
                        </h3>
                      </div>
                    </Col>
                    <Col md={1} className="d-none d-md-block text-center">
                      <div
                        style={{
                          width: 2,
                          height: 80,
                          background: "#dee2e6",
                          margin: "auto",
                        }}
                      />
                    </Col>
                    <Col md={5} className="text-md-end mt-4 mt-md-0">
                      <div className="mb-3">
                        <small className="text-uppercase text-muted">
                          STATUS
                        </small>
                        <h3 className="fw-bold">{statusText}</h3>
                      </div>
                      <div className="d-flex gap-2 justify-content-md-end">
                        <Button
                          variant="success"
                          size="sm"
                          className=" px-3"
                          onClick={handleClockIn}
                          disabled={
                            summary.isClockedIn ||
                            loadingSummary ||
                            loadingIn ||
                            loadingOut
                          }
                        >
                          {loadingIn ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Clocking In...
                            </>
                          ) : (
                            <>
                              <Clock className="me-2" size={18} />
                              Clock In
                            </>
                          )}
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          className=" px-3"
                          onClick={() => {
                            setShowReportModal(true);
                            setCcEmails("");
                            setReportBody("");
                          }}
                          disabled={
                            !summary.isClockedIn ||
                            loadingSummary ||
                            isClockOutDisabled ||
                            loadingIn ||
                            loadingOut
                          }
                          title={
                            !summary.isClockedIn
                              ? "You are not clocked in"
                              : isClockOutDisabled
                                ? "Maximum work duration of 15 hours exceeded"
                                : ""
                          }
                        >
                          {loadingOut ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Clocking Out...
                            </>
                          ) : (
                            <>
                              <DoorOpen className="me-2" size={18} />
                              Clock Out
                            </>
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            <Row className="g-4 mb-5">
              <Col xs={12} sm={6} md={4}>
                <Card className="text-center border-0 shadow-sm rounded-4">
                  <Card.Body>
                    <h6 className="text-muted">THIS WEEK</h6>
                    <h2 className="fw-bold">
                      {loadingSummary ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        `${summary.weekHours.toFixed(2)} hrs`
                      )}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Card className="text-center border-0 shadow-sm rounded-4">
                  <Card.Body>
                    <h6 className="text-muted">THIS MONTH</h6>
                    <h2 className="fw-bold">
                      {loadingSummary ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        `${summary.monthHours.toFixed(2)} hrs`
                      )}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Card className="text-center border-0 shadow-sm rounded-4">
                  <Card.Body>
                    <h6 className="text-muted">ATTENDANCE</h6>
                    <h2 className="fw-bold">
                      {loadingSummary ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        `${summary.attendanceDays} days`
                      )}
                    </h2>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {!loadingSummary && summary.recentAttendance.length > 0 && (
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="fw-bold mb-1">Recent Attendance</h4>
                      <p className="text-muted mb-0">
                        Your recent attendance records
                      </p>
                    </div>
                    <div>
                      <Link onClick={() => setShowDropdown(!showDropdown)}>
                        <ThreeDots className="text-secondary" />
                      </Link>
                      <Dropdown
                        show={showDropdown}
                        onClick={() => setShowDropdown(false)}
                      >
                        <Dropdown.Toggle
                          as="div"
                          className="text-secondary absent-dropdown-toggle"
                        ></Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item>Request to clock in</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <Table
                      hover
                      responsive
                      borderless
                      striped
                      className="align-middle mb-0"
                    >
                      <thead className="bg-light">
                        <tr>
                          <th>Date</th>
                          <th>Att. Status</th>
                          <th>Adj. Status</th>
                          <th>Time</th>
                          <th>Hours</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.recentAttendance.map((record, index) => (
                          <tr key={record.id || index}>
                            <td className="fw-medium">
                              {formatDate(record.clock_in)}
                            </td>
                            <td>
                              {record.status === "Present" ? (
                                <Badge bg="success" className="px-3 py-2">
                                  Present
                                </Badge>
                              ) : record.status === "Pending" ? (
                                <Badge bg="warning" className="px-3 py-2">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge bg="danger" className="px-3 py-2">
                                  Absent
                                </Badge>
                              )}
                            </td>
                            <td>
                              {record.adjustment_status === "approved" ? (
                                <Badge bg="success" className="px-3 py-2">
                                  Approved
                                </Badge>
                              ) : record.adjustment_status === "pending" ? (
                                <Badge bg="warning" className="px-3 py-2">
                                  Pending
                                </Badge>
                              ) : (
                                <Badge bg="secondary" className="px-3 py-2">
                                  No Adjustment Set
                                </Badge>
                              )}
                            </td>
                            <td>
                              {formatTimeRange(
                                record.clock_in,
                                record.clock_out,
                              )}
                            </td>
                            <td>{formatHoursWorked(record.hours_worked)}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="px-3"
                                onClick={() => handleOpenAdjustModal(record)}
                              >
                                Adjust
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {!loadingSummary && summary.recentAttendance.length === 0 && (
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-5 text-center">
                  <p className="text-muted mb-0">
                    No recent attendance records found.
                  </p>
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {/* ========== MODERN REDESIGNED PRESENT & ABSENT TAB ========== */}
        {activeTab === "presentAbsent" && (
          <div className="present-absent-wrapper">
            {/* Filter Section with Request Button */}
            <Card className="border-0 shadow-sm rounded-4 mb-4  bg-gradient">
              <Card.Body className="p-4">
                <Row className="align-items-end g-3">
                  <Col xs={12} md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted small text-uppercase">
                        <CalendarDate className="me-1" /> Month
                      </Form.Label>
                      <Form.Select
                        value={selectedMonth}
                        onChange={(e) =>
                          setSelectedMonth(parseInt(e.target.value))
                        }
                        className="rounded-3 border-0 shadow-sm"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (m) => (
                            <option key={m} value={m}>
                              {new Date(2000, m - 1, 1).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                },
                              )}
                            </option>
                          ),
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={3}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted small text-uppercase">
                        <ClockHistory className="me-1" /> Year
                      </Form.Label>
                      <Form.Select
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(parseInt(e.target.value))
                        }
                        className="rounded-3 border-0 shadow-sm"
                      >
                        {Array.from(
                          { length: 5 },
                          (_, i) => new Date().getFullYear() - 2 + i,
                        ).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} className="d-flex justify-content-md-end">
                    <div className="d-flex align-items-center">
                      <OverlayTrigger
                        trigger={["hover", "focus"]}
                        placement="left"
                        overlay={popover}
                      >
                        <span className="d-inline-flex">
                          <QuestionCircle
                            className="text-muted me-2"
                            size={18}
                            style={{ cursor: "pointer" }}
                          />
                        </span>
                      </OverlayTrigger>

                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-3 px-3 shadow-sm"
                        onClick={() => {
                          setSelectedRecord(null);
                          setForgotClockInForm({
                            adjustedClockDate: "",
                            adjustedClockIn: "",
                            adjustedClockOut: "",
                            reason: "",
                          });
                          setShowForgotModal(true);
                        }}
                      >
                        <PersonBadge className="me-2" size={20} />
                        Request Clock In
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Summary Stats */}
            <Row className="g-3 mb-4">
              <Col xs={6} md={3}>
                <Card className="border-0 shadow-sm rounded-4 text-center  bg-opacity-10">
                  <Card.Body className="py-3">
                    <h6 className="text-muted small text-uppercase">Month</h6>
                    <h5 className="fw-bold mb-0">
                      {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                        "default",
                        {
                          month: "short",
                        },
                      )}{" "}
                      {selectedYear}
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="border-0 shadow-sm rounded-4 text-center  bg-opacity-10">
                  <Card.Body className="py-3">
                    <h6 className="text-muted small text-uppercase">Present</h6>
                    <h5 className="fw-bold mb-0 ">
                      {filteredAttendance.length} days
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="border-0 shadow-sm rounded-4 text-center bg-opacity-10">
                  <Card.Body className="py-3">
                    <h6 className="text-muted small text-uppercase">Absent</h6>
                    <h5 className="fw-bold mb-0 ">{absentDates.length} days</h5>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="border-0 shadow-sm rounded-4 text-center bg-opacity-10">
                  <Card.Body className="py-3">
                    <h6 className="text-muted small text-uppercase">Total</h6>
                    <h5 className="fw-bold mb-0">
                      {filteredAttendance.length + absentDates.length} days
                    </h5>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Present & Absent Tables */}
            <Row className="g-4">
              {/* Present Days */}
              <Col xs={12} md={12}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0">Present Days</h5>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {loadingPresentAbsent ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : filteredAttendance.length > 0 ? (
                      <div className="table-responsive">
                        <Table
                          borderless
                          hover
                          striped
                          className="align-middle mb-0"
                        >
                          <thead className="text-muted small">
                            <tr>
                              <th>Date</th>
                              <th>Clock In</th>
                              <th>Clock Out</th>
                              <th>Hours</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAttendance.map((record, idx) => (
                              <tr key={record.id || idx}>
                                <td className="fw-medium">
                                  {new Date(record.clock_in).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </td>
                                <td>
                                  <Clock
                                    size={14}
                                    className="text-muted me-1"
                                  />
                                  {formatTime(record.clock_in)}
                                </td>
                                <td>
                                  {record.clock_out ? (
                                    <>
                                      <DoorOpen
                                        size={14}
                                        className="text-muted me-1"
                                      />
                                      {formatTime(record.clock_out)}
                                    </>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td>{formatHours(record.hours_worked)}h</td>
                                <td>
                                  {record.clock_out === null && (
                                    <Badge
                                      bg="secondary"
                                      className=" px-3 py-2 rounded"
                                    >
                                      On Duty
                                    </Badge>
                                  )}
                                  {record.clock_out !== null && (
                                    <Badge
                                      bg={
                                        record.status === "Present"
                                          ? "success"
                                          : record.status === "Missed"
                                            ? "info"
                                            : "danger"
                                      }
                                      className="px-3 py-2 rounded"
                                    >
                                      {record.status}
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">
                        <p className="mb-0">
                          No present records for this month
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Absent Days */}
              <Col xs={12} md={12}>
                <Card className="border-0 shadow-sm rounded-4 h-100">
                  <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0">Absent Days</h5>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {loadingPresentAbsent ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : absentDates.length > 0 ? (
                      <div className="table-responsive">
                        <Table borderless hover className="align-middle mb-0">
                          <thead className="text-muted small">
                            <tr>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {absentDates.map((date, idx) => (
                              <tr key={idx}>
                                <td className="fw-medium">
                                  {new Date(date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </td>
                                <td>
                                  <Badge
                                    bg="danger"
                                    className="px-3 py-2 rounded"
                                  >
                                    Absent
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">
                        <p className="mb-0">No absences for this month 🎉</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* REPORT MODAL (Clock Out) */}
        <Modal
          show={showReportModal}
          onHide={() => {
            setShowReportModal(false);
            setCcEmails("");
            setReportSubject("");
            setReportBody("");
          }}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Daily Report (Clock Out)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <InputGroup className="mb-3">
                <InputGroup.Text id="to-addon">TO</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="hello@snlvirtualpartner.com"
                  readOnly
                  disabled
                  aria-label="TO"
                  aria-describedby="to-addon"
                />
              </InputGroup>

              <InputGroup className="mb-3">
                <InputGroup.Text id="cc-addon">CC</InputGroup.Text>
                <Form.Control
                  type="email"
                  multiple
                  value={ccEmails}
                  onChange={(e) => setCcEmails(e.target.value)}
                  placeholder="Enter email addresses separated by commas"
                  aria-label="CC"
                  aria-describedby="cc-addon"
                />
              </InputGroup>
              <Form.Text className="text-muted mb-3 d-block">
                Separate multiple emails with commas.
              </Form.Text>

              <InputGroup className="mb-3">
                <InputGroup.Text id="subject-addon">Subject</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Daily report"
                  value={reportSubject}
                  onChange={(e) => setReportSubject(e.target.value)}
                  aria-label="Subject"
                  aria-describedby="subject-addon"
                />
              </InputGroup>

              <RichTextEditor value={reportBody} onChange={setReportBody} />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              size="sm"
              className="px-3"
              onClick={() => {
                setShowReportModal(false);
                setCcEmails("");
                setReportSubject("");
                setReportBody("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="px-3"
              onClick={handleReportSubmit}
            >
              Submit & Clock Out
            </Button>
          </Modal.Footer>
        </Modal>

        {/* DTR ADJUSTMENT MODAL */}
        <Modal
          show={showAdjustModal}
          onHide={handleCloseAdjustModal}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Request DTR Adjustment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRecord && (
              <>
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Original Times</h6>
                  <Row>
                    <Col md={6}>
                      <div>
                        <small className="text-muted">Clock In</small>
                        <div className="d-flex align-items-center gap-2">
                          <Clock size={18} className="text-primary" />
                          <strong>{formatTime(selectedRecord.clock_in)}</strong>
                        </div>
                        <small className="text-muted">
                          {new Date(selectedRecord.clock_in).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </small>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div>
                        <small className="text-muted">Clock Out</small>
                        <div className="d-flex align-items-center gap-2">
                          <DoorOpen size={18} className="text-primary" />
                          <strong>
                            {selectedRecord.clock_out
                              ? formatTime(selectedRecord.clock_out)
                              : "Not clocked out"}
                          </strong>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                <hr />

                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Adjusted Times</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Adjusted Clock In
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="adjustedClockIn"
                      value={adjustmentForm.adjustedClockIn}
                      onChange={handleAdjustmentFormChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Adjusted Clock Out
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="adjustedClockOut"
                      value={adjustmentForm.adjustedClockOut}
                      onChange={handleAdjustmentFormChange}
                    />
                  </Form.Group>
                  <small className="text-warning d-block mb-3">
                    <Lightbulb size={16} className="me-1" />
                    Use the time inputs above to adjust your times
                  </small>
                </div>

                <div className="mb-4">
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      Reason for Adjustment
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="reason"
                      placeholder="Please explain why you need this adjustment..."
                      value={adjustmentForm.reason}
                      onChange={handleAdjustmentFormChange}
                    />
                  </Form.Group>
                </div>

                <div className="alert alert-info d-flex gap-2 mb-0">
                  <span>💡</span>
                  <span>
                    Your adjustment request will be reviewed and approved by
                    your supervisor. You'll be notified once it's processed.
                  </span>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              className="px-3"
              variant="outline-secondary"
              onClick={handleCloseAdjustModal}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="px-3"
              onClick={handleSubmitAdjustment}
            >
              Submit Request
            </Button>
          </Modal.Footer>
        </Modal>

        {/* FORGOT CLOCK IN REQUEST MODAL */}
        <Modal
          show={showForgotModal}
          onHide={handleCloseForgotClockInModal}
          centered
          size="md"
        >
          <Modal.Header closeButton>
            <Modal.Title>Forgot Clock‑In Request</Modal.Title>
          </Modal.Header>

          <Modal.Body className="pt-2">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Date</Form.Label>
                <Form.Select
                  name="adjustedClockDate"
                  value={forgotClockInForm.adjustedClockDate}
                  onChange={handleForgotFormChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select absent date</option>

                  {absentDates.map((date, index) => (
                    <option key={index} value={date}>
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Clock In Time
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="adjustedClockIn"
                      value={forgotClockInForm.adjustedClockIn}
                      onChange={handleForgotFormChange}
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Clock Out Time
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="adjustedClockOut"
                      value={forgotClockInForm.adjustedClockOut}
                      onChange={handleForgotFormChange}
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Reason for Request
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="reason"
                  placeholder="Explain why you forgot to clock in..."
                  value={forgotClockInForm.reason}
                  onChange={handleForgotFormChange}
                  disabled={loading}
                />
              </Form.Group>
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              size="sm"
              className="px-3"
              onClick={handleCloseForgotClockInModal}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              className="px-3"
              size="sm"
              onClick={handleSubmitForgotClockInRequest}
              disabled={loading}
            >
               {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting request...
                </>
              ) : (
                "Submit Request"
              )}
              
            </Button>
          </Modal.Footer>
        </Modal>

        {/* TOASTS */}
        <ToastContainer
          className="p-3"
          position="top-end"
          style={{ zIndex: 9999 }}
        >
          {toasts.map((t) => (
            <Toast
              key={t.id}
              onClose={() => removeToast(t.id)}
              delay={6000}
              autohide
              className={
              t.type === "success"
                ? "glb-toast-success"
                : "glb-toast-danger"
            }
            >
              <Toast.Body>{t.message}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>
      </Container>
    </AdminLayout>
  );
};

export default Attendance;
