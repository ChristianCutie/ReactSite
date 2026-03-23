import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Badge,
  Button,
  Table,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import {
  Clock,
  DoorOpen,
  ThreeDots,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const OverviewTab = ({
  formattedDate,
  formattedTime,
  loadingSummary,
  badgeVariant,
  badgeText,
  summary,
  liveHoursToday,
  statusText,
  handleClockIn,
  handleOpenAdjustModal,
  setShowReportModal,
  loadingIn,
  loadingOut,
  isClockOutDisabled,
  showDropdown,
  setShowDropdown,
  formatDate,
  formatTimeRange,
  formatHoursWorked,
}) => {
  const ROWS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset pagination when recent attendance data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [summary?.recentAttendance?.length]);

  // Calculate paginated recent attendance data
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedRecentAttendance =
    summary?.recentAttendance?.slice(startIndex, endIndex) || [];
  const totalPages = Math.ceil(
    (summary?.recentAttendance?.length || 0) / ROWS_PER_PAGE,
  );

  // Pagination component renderer
  const PaginationControls = ({ currentPage, setCurrentPage, totalPages }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div className="text-muted small">
          Page {currentPage} of {totalPages}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "primary" : "outline-secondary"}
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
    );
  };
  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-0 attendance-date">{formattedDate}</h5>
          <p className="attendance-time text-muted">{formattedTime}</p>
        </div>

        {loadingSummary ? (
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
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
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            </div>
          ) : (
            <Row className="align-items-center">
              <Col md={6}>
                <div className="mb-3">
                  <small className="text-uppercase text-muted">
                    CLOCK IN TIME
                  </small>
                  <h3 className="fw-bold">{summary.clockInTime || "---"}</h3>
                </div>

                <div>
                  <small className="text-uppercase text-muted">
                    HOURS TODAY
                  </small>
                  <h3 className="fw-bold">{liveHoursToday.toFixed(2)} hrs</h3>
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
                  <small className="text-uppercase text-muted">STATUS</small>
                  <h3 className="fw-bold">{statusText}</h3>
                </div>

                <div className="d-flex gap-2 justify-content-md-end">
                  <Button
                    variant="success"
                    size="sm"
                    className="px-3"
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
                    className="px-3"
                    onClick={() => setShowReportModal(true)}
                    disabled={
                      !summary.isClockedIn ||
                      loadingSummary ||
                      isClockOutDisabled ||
                      loadingIn ||
                      loadingOut
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
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="text-muted">THIS WEEK</h6>
              <h2 className="fw-bold">
                {loadingSummary ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  `${summary.weekHours.toFixed(2)} hrs`
                )}
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="text-muted">THIS MONTH</h6>
              <h2 className="fw-bold">
                {loadingSummary ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  `${summary.monthHours.toFixed(2)} hrs`
                )}
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="text-muted">ATTENDANCE</h6>
              <h2 className="fw-bold">
                {loadingSummary ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
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
                  />

                  <Dropdown.Menu>
                    <Dropdown.Item>Request to clock in</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>

            <div className="table-responsive">
              <Table hover borderless striped className="align-middle mb-0">
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
                  {paginatedRecentAttendance.map((record, index) => (
                    <tr key={record.id || index}>
                      <td className="fw-medium">
                        {formatDate(record.clock_in)}
                      </td>

                      <td>
                        {record.status === "Present" ? (
                          <Badge bg="success">Present</Badge>
                        ) : record.status === "Pending" ? (
                          <Badge bg="warning">Pending</Badge>
                        ) : (
                          <Badge bg="danger">Absent</Badge>
                        )}
                      </td>

                      <td>
                        {record.adjustment_status === "approved" ? (
                          <Badge bg="success">Approved</Badge>
                        ) : record.adjustment_status === "pending" ? (
                          <Badge bg="warning">Pending</Badge>
                        ) : (
                          <Badge bg="secondary">No Adjustment</Badge>
                        )}
                      </td>

                      <td>
                        {formatTimeRange(record.clock_in, record.clock_out)}
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
            <PaginationControls
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default React.memo(OverviewTab);
