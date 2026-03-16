import React from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Spinner,
  Badge,
  Form,
  Button,
  OverlayTrigger,
} from "react-bootstrap";
import {
  CalendarDate,
  ClockHistory,
  PersonBadge,
  QuestionCircle,
  Clock,
  DoorOpen,
} from "react-bootstrap-icons";

const PresentAbsentTab = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  filteredAttendance,
  absentDates,
  loadingPresentAbsent,
  formatTime,
  formatHours,
  setShowForgotModal,
  setForgotClockInForm,
  popover,
}) => {
  return (
    <div className="present-absent-wrapper">
      {/* FILTER SECTION */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-gradient">
        <Card.Body className="p-4">
          <Row className="align-items-end g-3">
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold text-muted small text-uppercase">
                  <CalendarDate className="me-1" /> Month
                </Form.Label>

                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-3 border-0 shadow-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
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
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
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

      {/* SUMMARY STATS */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center">
            <Card.Body className="py-3">
              <h6 className="text-muted small text-uppercase">Month</h6>
              <h5 className="fw-bold mb-0">
                {new Date(2000, selectedMonth - 1, 1).toLocaleString(
                  "default",
                  { month: "short" },
                )}{" "}
                {selectedYear}
              </h5>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center">
            <Card.Body className="py-3">
              <h6 className="text-muted small text-uppercase">Present</h6>
              <h5 className="fw-bold mb-0">
                {filteredAttendance.length} days
              </h5>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center">
            <Card.Body className="py-3">
              <h6 className="text-muted small text-uppercase">Absent</h6>
              <h5 className="fw-bold mb-0">{absentDates.length} days</h5>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 text-center">
            <Card.Body className="py-3">
              <h6 className="text-muted small text-uppercase">Total</h6>
              <h5 className="fw-bold mb-0">
                {filteredAttendance.length + absentDates.length} days
              </h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PRESENT TABLE */}
      <Row className="g-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold mb-0">Present Days</h5>
            </Card.Header>

            <Card.Body className="p-4">
              {loadingPresentAbsent ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : filteredAttendance.length > 0 ? (
                <div className="table-responsive">
                  <Table borderless hover striped className="align-middle mb-0">
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
                            <Clock size={14} className="text-muted me-1" />
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
                              <Badge bg="secondary" className="px-3 py-2">
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
                                className="px-3 py-2"
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
                  No present records for this month
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* ABSENT TABLE */}
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold mb-0">Absent Days</h5>
            </Card.Header>

            <Card.Body className="p-4">
              {loadingPresentAbsent ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
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
                            <Badge bg="danger" className="px-3 py-2">
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
                  No absences for this month 🎉
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PresentAbsentTab;