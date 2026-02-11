import React, { useState, useEffect, useRef,u } from "react";
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
} from "react-bootstrap";
import AdminLayout from "../../components/layout/Adminlayout";
import * as faceapi from "face-api.js";
import api from "../../config/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Clock, DoorOpen, Lightbulb } from "react-bootstrap-icons"; 
import { useNavigate } from "react-router-dom";

const Attendance = ({ setIsAuth }) => {
  const { isAuth } = useAuth();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  const detectionInterval = useRef(null);
  const captureTimeout = useRef(null);

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceAligned, setFaceAligned] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

  // ---------- Attendance summary state ----------
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
  const [loadingSummary, setLoadingSummary] = useState(true);

  // ---------- DTR Adjustment Modal ----------
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustedClockIn: "",
    adjustedClockOut: "",
    reason: "",
  });

  // ---------- Live clock ----------
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  /* ========================
     LOAD FACE-API MODELS
  ======================== */
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/snl-hr-app/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setLoadingModels(false);
    };
    loadModels();
  }, []);

  /* ========================
     FETCH ATTENDANCE DATA (uses your actual endpoint)
  ======================== */
  const fetchMyAttendance = async () => {
  try {
    setLoadingSummary(true);
    const response = await api.get("/my-attendance");
    const data = response.data;

    if (data.isSuccess) {
      let clockInTime = null;
      let hoursToday = 0;
      let isClockedIn = false;

      if (data.todayRecord) {
        if (data.todayRecord.clock_in) {
          const date = new Date(data.todayRecord.clock_in);
          clockInTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
        hoursToday = parseFloat(data.todayRecord.hours_worked) || 0;
        isClockedIn = data.todayRecord.clock_in && !data.todayRecord.clock_out;
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
    }
  } catch (error) {
    showToast("Failed to load attendance summary", "danger");
  } finally {
    setLoadingSummary(false);
    setIsInitialLoading(false);
  }
};

//Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuth) {
      if (setIsAuth) setIsAuth(false);
      navigate("/snl-hr-app");
      return;
    }
  }, [isAuth, navigate]);

  // Initial fetch
  useEffect(() => {
    if (isAuth) {
      fetchMyAttendance();
    }
  }, [isAuth]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ========================
     CAMERA & FACE DETECTION
  ======================== */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraStream(stream);
      videoRef.current.onloadedmetadata = () => startDetection();
    } catch (err) {
      showToast("Camera access denied", "danger");
    }
  };

  const stopCamera = () => {
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    if (captureTimeout.current) clearTimeout(captureTimeout.current);
  };

  const drawGuide = () => {
    const canvas = overlayRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 3;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusX = canvas.width * 0.25;
    const radiusY = canvas.height * 0.35;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const startDetection = () => {
    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || isProcessing) return;
      drawGuide();
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );
      if (detection) {
        const box = detection.box;
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        const centerX = videoWidth / 2;
        const centerY = videoHeight / 2;
        const faceCenterX = box.x + box.width / 2;
        const faceCenterY = box.y + box.height / 2;
        const withinX = Math.abs(faceCenterX - centerX) < videoWidth * 0.15;
        const withinY = Math.abs(faceCenterY - centerY) < videoHeight * 0.2;

        if (withinX && withinY) {
          setFaceAligned(true);
          if (!captureTimeout.current) {
            captureTimeout.current = setTimeout(() => {
              autoCaptureAndSubmit();
            }, 1500);
          }
        } else {
          setFaceAligned(false);
          if (captureTimeout.current) {
            clearTimeout(captureTimeout.current);
            captureTimeout.current = null;
          }
        }
      } else {
        setFaceAligned(false);
      }
    }, 500);
  };

  const autoCaptureAndSubmit = async () => {
    try {
      setIsProcessing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const file = new File([ab], "face.jpg", { type: mimeString });
      const formData = new FormData();
      formData.append("face_image", file);

      const endpoint = summary.isClockedIn ? "/attendance/clock-out" : "/attendance/clock-in";
      await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast(summary.isClockedIn ? "Clocked Out Successfully!" : "Clocked In Successfully!");
      stopCamera();
      setShowFaceModal(false);
      await fetchMyAttendance(); // refresh
    } catch (error) {
      showToast(error.response?.data?.message || "Verification failed", "danger");
    } finally {
      setIsProcessing(false);
      captureTimeout.current = null;
    }
  };

  /* ========================
     TOAST SYSTEM
  ======================== */
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /* ========================
     FORMATTING HELPERS
  ======================== */
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

  /* ========================
     DTR ADJUSTMENT MODAL HANDLERS
  ======================== */
  const handleOpenAdjustModal = (record) => {
    setSelectedRecord(record);
    setAdjustmentForm({
      adjustedClockIn: record.clock_in ? formatTimeForInput(record.clock_in) : "",
      adjustedClockOut: record.clock_out ? formatTimeForInput(record.clock_out) : "",
      reason: "",
    });
    setShowAdjustModal(true);
  };

  const handleCloseAdjustModal = () => {
    setShowAdjustModal(false);
    setSelectedRecord(null);
    setAdjustmentForm({ adjustedClockIn: "", adjustedClockOut: "", reason: "" });
  };

  const handleAdjustmentFormChange = (e) => {
    const { name, value } = e.target;
    setAdjustmentForm((prev) => ({ ...prev, [name]: value }));
  };

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
      await fetchMyAttendance(); // refresh recent records
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error submitting adjustment request.",
        "danger"
      );
      handleCloseAdjustModal();
    }
  };

  // ---------- Derived UI state ----------
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
  const buttonVariant = summary.isClockedIn ? "danger" : "primary";
  const buttonText = summary.isClockedIn ? "Clock Out" : "Clock In";

  
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

  return (
    <AdminLayout setIsAuth={isAuth}>
      <Container fluid className="attendance-container">
          {/* Header */}
        <div className="attendance-header">
          <h2 className="attendance-title fw-bold">Attendance</h2>
        </div>
        {/* ---------- HEADER (Date/Time + Badge) ---------- */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="mb-0 text-muted attendance-date">{formattedDate}</h4>
            <h5 className="fw-bold attendance-time">{formattedTime}</h5>
          </div>
          {loadingSummary ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Badge
              bg={badgeVariant}
              className="px-4 py-2"
              style={{ fontSize: "1.1rem" }}
            >
              {badgeText}
            </Badge>
          )}
        </div>

        {/* ---------- MAIN ATTENDANCE CARD ---------- */}
        <Card className="shadow-sm border-0 rounded-4 mb-4">
          <Card.Body className="p-4">
            {loadingSummary ? (
              <div className="text-center py-4">
                <Spinner animation="border" />
              </div>
            ) : (
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="mb-3">
                    <small className="text-uppercase text-muted">CLOCK IN TIME</small>
                    <h3 className="fw-bold">{summary.clockInTime || "---"}</h3>
                  </div>
                  <div>
                    <small className="text-uppercase text-muted">HOURS TODAY</small>
                    <h3 className="fw-bold">{summary.hoursToday.toFixed(2)} hrs</h3>
                  </div>
                </Col>
                <Col md={1} className="d-none d-md-block text-center">
                  <div style={{ width: 2, height: 80, background: "#dee2e6", margin: "auto" }} />
                </Col>
                <Col md={5} className="text-md-end mt-4 mt-md-0">
                  <div className="mb-3">
                    <small className="text-uppercase text-muted">STATUS</small>
                    <h3 className="fw-bold">{statusText}</h3>
                  </div>
                  <Button
                    variant={buttonVariant}
                    size="lg"
                    className="px-5 py-3 rounded-3"
                    onClick={() => {
                      setShowFaceModal(true);
                      setTimeout(startCamera, 500);
                    }}
                    disabled={loadingSummary}
                  >
                    {buttonText}
                  </Button>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* ---------- SUMMARY CARDS (THIS WEEK / MONTH / ATTENDANCE / ON TIME) ---------- */}
        <Row className="g-4 mb-5">
          <Col sm={6} md={3}>
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
          <Col sm={6} md={3}>
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
          <Col sm={6} md={3}>
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
          <Col sm={6} md={3}>
            <Card className="text-center border-0 shadow-sm rounded-4">
              <Card.Body>
                <h6 className="text-muted">ON TIME</h6>
                <h2 className="fw-bold">
                  {loadingSummary ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    `${summary.onTimeRate}%`
                  )}
                </h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ---------- RECENT ATTENDANCE TABLE ---------- */}
        {!loadingSummary && summary.recentAttendance.length > 0 && (
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold mb-1">Recent Attendance</h4>
                  <p className="text-muted mb-0">Your recent attendance records</p>
                </div>
              </div>

              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th>TIME</th>
                      <th>HOURS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentAttendance.map((record, index) => (
                      <tr key={record.id || index}>
                        <td className="fw-medium">{formatDate(record.clock_in)}</td>
                        <td>
                          <Badge bg="success" pill className="px-3 py-2">
                            Present
                          </Badge>
                        </td>
                        <td>{formatTimeRange(record.clock_in, record.clock_out)}</td>
                        <td>{formatHours(record.hours_worked)} hrs</td>
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

        {/* ---------- EMPTY STATE ---------- */}
        {!loadingSummary && summary.recentAttendance.length === 0 && (
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-5 text-center">
              <p className="text-muted mb-0">No recent attendance records found.</p>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* ---------- DTR ADJUSTMENT MODAL ---------- */}
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
              {/* Original Times */}
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
                        {new Date(selectedRecord.clock_in).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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

              {/* Adjusted Times */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">Adjusted Times</h6>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Adjusted Clock In</Form.Label>
                  <Form.Control
                    type="time"
                    name="adjustedClockIn"
                    value={adjustmentForm.adjustedClockIn}
                    onChange={handleAdjustmentFormChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Adjusted Clock Out</Form.Label>
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

              {/* Reason for Adjustment */}
              <div className="mb-4">
                <Form.Group>
                  <Form.Label className="fw-bold">Reason for Adjustment</Form.Label>
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

              {/* Info Message */}
              <div className="alert alert-info d-flex gap-2 mb-0">
                <span>💡</span>
                <span>
                  Your adjustment request will be reviewed and approved by your
                  supervisor. You'll be notified once it's processed.
                </span>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseAdjustModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitAdjustment}>
            Submit Request
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---------- FACE VERIFICATION MODAL (unchanged) ---------- */}
      <Modal
        show={showFaceModal}
        onHide={() => {
          setShowFaceModal(false);
          stopCamera();
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Align your face inside the guide</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {loadingModels ? (
            <Spinner animation="border" />
          ) : (
            <div style={{ position: "relative" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "100%", borderRadius: 10 }}
              />
              <canvas
                ref={overlayRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
              <div className="mt-3">
                {isProcessing ? (
                  <Badge bg="warning">Processing...</Badge>
                ) : (
                  <Badge bg={faceAligned ? "success" : "danger"}>
                    {faceAligned
                      ? "Face Aligned - Capturing..."
                      : "Center your face inside the oval"}
                  </Badge>
                )}
              </div>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </Modal.Body>
      </Modal>

      {/* ---------- TOAST NOTIFICATIONS ---------- */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg={toast.type}
            show={true}
            onClose={() => removeToast(toast.id)}
            delay={4000}
            autohide
          >
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </AdminLayout>
  );
};

export default Attendance;