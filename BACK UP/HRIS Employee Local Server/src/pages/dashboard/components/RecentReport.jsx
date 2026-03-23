import React, { useState, useCallback } from "react";
import { Card, Table, Button, Modal, Row, Col } from "react-bootstrap";
import { JournalText, Eye } from "react-bootstrap-icons";

const RecentReport = ({ recentReports = [] }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Helper function to strip HTML and truncate text
  const getPlainText = useCallback((html) => {
    if (!html) return "No details provided";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }, []);

  const truncateText = useCallback((text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }, []);

  return (
    <>
      <Card className="dashboard-card-modern">
        <Card.Header className="card-header-custom">
          <h5>Recent Reports</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless striped responsive className="dashboard-table">
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
                    <JournalText size={48} className="mb-3 text-muted" />
                    <p className="text-muted">No reports available</p>
                  </td>
                </tr>
              ) : (
                recentReports.map((report) => (
                  <tr key={report.id}>
                    <td className="report-id-cell">
                      <span className="badge bg-primary">#{report.id}</span>
                    </td>
                    <td>
                      <span className="report-time">
                        {new Date(report.clock_out).toLocaleTimeString()}
                      </span>
                    </td>
                    <td>
                      <span className="report-date">
                        {new Date(report.clock_out).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="report-details">
                        {truncateText(getPlainText(report.report_today), 40)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">Submitted</span>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="action-btn"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportModal(true);
                        }}
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
        </Card.Body>
      </Card>

      {/* REPORT DETAILS MODAL */}
      <Modal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Report Details #{selectedReport?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block">Date</small>
                    <strong>
                      {new Date(selectedReport.clock_out).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted d-block">Time</small>
                    <strong>
                      {new Date(selectedReport.clock_out).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        },
                      )}
                    </strong>
                  </div>
                </Col>
              </Row>

              <div className="mb-4">
                <h6 className="fw-bold mb-3">Report Content</h6>
                <div
                  className="report-full-content p-4 bg-light rounded"
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedReport.report_today ||
                        "<p class='text-muted'>No content provided</p>",
                    }}
                  />
                </div>
              </div>

              <div className="text-muted small">
                <strong>Report ID:</strong> #{selectedReport.id} |
                <strong> Status:</strong> Submitted
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowReportModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default React.memo(RecentReport);
