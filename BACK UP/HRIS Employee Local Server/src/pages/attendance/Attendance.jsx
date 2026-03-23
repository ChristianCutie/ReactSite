import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Container,
  Button,
  Toast,
  ToastContainer,
  Popover,
  Row,
} from "react-bootstrap";
import AdminLayout from "@/components/layout/Adminlayout";
import api from "@/config/axios.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { ClockHistory, PersonBadge, Download } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import OverviewTab from "@/pages/attendance/tabs/OverviewTab.jsx";
import PresentAbsentTab from "@/pages/attendance/tabs/PresentAbsentTab.jsx";
import DRTAdjustmentModal from "@/pages/attendance/components/modals/DRTAdjustmentModal.jsx";
import ReportClockOutModal from "@/pages/attendance/components/modals/ReportClockOutModal.jsx";
import ForgotClockInModal from "@/pages/attendance/components/modals/ForgotClockInModal.jsx";
import ExportTab from "@/pages/attendance/tabs/ExportTab.jsx";
import "@/pages/attendance/Attendance.css";
import "@/assets/style/global.css";

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
  const [presentRecords, setPresentRecords] = useState([]);
  const [absentDates, setAbsentDates] = useState([]);
  const [loadingPresentAbsent, setLoadingPresentAbsent] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  //Export Tab

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loadingExport, setLoadingExport] = useState(false);
  const [status, setStatus] = useState("");

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

  // ---------- FETCH PRESENT RECORDS FOR SELECTED MONTH ----------
  const fetchMonthlyPresent = async (month, year) => {
    setLoadingPresentAbsent(true);
    try {
      const response = await api.get("/my-attendance", {
        params: { month, year },
      });
      if (response.data && response.data.attendance) {
        setPresentRecords(response.data.attendance);
      } else if (response.data && response.data.recentAttendance) {
        const filtered = response.data.recentAttendance.filter((record) => {
          if (!record.clock_in) return false;
          const date = new Date(record.clock_in);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
        setPresentRecords(filtered);
      } else {
        setPresentRecords([]);
      }
    } catch (error) {
      console.error("Error loading present records:", error);
      setPresentRecords([]);
      showToast("Error loading attendance records: " + error.message, "danger");
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

  // ----------------- EXOPORT TO EXCEL -----------------

  const handleExport = async () => {
    try {
      setLoadingExport(true);

      const params = {
        month,
        year,
        status,
      };

      const response = await api.get("/my-attendance/export", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      const fileName = `my_attendance_${year}_${month}.csv`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showToast("Export successfully downloaded", "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast(
        error.response?.data?.message || "Failed to export attendance.",
        "danger",
      );
    } finally {
      setLoadingExport(false);
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

  const tabs = [
    { key: "overview", label: "Overview", icon: <ClockHistory /> },
    { key: "presentAbsent", label: "Present & Absent", icon: <PersonBadge /> },
    { key: "export", label: "Export", icon: <Download /> },
  ];

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

  // Filter attendance for selected month - use presentRecords from state
  const filteredAttendance = useMemo(() => {
    return presentRecords || [];
  }, [presentRecords]);

  // Fetch both present records and absences when Present & Absent tab is active and month/year changes
  useEffect(() => {
    if (isAuth && activeTab === "presentAbsent") {
      fetchMonthlyPresent(selectedMonth, selectedYear);
      fetchMonthlyAbsences(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear, activeTab, isAuth]);

  // ----------------- INITIAL LOADING -----------------
  if (isInitialLoading) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="loadingScreen">
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

  const clearFilters = () => {
    setMonth("");
    setYear("");
  };

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="glb-container">
        <Row className="mb-4">
          {/* HEADER */}
          <div className="attendance-header">
            <h2 className="attendance-title fw-bold">Attendance</h2>
          </div>
          <div className="align-items-center justify-content-start d-flex flex-wrap gap-3 mb-4">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                size="sm"
                className="px-3"
                variant={
                  activeTab === tab.key ? "secondary" : "outline-secondary"
                }
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <span className="ms-2">{tab.label}</span>
              </Button>
            ))}
          </div>
        </Row>

        {/* OVERVIEW TAB CONTENT */}
        {activeTab === "overview" && (
          <OverviewTab
            formattedDate={formattedDate}
            formattedTime={formattedTime}
            loadingSummary={loadingSummary}
            badgeVariant={badgeVariant}
            badgeText={badgeText}
            summary={summary}
            liveHoursToday={liveHoursToday}
            statusText={statusText}
            handleClockIn={handleClockIn}
            handleOpenAdjustModal={handleOpenAdjustModal}
            setShowReportModal={setShowReportModal}
            loadingIn={loadingIn}
            loadingOut={loadingOut}
            isClockOutDisabled={isClockOutDisabled}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            formatDate={formatDate}
            formatTimeRange={formatTimeRange}
            formatHoursWorked={formatHoursWorked}
          />
        )}

        {/* ========== MODERN REDESIGNED PRESENT & ABSENT TAB ========== */}
        {activeTab === "presentAbsent" && (
          <PresentAbsentTab
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            filteredAttendance={filteredAttendance}
            absentDates={absentDates}
            loadingPresentAbsent={loadingPresentAbsent}
            formatTime={formatTime}
            formatHours={formatHours}
            setShowForgotModal={setShowForgotModal}
            setForgotClockInForm={setForgotClockInForm}
            popover={popover}
          />
        )}

        {/* EXPORT TAB CONTENT */}
        {activeTab === "export" && (
          <ExportTab
            handleExport={handleExport}
            loadingExport={loadingExport}
            clearFilters={clearFilters}
            month={month}
            year={year}
            setMonth={setMonth}
            setYear={setYear}
            setStatus={setStatus}
          />
        )}

        {/* REPORT MODAL (Clock Out) */}
        <ReportClockOutModal
          show={showReportModal}
          setShowReportModal={setShowReportModal}
          ccEmails={ccEmails}
          setCcEmails={setCcEmails}
          reportSubject={reportSubject}
          setReportSubject={setReportSubject}
          reportBody={reportBody}
          setReportBody={setReportBody}
          handleReportSubmit={handleReportSubmit}
        />

        {/* DTR ADJUSTMENT MODAL */}
        <DRTAdjustmentModal
          show={showAdjustModal}
          handleClose={handleCloseAdjustModal}
          selectedRecord={selectedRecord}
          adjustmentForm={adjustmentForm}
          handleAdjustmentFormChange={handleAdjustmentFormChange}
          handleSubmitAdjustment={handleSubmitAdjustment}
          formatTime={formatTime}
        />

        {/* FORGOT CLOCK IN REQUEST MODAL */}
        <ForgotClockInModal
          show={showForgotModal}
          handleCloseForgotClockInModal={handleCloseForgotClockInModal}
          forgotClockInForm={forgotClockInForm}
          handleForgotFormChange={handleForgotFormChange}
          handleSubmitForgotClockInRequest={handleSubmitForgotClockInRequest}
          absentDates={absentDates}
          loading={loading}
        />

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
                t.type === "success" ? "glb-toast-success" : "glb-toast-danger"
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
